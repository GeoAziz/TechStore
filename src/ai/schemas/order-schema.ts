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
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().min(1, 'ZIP code is required'),
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
