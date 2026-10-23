import { GA4PurchaseEvent, GA4RefundEvent } from './events';
import { Money, SupportedCurrency } from './money';

export interface CanonicalOrderItemAccounting {
  readonly id: string;
  readonly name: string;
  readonly unitPriceGross: Money; // Catalog pre-discount price
  readonly unitDiscount: Money;   // Allocated discount per unit
  readonly netUnitPrice: Money;    // unitPriceGross - unitDiscount
  readonly quantity: number;
  readonly totalNetPrice: Money;   // netUnitPrice * quantity
}

export interface CanonicalOrderAccounting {
  readonly orderId: string;
  readonly currency: SupportedCurrency;
  readonly items: CanonicalOrderItemAccounting[];
  readonly subtotalNet: Money;      // sum(totalNetPrice)
  readonly shipping: Money;
  readonly tax: Money;
  readonly orderLevelDiscount: Money;
  readonly totalCharge: Money;       // (subtotalNet - orderLevelDiscount) + shipping + tax
}

export interface FinancialValidationResult {
  readonly valid: boolean;
  readonly errors: string[];
}

/**
 * Validates financial invariants across canonical database order, GA4 purchase event,
 * and processor (Stripe/M-Pesa) charge amount.
 */
export function validateFinancialInvariants(
  order: CanonicalOrderAccounting,
  purchaseEvent: GA4PurchaseEvent,
  processorChargedCents: number
): FinancialValidationResult {
  const errors: string[] = [];

  // 1. Processor payment amount must equal persisted order totalCharge
  if (processorChargedCents !== order.totalCharge.cents) {
    errors.push(
      `Processor charge mismatch: charged ${processorChargedCents} cents, but order total is ${order.totalCharge.cents} cents.`
    );
  }

  // 2. Order total calculation check: totalCharge = (subtotalNet - orderLevelDiscount) + shipping + tax
  const expectedCharge = order.subtotalNet
    .subtract(order.orderLevelDiscount)
    .add(order.shipping)
    .add(order.tax);

  if (!expectedCharge.equals(order.totalCharge)) {
    errors.push(
      `Internal order calculation mismatch: computed ${expectedCharge.cents} cents, but order totalCharge is ${order.totalCharge.cents} cents.`
    );
  }

  // 3. GA4 Currency consistency
  if (purchaseEvent.currency !== order.currency) {
    errors.push(
      `Currency mismatch: GA4 event has ${purchaseEvent.currency}, but order has ${order.currency}.`
    );
  }

  // 4. GA4 purchase.value MUST equal the sum of (item.price * item.quantity)
  let sumItemPriceQuantityCents = 0;
  for (let i = 0; i < purchaseEvent.items.length; i++) {
    const item = purchaseEvent.items[i];
    const itemPriceCents = Math.round(item.price * 100);
    sumItemPriceQuantityCents += itemPriceCents * item.quantity;
  }

  const purchaseValueCents = Math.round(purchaseEvent.value * 100);
  if (purchaseValueCents !== sumItemPriceQuantityCents) {
    errors.push(
      `GA4 item-value self-consistency failure: purchase.value (${purchaseValueCents} cents) != sum(item.price * item.quantity) (${sumItemPriceQuantityCents} cents).`
    );
  }

  // 5. GA4 purchase.value MUST equal canonical net item subtotal
  if (purchaseValueCents !== order.subtotalNet.cents) {
    errors.push(
      `GA4 purchase.value mismatch against canonical accounting: GA4 has ${purchaseValueCents} cents, but canonical net subtotal is ${order.subtotalNet.cents} cents.`
    );
  }

  // 6. Shipping & Tax representation
  if (purchaseEvent.shipping !== undefined) {
    const ga4ShippingCents = Math.round(purchaseEvent.shipping * 100);
    if (ga4ShippingCents !== order.shipping.cents) {
      errors.push(
        `GA4 shipping mismatch: event has ${ga4ShippingCents} cents, order has ${order.shipping.cents} cents.`
      );
    }
  }

  if (purchaseEvent.tax !== undefined) {
    const ga4TaxCents = Math.round(purchaseEvent.tax * 100);
    if (ga4TaxCents !== order.tax.cents) {
      errors.push(
        `GA4 tax mismatch: event has ${ga4TaxCents} cents, order has ${order.tax.cents} cents.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates financial invariants for refund events.
 */
export function validateRefundInvariants(
  order: CanonicalOrderAccounting,
  refundEvent: GA4RefundEvent
): FinancialValidationResult {
  const errors: string[] = [];
  const refundValueCents = Math.round(refundEvent.value * 100);

  if (refundValueCents <= 0) {
    errors.push('Refund value must be strictly greater than 0.');
  }

  if (refundValueCents > order.totalCharge.cents) {
    errors.push(
      `Refund value (${refundValueCents} cents) cannot exceed original total charged (${order.totalCharge.cents} cents).`
    );
  }

  if (refundEvent.currency !== order.currency) {
    errors.push(
      `Refund currency mismatch: refund has ${refundEvent.currency}, but original order has ${order.currency}.`
    );
  }

  if (refundEvent.items && refundEvent.items.length > 0) {
    let sumRefundItemsCents = 0;
    for (const item of refundEvent.items) {
      sumRefundItemsCents += Math.round(item.price * 100) * item.quantity;
    }
    // For partial item refunds, item sum must not exceed refund value
    if (sumRefundItemsCents > refundValueCents) {
      errors.push(
        `Refund item sum (${sumRefundItemsCents} cents) exceeds specified refund value (${refundValueCents} cents).`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

