'use server';
/**
 * @fileOverview A flow to send order details to a webhook.
 *
 * - sendOrderToWebhook - A function that sends order data to a configured webhook URL.
 * - OrderInput - The input type for the sendOrderToWebhook function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { OrderInputSchema, type OrderInput } from '@/ai/schemas/order-schema';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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

      // Create a notification for the admin
      const notificationRef = db.collection('notifications').doc();
      await notificationRef.set({
        title: 'New Order Received',
        message: `A new order was placed by ${order.contact.email} for a total of KES ${order.total.toLocaleString()}.`,
        timestamp: FieldValue.serverTimestamp(),
        read: false,
        type: 'order',
      });

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
