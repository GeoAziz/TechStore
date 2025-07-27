// src/pages/api/__tests__/order-webhook.test.ts
import handler from '../order-webhook';
import httpMocks from 'node-mocks-http';

describe('Order Webhook API', () => {
  const secret = 'testsecret';
  beforeAll(() => {
    process.env.WEBHOOK_SECRET = secret;
  });

  it('should return 200 for valid request', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      headers: { 'x-webhook-secret': secret },
      body: {
        orderId: 'order123',
        userId: 'user456',
        products: [{ id: 'p1', qty: 2 }],
        total: 1000
      }
    });
    const res = httpMocks.createResponse();
    await handler(req as any, res as any);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ success: true, message: 'Order processed successfully' });
  });

  it('should return 400 for invalid payload', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      headers: { 'x-webhook-secret': secret },
      body: { invalid: true }
    });
    const res = httpMocks.createResponse();
    await handler(req as any, res as any);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().success).toBe(false);
  });

  it('should return 401 for missing/invalid secret', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      headers: { 'x-webhook-secret': 'wrong' },
      body: {
        orderId: 'order123',
        userId: 'user456',
        products: [{ id: 'p1', qty: 2 }],
        total: 1000
      }
    });
    const res = httpMocks.createResponse();
    await handler(req as any, res as any);
    expect(res.statusCode).toBe(401);
    expect(res._getJSONData().success).toBe(false);
  });

  it('should return 405 for non-POST method', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      headers: { 'x-webhook-secret': secret }
    });
    const res = httpMocks.createResponse();
    await handler(req as any, res as any);
    expect(res.statusCode).toBe(405);
    expect(res._getJSONData().success).toBe(false);
  });
});

/**
 * Integration Test Documentation:
 * - Tests success, invalid payload, unauthorized, and method not allowed cases for /api/order-webhook
 * - Uses node-mocks-http to simulate Next.js API requests/responses
 * - Set WEBHOOK_SECRET in your test environment
 */
