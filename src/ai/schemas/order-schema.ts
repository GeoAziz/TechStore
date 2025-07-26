import { z } from 'zod';

const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});

export const OrderInputSchema = z.object({
  contact: z.object({
    email: z.string().email(),
  }),
  shipping: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
  }),
  payment: z.object({
    cardNumber: z.string(),
    expiryDate: z.string(),
    cvc: z.string(),
  }),
  cart: z.array(CartItemSchema),
  total: z.number(),
});

export type OrderInput = z.infer<typeof OrderInputSchema>;
