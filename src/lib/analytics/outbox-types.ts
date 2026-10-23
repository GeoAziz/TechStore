import { GA4CommerceEvent } from '@/contracts/analytics/events';

export type OutboxStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'DISPATCHED'
  | 'SKIPPED_CONSENT'
  | 'FAILED';

export interface AnalyticsOutboxJob {
  /** Deterministic Document ID: e.g. orderId or `${orderId}_refund_${refundId}` */
  id: string;
  orderId: string;
  userId?: string | null;
  eventType: 'purchase' | 'refund' | 'order_cancelled';
  status: OutboxStatus;
  clientId?: string | null;
  sessionId?: string | null;
  consentSnapshot: {
    analytics: boolean;
    marketing: boolean;
  };
  payload: GA4CommerceEvent;
  retries: number;
  maxRetries: number;
  leaseExpiresAt?: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
  dispatchedAt?: string;
}

export function buildDeterministicOutboxId(
  orderId: string,
  eventType: 'purchase' | 'refund' | 'order_cancelled',
  actionId?: string
): string {
  if (eventType === 'purchase') {
    return orderId;
  }
  return actionId ? `${orderId}_${eventType}_${actionId}` : `${orderId}_${eventType}`;
}

export const OUTBOX_COLLECTION = 'analytics_outbox';
export const LEASE_DURATION_MS = 60_000; // 60 seconds lease
export const DEFAULT_MAX_RETRIES = 5;

