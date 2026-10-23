import {
  GA4ViewItemListSchema,
  GA4SelectItemSchema,
  GA4ViewItemSchema,
  GA4AddToCartSchema,
  GA4RemoveFromCartSchema,
  GA4ViewCartSchema,
  GA4BeginCheckoutSchema,
  GA4AddShippingInfoSchema,
  GA4AddPaymentInfoSchema,
  GA4PurchaseSchema,
  GA4RefundSchema,
  GA4OrderCancelledSchema,
} from '@/contracts/analytics/events';
import { Money } from '@/contracts/analytics/money';
import {
  validateFinancialInvariants,
  validateRefundInvariants,
  CanonicalOrderAccounting,
} from '@/contracts/analytics/invariants';
import { sanitizeAnalyticsPayload, sanitizeString } from '@/contracts/analytics/privacy';
import { tracker } from '@/lib/analytics/tracker';

describe('Phase 1 Foundation: Central Event Contracts & Privacy', () => {
  describe('1. Full-Funnel Event Schemas & Validation', () => {
    it('validates view_item_list with required items array', () => {
      const valid = GA4ViewItemListSchema.safeParse({
        event: 'view_item_list',
        item_list_name: 'Laptops',
        items: [
          {
            item_id: 'macbook-m3',
            item_name: 'MacBook Pro M3 Max',
            price: 245000,
            quantity: 1,
            item_category: 'Laptops',
          },
        ],
      });
      expect(valid.success).toBe(true);

      const invalid = GA4ViewItemListSchema.safeParse({
        event: 'view_item_list',
        items: [], // Must have at least 1
      });
      expect(invalid.success).toBe(false);
    });

    it('validates select_item expects exactly 1 item', () => {
      const valid = GA4SelectItemSchema.safeParse({
        event: 'select_item',
        item_list_name: 'Audio',
        items: [
          {
            item_id: 'sony-xm5',
            item_name: 'Sony WH-1000XM5',
            price: 45000,
            quantity: 1,
          },
        ],
      });
      expect(valid.success).toBe(true);

      const invalid = GA4SelectItemSchema.safeParse({
        event: 'select_item',
        items: [
          { item_id: '1', item_name: 'Item 1', price: 10, quantity: 1 },
          { item_id: '2', item_name: 'Item 2', price: 20, quantity: 1 },
        ],
      });
      expect(invalid.success).toBe(false);
    });

    it('validates checkout funnel events: add_shipping_info & add_payment_info', () => {
      const shippingResult = GA4AddShippingInfoSchema.safeParse({
        event: 'add_shipping_info',
        currency: 'KES',
        value: 155000,
        shipping_tier: 'Express Courier (Nairobi Metro)',
        items: [
          {
            item_id: 's24-ultra',
            item_name: 'Samsung Galaxy S24 Ultra',
            price: 155000,
            quantity: 1,
          },
        ],
      });
      expect(shippingResult.success).toBe(true);

      const paymentResult = GA4AddPaymentInfoSchema.safeParse({
        event: 'add_payment_info',
        currency: 'KES',
        value: 155000,
        payment_type: 'mpesa',
        items: [
          {
            item_id: 's24-ultra',
            item_name: 'Samsung Galaxy S24 Ultra',
            price: 155000,
            quantity: 1,
          },
        ],
      });
      expect(paymentResult.success).toBe(true);

      const invalidPayment = GA4AddPaymentInfoSchema.safeParse({
        event: 'add_payment_info',
        currency: 'KES',
        value: 155000,
        payment_type: 'crypto' as any, // Not allowed
        items: [
          {
            item_id: 's24-ultra',
            item_name: 'Samsung Galaxy S24 Ultra',
            price: 155000,
            quantity: 1,
          },
        ],
      });
      expect(invalidPayment.success).toBe(false);
    });

    it('validates post-purchase refund and custom order_cancelled events', () => {
      const refundResult = GA4RefundSchema.safeParse({
        event: 'refund',
        transaction_id: 'TXN-998822',
        currency: 'KES',
        value: 45000,
        items: [
          {
            item_id: 'sony-xm5',
            item_name: 'Sony WH-1000XM5',
            price: 45000,
            quantity: 1,
          },
        ],
      });
      expect(refundResult.success).toBe(true);

      const cancelResult = GA4OrderCancelledSchema.safeParse({
        event: 'order_cancelled',
        transaction_id: 'TXN-998822',
        currency: 'KES',
        value: 45000,
        cancellation_reason: 'Customer requested change of delivery address',
        cancelled_by: 'customer',
      });
      expect(cancelResult.success).toBe(true);
    });
  });

  describe('2. Financial Invariants & Arithmetic Integrity', () => {
    it('validates canonical order accounting against purchase event', () => {
      const order: CanonicalOrderAccounting = {
        orderId: 'ORD-001',
        currency: 'KES',
        items: [
          {
            id: 'item-1',
            name: 'Apple MacBook Pro',
            unitPriceGross: Money.fromCents(25000000, 'KES'), // 250,000.00 KES
            unitDiscount: Money.fromCents(500000, 'KES'),     // 5,000.00 KES
            netUnitPrice: Money.fromCents(24500000, 'KES'),    // 245,000.00 KES
            quantity: 1,
            totalNetPrice: Money.fromCents(24500000, 'KES'),
          },
        ],
        subtotalNet: Money.fromCents(24500000, 'KES'),
        shipping: Money.fromCents(100000, 'KES'), // 1,000.00 KES
        tax: Money.fromCents(3920000, 'KES'),     // 39,200.00 KES (16% VAT)
        orderLevelDiscount: Money.fromCents(0, 'KES'),
        totalCharge: Money.fromCents(28520000, 'KES'), // 245000 + 1000 + 39200 = 285,200.00 KES
      };

      const validPurchase = {
        event: 'purchase' as const,
        transaction_id: 'ORD-001',
        currency: 'KES' as const,
        value: 245000.0, // net subtotal
        shipping: 1000.0,
        tax: 39200.0,
        items: [
          {
            item_id: 'item-1',
            item_name: 'Apple MacBook Pro',
            price: 245000.0,
            quantity: 1,
          },
        ],
      };

      const result = validateFinancialInvariants(order, validPurchase, 28520000);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects and rejects processor charge mismatches and value float drift', () => {
      const order: CanonicalOrderAccounting = {
        orderId: 'ORD-002',
        currency: 'USD',
        items: [
          {
            id: 'item-2',
            name: 'USB-C Hub',
            unitPriceGross: Money.fromCents(1999, 'USD'),
            unitDiscount: Money.fromCents(0, 'USD'),
            netUnitPrice: Money.fromCents(1999, 'USD'),
            quantity: 2,
            totalNetPrice: Money.fromCents(3998, 'USD'),
          },
        ],
        subtotalNet: Money.fromCents(3998, 'USD'),
        shipping: Money.fromCents(500, 'USD'),
        tax: Money.fromCents(0, 'USD'),
        orderLevelDiscount: Money.fromCents(0, 'USD'),
        totalCharge: Money.fromCents(4498, 'USD'),
      };

      const mismatchedPurchase = {
        event: 'purchase' as const,
        transaction_id: 'ORD-002',
        currency: 'USD' as const,
        value: 40.0, // Should be 39.98
        items: [
          {
            item_id: 'item-2',
            item_name: 'USB-C Hub',
            price: 20.0,
            quantity: 2,
          },
        ],
      };

      const result = validateFinancialInvariants(order, mismatchedPurchase, 4498);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('enforces refund invariants against original order total', () => {
      const order: CanonicalOrderAccounting = {
        orderId: 'ORD-003',
        currency: 'KES',
        items: [],
        subtotalNet: Money.fromCents(10000, 'KES'),
        shipping: Money.fromCents(1000, 'KES'),
        tax: Money.fromCents(1600, 'KES'),
        orderLevelDiscount: Money.fromCents(0, 'KES'),
        totalCharge: Money.fromCents(12600, 'KES'),
      };

      // Valid refund
      const validRefund = {
        event: 'refund' as const,
        transaction_id: 'ORD-003',
        currency: 'KES' as const,
        value: 126.0,
      };
      expect(validateRefundInvariants(order, validRefund).valid).toBe(true);

      // Excessive refund exceeding original charge
      const excessiveRefund = {
        event: 'refund' as const,
        transaction_id: 'ORD-003',
        currency: 'KES' as const,
        value: 200.0,
      };
      const invalidResult = validateRefundInvariants(order, excessiveRefund);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors[0]).toMatch(/cannot exceed original total charged/);
    });
  });

  describe('3. PII Sanitization Guard (KDPA 2019 / GDPR)', () => {
    it('scrubs customer email, Kenyan phone number, and credit card from payload', () => {
      const rawPayload = {
        event: 'purchase',
        transaction_id: 'ORD-12345',
        currency: 'KES',
        value: 155000,
        email: 'customer@gmail.com',
        phone: '+254712345678',
        card: '4111 2222 3333 4444',
        user_notes: 'Please call me at 0712345678 or write to test@domain.ke upon arrival',
        items: [
          {
            item_id: 'item-1',
            item_name: 'Standard Laptop with ID 12345678',
            price: 155000,
            quantity: 1,
          },
        ],
      };

      const sanitized = sanitizeAnalyticsPayload(rawPayload) as any;

      // Sensitive keys must be completely stripped
      expect(sanitized.email).toBeUndefined();
      expect(sanitized.phone).toBeUndefined();
      expect(sanitized.card).toBeUndefined();

      // Free-text strings must have PII masked
      expect(sanitized.user_notes).not.toContain('0712345678');
      expect(sanitized.user_notes).not.toContain('test@domain.ke');
      expect(sanitized.user_notes).toContain('[REDACTED]');
    });
  });

  describe('4. Consent Lifecycle & SPA PageView Deduplication', () => {
    beforeEach(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    it('blocks event dispatch when cookie consent is denied', async () => {
      localStorage.setItem(
        'techstore_cookie_consent',
        JSON.stringify({ essential: true, analytics: false, marketing: false })
      );

      const result = await tracker.track({
        event: 'view_item',
        currency: 'KES',
        value: 1000,
        items: [{ item_id: 'item-1', item_name: 'Test', price: 1000, quantity: 1 }],
      });

      expect(result.success).toBe(false);
      expect(result.blockedReason).toBe('CONSENT_DENIED');
    });

    it('permits event dispatch when cookie consent is granted', async () => {
      localStorage.setItem(
        'techstore_cookie_consent',
        JSON.stringify({ essential: true, analytics: true, marketing: true })
      );

      const result = await tracker.track({
        event: 'view_item',
        currency: 'KES',
        value: 1000,
        items: [{ item_id: 'item-1', item_name: 'Test', price: 1000, quantity: 1 }],
      });

      expect(result.success).toBe(true);
      expect(result.event).toBeDefined();
    });

    it('suppresses duplicate client-side page views on identical Next.js route navigation', () => {
      localStorage.setItem(
        'techstore_cookie_consent',
        JSON.stringify({ essential: true, analytics: true, marketing: true })
      );

      const firstVisit = tracker.trackPageView('/shop/laptops');
      expect(firstVisit).toBe(true);

      const duplicateVisit = tracker.trackPageView('/shop/laptops');
      expect(duplicateVisit).toBe(false);

      const differentRoute = tracker.trackPageView('/shop/audio');
      expect(differentRoute).toBe(true);
    });
  });
});

