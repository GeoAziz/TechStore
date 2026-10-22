import { tracker } from '@/lib/analytics/tracker';
import { getCookieConsent } from '@/components/compliance/cookie-consent';

jest.mock('@/components/compliance/cookie-consent', () => ({
  getCookieConsent: jest.fn(),
}));

describe('Storefront Analytics Tracker Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('blocks dispatch when cookie consent is denied', async () => {
    (getCookieConsent as jest.Mock).mockReturnValue({
      essential: true,
      analytics: false,
      marketing: false,
    });

    const result = await tracker.track({
      event: 'view_item',
      currency: 'KES',
      value: 199.99,
      items: [{ item_id: 'prod_1', item_name: 'Test', price: 199.99, quantity: 1 }],
    });

    expect(result.success).toBe(false);
    expect(result.blockedReason).toBe('CONSENT_DENIED');
  });

  it('allows dispatch when cookie consent is granted', async () => {
    (getCookieConsent as jest.Mock).mockReturnValue({
      essential: true,
      analytics: true,
      marketing: true,
    });

    const result = await tracker.track({
      event: 'view_item',
      currency: 'KES',
      value: 199.99,
      items: [{ item_id: 'prod_1', item_name: 'Test', price: 199.99, quantity: 1 }],
    });

    expect(result.success).toBe(true);
    expect(result.event?.event).toBe('view_item');
  });

  it('suppresses duplicate purchase events for the same transaction ID', async () => {
    (getCookieConsent as jest.Mock).mockReturnValue({
      essential: true,
      analytics: true,
      marketing: true,
    });

    const txId = 'ord_idempotency_unit_1';
    const purchaseEvent = {
      event: 'purchase' as const,
      transaction_id: txId,
      currency: 'KES' as const,
      value: 500.00,
      items: [{ item_id: 'prod_1', item_name: 'Test', price: 500.00, quantity: 1 }],
    };

    // First attempt -> Succeeds
    const firstResult = await tracker.track(purchaseEvent);
    expect(firstResult.success).toBe(true);

    // Second attempt (e.g. page refresh) -> Suppressed
    const secondResult = await tracker.track(purchaseEvent);
    expect(secondResult.success).toBe(false);
    expect(secondResult.blockedReason).toBe('DUPLICATE_SUPPRESSED');
  });
});
