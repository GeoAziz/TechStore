import { z } from 'zod';

export const SupportedCurrencySchema = z.enum(['KES', 'USD']);

export const GA4ItemSchema = z.object({
  item_id: z.string().min(1, 'Item ID cannot be empty'),
  item_name: z.string().min(1, 'Item name cannot be empty'),
  price: z.number().nonnegative('Price cannot be negative'), // Unit price after item-level discount, in decimal
  quantity: z.number().int().positive('Quantity must be positive integer'),
  discount: z.number().nonnegative('Discount cannot be negative').optional(), // Item discount in decimal
  item_category: z.string().optional(),
  item_brand: z.string().optional(),
});

export type GA4Item = z.infer<typeof GA4ItemSchema>;

export const GA4ViewItemSchema = z.object({
  event: z.literal('view_item'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative(),
  items: z.array(GA4ItemSchema).min(1, 'view_item requires at least one item'),
  synthetic_run: z.string().optional(),
  environment: z.string().optional(),
});

export const GA4AddToCartSchema = z.object({
  event: z.literal('add_to_cart'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative(),
  items: z.array(GA4ItemSchema).min(1, 'add_to_cart requires at least one item'),
  synthetic_run: z.string().optional(),
  environment: z.string().optional(),
});

export const GA4RemoveFromCartSchema = z.object({
  event: z.literal('remove_from_cart'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative(),
  items: z.array(GA4ItemSchema).min(1, 'remove_from_cart requires at least one item'),
  synthetic_run: z.string().optional(),
  environment: z.string().optional(),
});

export const GA4BeginCheckoutSchema = z.object({
  event: z.literal('begin_checkout'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative(),
  items: z.array(GA4ItemSchema).min(1, 'begin_checkout requires at least one item'),
  synthetic_run: z.string().optional(),
  environment: z.string().optional(),
});

export const GA4PurchaseSchema = z.object({
  event: z.literal('purchase'),
  transaction_id: z.string().min(1, 'transaction_id is required'),
  currency: SupportedCurrencySchema,
  value: z.number().nonnegative('value cannot be negative'), // Net item value (sum(price * quantity)), in decimal
  shipping: z.number().nonnegative().optional(), // Decimal shipping
  tax: z.number().nonnegative().optional(), // Decimal tax
  coupon: z.string().optional(),
  items: z.array(GA4ItemSchema).min(1, 'purchase requires at least one item'),
  synthetic_run: z.string().optional(),
  environment: z.string().optional(),
});

export type GA4PurchaseEvent = z.infer<typeof GA4PurchaseSchema>;

export type GA4CommerceEvent =
  | z.infer<typeof GA4ViewItemSchema>
  | z.infer<typeof GA4AddToCartSchema>
  | z.infer<typeof GA4RemoveFromCartSchema>
  | z.infer<typeof GA4BeginCheckoutSchema>
  | GA4PurchaseEvent;
