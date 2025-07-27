import request from 'supertest';
import handler from '../pages/api/order-webhook';
import { createMocks } from 'node-mocks-http';

describe('Order Webhook API', () => {
  const validPayload = {
    orderId: 'test-order-1',
    userId: 'user-123',
    products: [{ id: 'prod-1', qty: 2 }],
    total: 1000,
  };

  it('returns 401 for missing/invalid secret', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: validPayload,
      headers: { 'x-webhook-secret': 'wrong' },
    });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData()).success).toBe(false);
  });

  it('returns 400 for invalid payload', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { foo: 'bar' },
      headers: { 'x-webhook-secret': process.env.WEBHOOK_SECRET },
    });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).success).toBe(false);
  });

  it('returns 200 for valid request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: validPayload,
      headers: { 'x-webhook-secret': process.env.WEBHOOK_SECRET },
    });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).success).toBe(true);
  });
});