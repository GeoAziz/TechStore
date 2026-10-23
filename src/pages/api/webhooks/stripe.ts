import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';
import { enqueueAnalyticsEventTx } from '@/lib/analytics/outbox';
import { processOutboxJob } from '@/lib/analytics/mp-dispatcher';
import { GA4PurchaseEvent } from '@/contracts/analytics/events';

// Stripe webhook requires raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2024-06-20',
});

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not set; running in development unverified mode');
      event = JSON.parse(rawBody.toString('utf8'));
    } else {
      if (!sig) {
        return res.status(400).json({ error: 'Missing stripe-signature header' });
      }
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    }
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.orderId || paymentIntent.id;
      const userId = paymentIntent.metadata?.userId;
      const clientId = paymentIntent.metadata?.clientId;
      const sessionId = paymentIntent.metadata?.sessionId;
      const consentAnalytics = paymentIntent.metadata?.consentAnalytics !== 'false';
      const consentMarketing = paymentIntent.metadata?.consentMarketing === 'true';

      // 1. Transactionally write authoritative order state and analytics outbox document
      const result = await db.runTransaction(async (tx) => {
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await tx.get(orderRef);

        let orderData = orderDoc.exists ? orderDoc.data() : null;

        // Update or establish authoritative paid status
        tx.set(
          orderRef,
          {
            status: 'Processing',
            paymentStatus: 'paid',
            stripePaymentIntentId: paymentIntent.id,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        // Build canonical GA4 purchase payload
        const purchaseEvent: GA4PurchaseEvent = {
          event: 'purchase',
          transaction_id: orderId,
          currency: (paymentIntent.currency.toUpperCase() as 'KES' | 'USD') || 'KES',
          value: (orderData?.subtotal || paymentIntent.amount) / 100,
          shipping: (orderData?.shipping || 0) / 100,
          tax: (orderData?.tax || 0) / 100,
          items: orderData?.items || [
            {
              item_id: 'cart-checkout',
              item_name: 'TechStore Order Items',
              price: (orderData?.subtotal || paymentIntent.amount) / 100,
              quantity: 1,
            },
          ],
        };

        // Atomically enqueue analytics outbox job
        const outboxResult = await enqueueAnalyticsEventTx(tx, {
          orderId,
          eventType: 'purchase',
          userId,
          clientId,
          sessionId,
          consentSnapshot: {
            analytics: consentAnalytics,
            marketing: consentMarketing,
          },
          payload: purchaseEvent,
        });

        return { orderId, enqueued: outboxResult.enqueued, jobId: outboxResult.jobId };
      });

      // 2. Immediate best-effort inline pickup (so real-time analytics fires immediately)
      if (result.enqueued) {
        try {
          const jobDoc = await db.collection('analytics_outbox').doc(result.jobId).get();
          if (jobDoc.exists) {
            await processOutboxJob(jobDoc.data() as any);
          }
        } catch {
          // Outbox worker will pick up on next cron/sweep
        }
      }

      return res.status(200).json({ received: true, orderId: result.orderId, enqueued: result.enqueued });
    }

    return res.status(200).json({ received: true, type: event.type });
  } catch (error: any) {
    console.error('Error handling Stripe webhook:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

