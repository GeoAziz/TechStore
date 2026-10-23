import {
  enqueueAnalyticsEventTx,
  claimOutboxJobs,
  enqueueAnalyticsEvent,
} from '@/lib/analytics/outbox';
import { processOutboxJob, resolveActiveConsent } from '@/lib/analytics/mp-dispatcher';
import {
  buildDeterministicOutboxId,
  AnalyticsOutboxJob,
  OUTBOX_COLLECTION,
} from '@/lib/analytics/outbox-types';
import { GA4PurchaseEvent, GA4RefundEvent } from '@/contracts/analytics/events';

// Mock Firestore DB for testing
const mockStore = new Map<string, any>();

jest.mock('@/lib/firebase-admin', () => ({
  db: {
    collection: (col: string) => ({
      doc: (id: string) => ({
        id,
        ref: { id },
        get: jest.fn().mockImplementation(async () => {
          const key = `${col}/${id}`;
          const exists = mockStore.has(key);
          return {
            exists,
            id,
            data: () => mockStore.get(key),
          };
        }),
        set: jest.fn().mockImplementation(async (data: any) => {
          mockStore.set(`${col}/${id}`, data);
        }),
        update: jest.fn().mockImplementation(async (data: any) => {
          const key = `${col}/${id}`;
          const current = mockStore.get(key) || {};
          mockStore.set(key, { ...current, ...data });
        }),
      }),
      where: () => ({
        limit: () => ({
          get: jest.fn().mockImplementation(async () => {
            const docs: any[] = [];
            for (const [key, val] of mockStore.entries()) {
              if (key.startsWith(`${col}/`)) {
                docs.push({
                  id: val.id,
                  ref: { id: val.id },
                  data: () => val,
                });
              }
            }
            return { docs };
          }),
        }),
      }),
    }),
    runTransaction: jest.fn().mockImplementation(async (fn: any) => {
      const fakeTx = {
        get: async (docRef: any) => {
          const key = `${OUTBOX_COLLECTION}/${docRef.id}`;
          const exists = mockStore.has(key);
          return {
            exists,
            id: docRef.id,
            data: () => mockStore.get(key),
          };
        },
        set: (docRef: any, data: any) => {
          mockStore.set(`${OUTBOX_COLLECTION}/${docRef.id}`, data);
        },
        update: (docRef: any, data: any) => {
          const key = `${OUTBOX_COLLECTION}/${docRef.id}`;
          const current = mockStore.get(key) || {};
          mockStore.set(key, { ...current, ...data });
        },
      };
      return fn(fakeTx);
    }),
  },
}));

