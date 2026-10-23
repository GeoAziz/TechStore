import { z } from 'zod';

export const SupportedCurrencySchema = z.enum(['KES', 'USD']);

export const GA4ItemSchema = z.object({
  item_id: z.string().min(1, 'Item ID cannot be empty'),
  item_name: z.string().min(1, 'Item name cannot be empty'),
  price: z.number().nonnegative('Price cannot be negative'), // Unit price after item-level discount, in decimal
  quantity: z.number().int().positive('Quantity must be positive integer'),
  discount: z.number().nonnegative('Discount cannot be negative').optional(), // Item discount in decimal
  item_category: z.string().optional(),
  item_category2: z.string().optional(),
  item_brand: z.string().optional(),
  item_variant: z.string().optional(),
  item_list_name: z.string().optional(),
  item_list_id: z.string().optional(),
  index: z.number().int().nonnegative().optional(),
});

export type GA4Item = z.infer<typeof GA4ItemSchema>;

// Base envelope parameters for synthetic & runtime debugging
const BaseEventEnvelope = {
  synthetic_run: z.string().optional(),
  environment: z.string().optional(),
};

// 1. Discovery: view_item_list
export const GA4ViewItemListSchema = z.object({
  event: z.literal('view_item_list'),
  item_list_id: z.string().optional(),
  item_list_name: z.string().optional(),
  items: z.array(GA4ItemSchema).min(1, 'view_item_list requires at least one item'),
  ...BaseEventEnvelope,
});

// 2. Discovery: select_item
export const GA4SelectItemSchema = z.object({
  event: z.literal('select_item'),
  item_list_id: z.string().optional(),
  item_list_name: z.string().optional(),
  items: z.array(GA4ItemSchema).length(1, 'select_item expects exactly one item'),
  ...BaseEventEnvelope,
});

// 3. Consideration: view_item
export const GA4ViewItemSchema = z.object({
  event: z.literal('view_item'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative(),
  items: z.array(GA4ItemSchema).min(1, 'view_item requires at least one item'),
  ...BaseEventEnvelope,
});

// 4. Cart: add_to_cart
export const GA4AddToCartSchema = z.object({
  event: z.literal('add_to_cart'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative(),
  items: z.array(GA4ItemSchema).min(1, 'add_to_cart requires at least one item'),
  ...BaseEventEnvelope,
});

// 5. Cart: remove_from_cart
export const GA4RemoveFromCartSchema = z.object({
  event: z.literal('remove_from_cart'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative(),
  items: z.array(GA4ItemSchema).min(1, 'remove_from_cart requires at least one item'),
  ...BaseEventEnvelope,
});

// 6. Cart: view_cart
export const GA4ViewCartSchema = z.object({
  event: z.literal('view_cart'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative(),
  items: z.array(GA4ItemSchema).min(1, 'view_cart requires at least one item'),
  ...BaseEventEnvelope,
});

// 7. Checkout Funnel: begin_checkout
export const GA4BeginCheckoutSchema = z.object({
  event: z.literal('begin_checkout'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative(),
  coupon: z.string().optional(),
  items: z.array(GA4ItemSchema).min(1, 'begin_checkout requires at least one item'),
  ...BaseEventEnvelope,
});

// 8. Checkout Funnel: add_shipping_info
export const GA4AddShippingInfoSchema = z.object({
  event: z.literal('add_shipping_info'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative(),
  coupon: z.string().optional(),
  shipping_tier: z.string().min(1, 'shipping_tier cannot be empty'),
  items: z.array(GA4ItemSchema).min(1, 'add_shipping_info requires at least one item'),
  ...BaseEventEnvelope,
});

// 9. Checkout Funnel: add_payment_info
export const GA4AddPaymentInfoSchema = z.object({
  event: z.literal('add_payment_info'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative(),
  coupon: z.string().optional(),
  payment_type: z.enum(['card', 'mpesa', 'bank_transfer', 'other']),
  items: z.array(GA4ItemSchema).min(1, 'add_payment_info requires at least one item'),
  ...BaseEventEnvelope,
});

// 10. Purchase: purchase
export const GA4PurchaseSchema = z.object({
  event: z.literal('purchase'),
  transaction_id: z.string().min(1, 'transaction_id is required'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative('value cannot be negative'), // Net merchandise total in decimal
  shipping: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
  coupon: z.string().optional(),
  items: z.array(GA4ItemSchema).min(1, 'purchase requires at least one item'),
  ...BaseEventEnvelope,
});

// 11. Post-Purchase: refund
export const GA4RefundSchema = z.object({
  event: z.literal('refund'),
  transaction_id: z.string().min(1, 'transaction_id is required'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative('refund value cannot be negative'),
  shipping: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
  items: z.array(GA4ItemSchema).optional(), // Optional for full order refund, required for partial refund
  ...BaseEventEnvelope,
});

// 12. Post-Purchase: order_cancelled (Custom Business Event)
export const GA4OrderCancelledSchema = z.object({
  event: z.literal('order_cancelled'),
  transaction_id: z.string().min(1, 'transaction_id is required'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative(),
  cancellation_reason: z.string().min(1, 'cancellation_reason is required'),
  cancelled_by: z.enum(['customer', 'admin', 'system']),
  items: z.array(GA4ItemSchema).optional(),
  ...BaseEventEnvelope,
});

export type GA4ViewItemListEvent = z.infer<typeof GA4ViewItemListSchema>;
export type GA4SelectItemEvent = z.infer<typeof GA4SelectItemSchema>;
export type GA4ViewItemEvent = z.infer<typeof GA4ViewItemSchema>;
export type GA4AddToCartEvent = z.infer<typeof GA4AddToCartSchema>;
export type GA4RemoveFromCartEvent = z.infer<typeof GA4RemoveFromCartSchema>;
export type GA4ViewCartEvent = z.infer<typeof GA4ViewCartSchema>;
export type GA4BeginCheckoutEvent = z.infer<typeof GA4BeginCheckoutSchema>;
export type GA4AddShippingInfoEvent = z.infer<typeof GA4AddShippingInfoSchema>;
export type GA4AddPaymentInfoEvent = z.infer<typeof GA4AddPaymentInfoSchema>;
export type GA4PurchaseEvent = z.infer<typeof GA4PurchaseSchema>;
export type GA4RefundEvent = z.infer<typeof GA4RefundSchema>;
export type GA4OrderCancelledEvent = z.infer<typeof GA4OrderCancelledSchema>;

export type GA4CommerceEvent =
  | GA4ViewItemListEvent
  | GA4SelectItemEvent
  | GA4ViewItemEvent
  | GA4AddToCartEvent
  | GA4RemoveFromCartEvent
  | GA4ViewCartEvent
  | GA4BeginCheckoutEvent
  | GA4AddShippingInfoEvent
  | GA4AddPaymentInfoEvent
  | GA4PurchaseEvent
  | GA4RefundEvent
  | GA4OrderCancelledEvent;

export type GA4CommerceEventName = GA4CommerceEvent['event'];

