import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { auth, db } from '@/lib/firebase-admin';
import { captureException } from '@/utils/sentry';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const SHIPPING_COST = 2500;
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 10000000;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = decodedToken.uid;
    const { amount, clientId, sessionId, consentAnalytics, consentMarketing } = req.body;

    // Validate amount input
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Invalid amount provided' });
    }

    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return res.status(400).json({ error: 'Amount out of acceptable range' });
    }

    // Fetch and validate user's cart from Firestore
    const cartSnapshot = await db.collection('users').doc(userId).collection('cart').get();

    if (cartSnapshot.empty) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let recalculatedTotal = 0;

    for (const cartDoc of cartSnapshot.docs) {
      const cartItem = cartDoc.data();

      if (!cartItem.productId || typeof cartItem.quantity !== 'number' || !cartItem.price) {
        return res.status(400).json({ error: 'Invalid cart item' });
      }

      // Verify product still exists and has sufficient stock
      const productDoc = await db.collection('products').doc(cartItem.productId).get();

      if (!productDoc.exists) {
        return res.status(400).json({
          error: `Product ${cartItem.productId} no longer exists. Please update your cart.`
        });
      }

      const productData = productDoc.data();
      if (!productData || typeof productData.stock !== 'number' || productData.stock < cartItem.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${productData?.name || 'product'}. Please update your cart.`
        });
      }

      recalculatedTotal += productData.price * cartItem.quantity;
    }

    // Add shipping cost
    const totalWithShipping = recalculatedTotal + SHIPPING_COST;

    // Verify amounts match (allow 100 KES variance for rounding)
    if (Math.abs(totalWithShipping - amount) > 100) {
      return res.status(400).json({
        error: 'Cart amount mismatch. Please refresh and try again.'
      });
    }

    // Create payment intent with user tracking
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'kes',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId,
        cartItemCount: cartSnapshot.size,
        clientId: typeof clientId === 'string' ? clientId : '',
        sessionId: typeof sessionId === 'string' ? sessionId : '',
        consentAnalytics: String(consentAnalytics ?? true),
        consentMarketing: String(consentMarketing ?? false),
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    // Log to Sentry but don't expose details to client
    captureException(error, 'create-payment-intent');

    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
}
