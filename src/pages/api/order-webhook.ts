// src/pages/api/order-webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { broadcastUpdate } from '../../server/ws-server';
import { logEvent, logError } from '../../utils/logger';
import { captureException } from '../../utils/sentry';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

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

function validateOrderPayload(body: any) {
  if (!body || typeof body !== 'object') return false;
  if (!body.orderId || !body.userId || !Array.isArray(body.products) || typeof body.total !== 'number') return false;
  if (body.products.length === 0 || body.products.length > 100) return false;
  if (typeof body.orderId !== 'string' || body.orderId.length > 128) return false;
  if (typeof body.userId !== 'string' || body.userId.length > 128) return false;
  if (body.total < 0 || body.total > 10000000) return false;
  return true;
}

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ success: false, message: 'Too many requests' });
  }

  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, message: 'Server misconfigured' });
  }
  const provided = req.headers['x-webhook-secret'];
  if (typeof provided !== 'string' || !safeCompare(provided, secret)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Validate payload
  if (!validateOrderPayload(req.body)) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  try {
    // TODO: Process order (update DB, inventory, send notifications, etc.)
    // Example: await updateOrderInFirestore(req.body)
    // Example: await sendOrderConfirmationEmail(req.body)

    // Log success
    logEvent('Order processed', { orderId: req.body.orderId });
    broadcastUpdate({ type: 'order', message: `Order ${req.body.orderId} processed.` });
    return res.status(200).json({ success: true, message: 'Order processed successfully' });
  } catch (error) {
    // Log error for monitoring
    logError(error, 'Order webhook');
    captureException(error, 'Order webhook');
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Documentation:
// POST /api/order-webhook
// Headers: x-webhook-secret: <your_secret>
// Payload: { orderId, userId, products, total, ... }
// Response: { success: boolean, message: string }
// For async/background processing in n8n, use n8n's built-in queue or external services for heavy tasks (e.g., emails, payments).