describe('Phase 2 Commerce Tracking: Outbox, Idempotency & MP Dispatcher', () => {
  beforeEach(() => {
    mockStore.clear();
    process.env.GA4_MEASUREMENT_ID = 'G-TEST12345';
    process.env.GA4_API_SECRET = 'secret_test_xyz';
  });

  const samplePurchase: GA4PurchaseEvent = {
    event: 'purchase',
    transaction_id: 'ORDER-1001',
    currency: 'KES',
    value: 245000,
    shipping: 1000,
    tax: 39200,
    items: [
      {
        item_id: 'item-1',
        item_name: 'MacBook Pro',
        price: 245000,
        quantity: 1,
      },
    ],
  };

  describe('1. Deterministic Idempotency & Outbox State Machine', () => {
    it('generates deterministic outbox document IDs', () => {
      expect(buildDeterministicOutboxId('ORD-1', 'purchase')).toBe('ORD-1');
      expect(buildDeterministicOutboxId('ORD-1', 'refund', 'ref-99')).toBe('ORD-1_refund_ref-99');
      expect(buildDeterministicOutboxId('ORD-1', 'order_cancelled')).toBe('ORD-1_order_cancelled');
    });

    it('prevents duplicate outbox enqueue on duplicate webhook retries', async () => {
      // First attempt
      const res1 = await enqueueAnalyticsEvent({
        orderId: 'ORDER-1001',
        eventType: 'purchase',
        userId: 'user-1',
        clientId: '1234.5678',
        consentSnapshot: { analytics: true, marketing: true },
        payload: samplePurchase,
      });

      expect(res1.enqueued).toBe(true);
      expect(res1.jobId).toBe('ORDER-1001');

      // Replay / Duplicate webhook attempt
      const res2 = await enqueueAnalyticsEvent({
        orderId: 'ORDER-1001',
        eventType: 'purchase',
        userId: 'user-1',
        clientId: '1234.5678',
        consentSnapshot: { analytics: true, marketing: true },
        payload: samplePurchase,
      });

      expect(res2.enqueued).toBe(false);
      expect(res2.jobId).toBe('ORDER-1001');
    });

    it('claims pending jobs with lease timestamps and avoids race conditions', async () => {
      await enqueueAnalyticsEvent({
        orderId: 'ORDER-2001',
        eventType: 'purchase',
        consentSnapshot: { analytics: true, marketing: true },
        payload: samplePurchase,
      });

      const claimed = await claimOutboxJobs(5);
      expect(claimed.length).toBe(1);
      expect(claimed[0].status).toBe('PROCESSING');
      expect(claimed[0].leaseExpiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe('2. Active Consent Enforcement & Pre-Dispatch Revocation', () => {
    it('skips dispatch if user revoked consent after checkout', async () => {
      // Mock user document having revoked analytics consent
      mockStore.set('users/user-consent-revoked', {
        cookiePreferences: { essential: true, analytics: false, marketing: false },
      });

      const job: AnalyticsOutboxJob = {
        id: 'ORDER-3001',
        orderId: 'ORDER-3001',
        userId: 'user-consent-revoked',
        eventType: 'purchase',
        status: 'PROCESSING',
        consentSnapshot: { analytics: true, marketing: true }, // snapshot had consent at checkout
        payload: samplePurchase,
        retries: 0,
        maxRetries: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockStore.set(`${OUTBOX_COLLECTION}/ORDER-3001`, job);

      const hasActiveConsent = await resolveActiveConsent(job);
      expect(hasActiveConsent).toBe(false);

      const mockFetch = jest.fn();
      const result = await processOutboxJob(job, mockFetch as any);

      expect(result.status).toBe('SKIPPED_CONSENT');
      expect(mockFetch).not.toHaveBeenCalled();

      const storedJob = mockStore.get(`${OUTBOX_COLLECTION}/ORDER-3001`);
      expect(storedJob.status).toBe('SKIPPED_CONSENT');
    });
  });

  describe('3. Durable Dispatch, Retries & Dead-Letter Handling', () => {
    it('successfully transitions to DISPATCHED on HTTP 200/204', async () => {
      const job: AnalyticsOutboxJob = {
        id: 'ORDER-4001',
        orderId: 'ORDER-4001',
        eventType: 'purchase',
        status: 'PROCESSING',
        clientId: 'ga.1234',
        sessionId: '1700000000',
        consentSnapshot: { analytics: true, marketing: true },
        payload: samplePurchase,
        retries: 0,
        maxRetries: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockStore.set(`${OUTBOX_COLLECTION}/ORDER-4001`, job);

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'OK',
      });

      const result = await processOutboxJob(job, mockFetch as any);

      expect(result.status).toBe('DISPATCHED');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const stored = mockStore.get(`${OUTBOX_COLLECTION}/ORDER-4001`);
      expect(stored.status).toBe('DISPATCHED');
      expect(stored.dispatchedAt).toBeDefined();
    });

    it('schedules retry with exponential backoff on recoverable 5xx error', async () => {
      const job: AnalyticsOutboxJob = {
        id: 'ORDER-5001',
        orderId: 'ORDER-5001',
        eventType: 'purchase',
        status: 'PROCESSING',
        consentSnapshot: { analytics: true, marketing: true },
        payload: samplePurchase,
        retries: 1,
        maxRetries: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockStore.set(`${OUTBOX_COLLECTION}/ORDER-5001`, job);

      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => 'Service Unavailable',
      });

      const result = await processOutboxJob(job, mockFetch as any);

      expect(result.status).toBe('RETRY_SCHEDULED');
      const stored = mockStore.get(`${OUTBOX_COLLECTION}/ORDER-5001`);
      expect(stored.status).toBe('PENDING');
      expect(stored.retries).toBe(2);
      expect(stored.leaseExpiresAt).toBeGreaterThan(Date.now());
    });

    it('transitions immediately to FAILED (dead-letter) on unrecoverable 400 Bad Request', async () => {
      const job: AnalyticsOutboxJob = {
        id: 'ORDER-6001',
        orderId: 'ORDER-6001',
        eventType: 'purchase',
        status: 'PROCESSING',
        consentSnapshot: { analytics: true, marketing: true },
        payload: samplePurchase,
        retries: 0,
        maxRetries: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockStore.set(`${OUTBOX_COLLECTION}/ORDER-6001`, job);

      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad Request: Invalid parameter',
      });

      const result = await processOutboxJob(job, mockFetch as any);

      expect(result.status).toBe('FAILED');
      const stored = mockStore.get(`${OUTBOX_COLLECTION}/ORDER-6001`);
      expect(stored.status).toBe('FAILED');
    });
  });
});

