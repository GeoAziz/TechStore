import { db } from '@/lib/firebase-admin';
import { AnalyticsOutboxJob, OUTBOX_COLLECTION } from './outbox-types';
import { serializeToGA4Payload } from '@/analytics-qa/adapters/ga4-serializer';

export interface DispatchResponse {
  jobId: string;
  status: 'DISPATCHED' | 'SKIPPED_CONSENT' | 'RETRY_SCHEDULED' | 'FAILED';
  error?: string;
}

/**
 * Checks if the user's latest consent allows analytics tracking.
 * Prioritizes latest user document if authenticated, else falls back to checkout snapshot.
 */
export async function resolveActiveConsent(job: AnalyticsOutboxJob): Promise<boolean> {
  if (job.userId) {
    try {
      const userDoc = await db.collection('users').doc(job.userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData?.cookiePreferences && typeof userData.cookiePreferences.analytics === 'boolean') {
          return userData.cookiePreferences.analytics;
        }
      }
    } catch {
      // safe fallback to snapshot
    }
  }
  return Boolean(job.consentSnapshot?.analytics);
}

/**
 * Dispatches a single claimed outbox job to GA4 Measurement Protocol with backoff and dead-letter handling.
 */
export async function processOutboxJob(
  job: AnalyticsOutboxJob,
  fetchFn: typeof fetch = fetch
): Promise<DispatchResponse> {
  const jobRef = db.collection(OUTBOX_COLLECTION).doc(job.id);

  // 1. Enforce live consent policy
  const hasConsent = await resolveActiveConsent(job);
  if (!hasConsent) {
    await jobRef.update({
      status: 'SKIPPED_CONSENT',
      updatedAt: new Date().toISOString(),
      lastError: 'Analytics consent was denied or revoked by the customer.',
    });
    return { jobId: job.id, status: 'SKIPPED_CONSENT' };
  }

  // 2. Prepare GA4 Measurement Protocol payload
  const measurementId = process.env.GA4_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) {
    // If not configured, we don't throw away the job; we backoff or fail safely
    const errorMsg = 'GA4_MEASUREMENT_ID or GA4_API_SECRET missing in server environment.';
    await jobRef.update({
      status: 'FAILED',
      updatedAt: new Date().toISOString(),
      lastError: errorMsg,
    });
    return { jobId: job.id, status: 'FAILED', error: errorMsg };
  }

  const clientId = job.clientId || `srv.${job.orderId}`;
  const payload = serializeToGA4Payload(clientId, job.payload);
  if (job.sessionId) {
    // Inject session_id into event params
    payload.events.forEach(e => {
      e.params.session_id = job.sessionId;
    });
  }

  const isDev = process.env.NODE_ENV !== 'production';
  const url = isDev
    ? `https://www.google-analytics.com/debug/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`
    : `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok || (isDev && res.status === 200)) {
      const now = new Date().toISOString();
      await jobRef.update({
        status: 'DISPATCHED',
        dispatchedAt: now,
        updatedAt: now,
        lastError: null,
      });
      return { jobId: job.id, status: 'DISPATCHED' };
    }

    // 4xx client errors (e.g. 400 Bad Request) are unrecoverable; don't retry endlessly
    const isUnrecoverable = res.status >= 400 && res.status < 500;
    const errorText = await res.text();
    const retries = job.retries + 1;

    if (isUnrecoverable || retries >= job.maxRetries) {
      await jobRef.update({
        status: 'FAILED',
        retries,
        updatedAt: new Date().toISOString(),
        lastError: `HTTP ${res.status}: ${errorText}`,
      });
      return { jobId: job.id, status: 'FAILED', error: errorText };
    }

    // Recoverable server error (5xx or network timeout) -> return to PENDING with exponential lease backoff
    const backoffMs = Math.pow(2, retries) * 1000;
    await jobRef.update({
      status: 'PENDING',
      retries,
      leaseExpiresAt: Date.now() + backoffMs,
      updatedAt: new Date().toISOString(),
      lastError: `HTTP ${res.status}: ${errorText}`,
    });
    return { jobId: job.id, status: 'RETRY_SCHEDULED', error: errorText };
  } catch (err: any) {
    const retries = job.retries + 1;
    const isMax = retries >= job.maxRetries;
    await jobRef.update({
      status: isMax ? 'FAILED' : 'PENDING',
      retries,
      leaseExpiresAt: isMax ? undefined : Date.now() + Math.pow(2, retries) * 1000,
      updatedAt: new Date().toISOString(),
      lastError: err.message || 'Network error',
    });
    return { jobId: job.id, status: isMax ? 'FAILED' : 'RETRY_SCHEDULED', error: err.message };
  }
}

