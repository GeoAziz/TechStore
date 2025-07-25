'use server';
/**
 * @fileOverview A flow to send order details to a webhook.
 *
 * - sendOrderToWebhook - A function that sends order data to a configured webhook URL.
 * - OrderInputSchema - The input type for the sendOrderToWebhook function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

export async function sendOrderToWebhook(input: OrderInput): Promise<{ success: boolean; message: string }> {
  return sendOrderWebhookFlow(input);
}

const sendOrderWebhookFlow = ai.defineFlow(
  {
    name: 'sendOrderWebhookFlow',
    inputSchema: OrderInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (order) => {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL is not set.');
      return {
        success: false,
        message: 'Webhook URL is not configured.',
      };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Webhook failed with status:', response.status, 'Body:', errorBody);
        return {
          success: false,
          message: `Webhook failed with status: ${response.status}`,
        };
      }
      
      const responseData = await response.json();
      console.log('Webhook response:', responseData);

      return {
        success: true,
        message: 'Order successfully sent to webhook.',
      };
    } catch (error) {
      console.error('Error sending order to webhook:', error);
      return {
        success: false,
        message: 'An error occurred while sending the order.',
      };
    }
  }
);
