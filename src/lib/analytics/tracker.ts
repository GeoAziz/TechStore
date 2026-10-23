import { getCookieConsent } from '@/components/compliance/cookie-consent';
import { GA4CommerceEvent } from '@/contracts/analytics/events';
import { sanitizeAnalyticsPayload } from '@/contracts/analytics/privacy';
import { app } from '@/lib/firebase';

export interface DispatchResult {
  readonly success: boolean;
  readonly blockedReason?: 'CONSENT_DENIED' | 'DUPLICATE_SUPPRESSED' | 'INVALID_EVENT';
  readonly event?: GA4CommerceEvent;
}

export class StorefrontAnalyticsTracker {
  private static instance: StorefrontAnalyticsTracker;
  private dispatchedPurchases = new Set<string>();
  private trackedPageViews = new Set<string>();

  private constructor() {
    // Rehydrate dispatched purchases from sessionStorage if in browser
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('techstore_dispatched_purchases');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            list.forEach(id => this.dispatchedPurchases.add(id));
          }
        }
      } catch {
        // Safe fallback
      }

      // Listen for consent changes and reset/purge if consent was withdrawn
      window.addEventListener('techstore:consent_changed', ((e: CustomEvent) => {
        const prefs = e.detail;
        if (!prefs || !prefs.analytics) {
          this.dispatchedPurchases.clear();
          this.trackedPageViews.clear();
          try {
            sessionStorage.removeItem('techstore_dispatched_purchases');
          } catch {
            // Safe fallback
          }
        }
      }) as EventListener);
    }
  }

  static getInstance(): StorefrontAnalyticsTracker {
    if (!StorefrontAnalyticsTracker.instance) {
      StorefrontAnalyticsTracker.instance = new StorefrontAnalyticsTracker();
    }
    return StorefrontAnalyticsTracker.instance;
  }

  /**
   * Deduplicates client-side page views on Next.js SPA navigations.
   * Returns true if newly tracked, false if duplicate suppression triggered.
   */
  trackPageView(urlPath: string): boolean {
    const consent = getCookieConsent();
    if (!consent || !consent.analytics) {
      return false;
    }
    if (this.trackedPageViews.has(urlPath)) {
      return false;
    }
    this.trackedPageViews.add(urlPath);
    return true;
  }

  /**
   * Dispatches an event through the storefront consent, PII sanitization, and idempotency gate.
   */
  async track(event: GA4CommerceEvent): Promise<DispatchResult> {
    if (typeof window === 'undefined') {
      return { success: false, blockedReason: 'INVALID_EVENT' };
    }

    // 1. Consent Gate Check
    const consent = getCookieConsent();
    if (!consent || !consent.analytics) {
      return { success: false, blockedReason: 'CONSENT_DENIED' };
    }

    // 2. Idempotency Check for Purchase Events
    if (event.event === 'purchase') {
      const txId = event.transaction_id;
      if (this.dispatchedPurchases.has(txId)) {
        return { success: false, blockedReason: 'DUPLICATE_SUPPRESSED', event };
      }

      // Mark as dispatched
      this.dispatchedPurchases.add(txId);
      try {
        sessionStorage.setItem(
          'techstore_dispatched_purchases',
          JSON.stringify(Array.from(this.dispatchedPurchases))
        );
      } catch {
        // Safe fallback
      }
    }

    // 3. PII Sanitization Guard
    const sanitizedEvent = sanitizeAnalyticsPayload(event);

    // 4. Dispatch to Firebase Analytics client SDK if available
    try {
      const { getAnalytics, logEvent, isSupported } = await import('firebase/analytics');
      const supported = await isSupported();
      if (supported && app) {
        const analytics = getAnalytics(app);
        const { event: eventName, ...params } = sanitizedEvent;
        logEvent(analytics, eventName as any, params as any);
      }
    } catch {
      // In SSR, test, or environments where Firebase Analytics is stubbed, don't throw
    }

    // 5. Dispatch browser custom event for testing and observer tools
    window.dispatchEvent(
      new CustomEvent('techstore:analytics_event', {
        detail: sanitizedEvent,
      })
    );

    return { success: true, event: sanitizedEvent };
  }
}

export const tracker = StorefrontAnalyticsTracker.getInstance();
