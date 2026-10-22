import { GA4PurchaseEvent } from './events';
import { Money, SupportedCurrency } from './money';

export interface CanonicalOrderAccounting {
  readonly orderId: string;
  readonly currency: SupportedCurrency;
  readonly items: Array<{
    readonly id: string;
    readonly name: string;
    readonly unitPriceGross: Money; // Catalog pre-discount price
    readonly unitDiscount: Money;   // Allocated discount per unit
    readonly netUnitPrice: Money;    // unitPriceGross - unitDiscount
    readonly quantity: number;
    readonly totalNetPrice: Money;   // netUnitPrice * quantity
  }>;
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

export function validateFinancialInvariants(
  order: CanonicalOrderAccounting,
  purchaseEvent: GA4PurchaseEvent,
  stripeChargedCents: number
): FinancialValidationResult {
  const errors: string[] = [];

  // 1. Stripe payment amount must equal persisted order totalCharge
  if (stripeChargedCents !== order.totalCharge.cents) {
    errors.push(
      `Stripe charge mismatch: charged ${stripeChargedCents} cents, but order total is ${order.totalCharge.cents} cents.`
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
