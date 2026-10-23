import { db } from '@/lib/firebase-admin';
import {
  AnalyticsOutboxJob,
  OUTBOX_COLLECTION,
  LEASE_DURATION_MS,
  buildDeterministicOutboxId,
  DEFAULT_MAX_RETRIES,
} from './outbox-types';
import { GA4CommerceEvent } from '@/contracts/analytics/events';
import { sanitizeAnalyticsPayload } from '@/contracts/analytics/privacy';

/**
 * Idempotently enqueues an analytics event inside a Firestore transaction.
 * If the deterministic outbox document already exists, it is NOT overwritten.
 */
export async function enqueueAnalyticsEventTx(
  transaction: FirebaseFirestore.Transaction,
  params: {
    orderId: string;
    eventType: 'purchase' | 'refund' | 'order_cancelled';
    actionId?: string;
    userId?: string;
    clientId?: string;
    sessionId?: string;
    consentSnapshot: {
      analytics: boolean;
      marketing: boolean;
    };
    payload: GA4CommerceEvent;
  }
): Promise<{ enqueued: boolean; jobId: string }> {
  const jobId = buildDeterministicOutboxId(params.orderId, params.eventType, params.actionId);
  const outboxRef = db.collection(OUTBOX_COLLECTION).doc(jobId);

  const existingDoc = await transaction.get(outboxRef);
  if (existingDoc.exists) {
    // Already enqueued idempotently
    return { enqueued: false, jobId };
  }

  const now = new Date().toISOString();
  const sanitizedPayload = sanitizeAnalyticsPayload(params.payload);

  const job: AnalyticsOutboxJob = {
    id: jobId,
    orderId: params.orderId,
    userId: params.userId ?? null,
    eventType: params.eventType,
    status: 'PENDING',
    clientId: params.clientId ?? null,
    sessionId: params.sessionId ?? null,
    consentSnapshot: params.consentSnapshot,
    payload: sanitizedPayload,
    retries: 0,
    maxRetries: DEFAULT_MAX_RETRIES,
    createdAt: now,
    updatedAt: now,
  };

  transaction.set(outboxRef, job);
  return { enqueued: true, jobId };
}

/**
 * Directly writes an outbox job outside an external transaction if needed (uses its own atomic transaction).
 */
export async function enqueueAnalyticsEvent(
  params: Parameters<typeof enqueueAnalyticsEventTx>[1]
): Promise<{ enqueued: boolean; jobId: string }> {
  return db.runTransaction(async (transaction) => {
    return enqueueAnalyticsEventTx(transaction, params);
  });
}

/**
 * Claims a batch of pending or expired-lease outbox jobs for processing.
 */
export async function claimOutboxJobs(batchSize: number = 10): Promise<AnalyticsOutboxJob[]> {
  const now = Date.now();
  const snapshot = await db
    .collection(OUTBOX_COLLECTION)
    .where('status', 'in', ['PENDING', 'PROCESSING'])
    .limit(batchSize)
    .get();

  const claimedJobs: AnalyticsOutboxJob[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data() as AnalyticsOutboxJob;

    // If PROCESSING, only claim if lease has expired
    if (data.status === 'PROCESSING' && data.leaseExpiresAt && data.leaseExpiresAt > now) {
      continue;
    }

    // Try to atomically claim
    const claimed = await db.runTransaction(async (tx) => {
      const freshDoc = await tx.get(doc.ref);
      if (!freshDoc.exists) return null;
      const freshData = freshDoc.data() as AnalyticsOutboxJob;

      if (
        freshData.status === 'PENDING' ||
        (freshData.status === 'PROCESSING' && (!freshData.leaseExpiresAt || freshData.leaseExpiresAt <= now))
      ) {
        const leaseExpiresAt = now + LEASE_DURATION_MS;
        tx.update(doc.ref, {
          status: 'PROCESSING',
          leaseExpiresAt,
          updatedAt: new Date().toISOString(),
        });
        return { ...freshData, status: 'PROCESSING', leaseExpiresAt } as AnalyticsOutboxJob;
      }
      return null;
    });

    if (claimed) {
      claimedJobs.push(claimed);
    }
  }

  return claimedJobs;
}

