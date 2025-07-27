// src/pages/api/order-webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { broadcastUpdate } from '../../server/ws-server';
import { logEvent, logError } from '../../utils/logger';
import { captureException } from '../../utils/sentry';

// Simple schema validation (replace with zod/yup for production)
function validateOrderPayload(body: any) {
  if (!body || typeof body !== 'object') return false;
  if (!body.orderId || !body.userId || !Array.isArray(body.products) || typeof body.total !== 'number') return false;
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // Basic security: check for secret header (set in n8n)
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || req.headers['x-webhook-secret'] !== secret) {
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
