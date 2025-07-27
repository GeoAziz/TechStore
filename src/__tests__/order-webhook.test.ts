import handler from '../pages/api/order-webhook';
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock dependencies that are not relevant to the test
jest.mock('../../src/server/ws-server', () => ({
  broadcastUpdate: jest.fn(),
}));

jest.mock('../../src/utils/logger', () => ({
  logEvent: jest.fn(),
  logError: jest.fn(),
}));

jest.mock('../../src/utils/sentry', () => ({
  captureException: jest.fn(),
}));


describe('Order Webhook API', () => {
  const validPayload = {
    orderId: 'test-order-1',
    userId: 'user-123',
    products: [{ id: 'prod-1', qty: 2 }],
    total: 1000,
  };
  
  const secret = 'test-secret';
  
  beforeEach(() => {
    process.env.WEBHOOK_SECRET = secret;
    jest.clearAllMocks();
  });

  it('returns 200 for valid request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: validPayload,
      headers: { 'x-webhook-secret': secret },
    });

    await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ success: true, message: 'Order processed successfully' });
  });

  it('returns 401 for missing/invalid secret', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: validPayload,
      headers: { 'x-webhook-secret': 'wrong' },
    });
    await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData()).success).toBe(false);
  });

  it('returns 400 for invalid payload', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { foo: 'bar' },
      headers: { 'x-webhook-secret': secret },
    });
    await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).success).toBe(false);
  });

  it('should return 405 for non-POST method', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: { 'x-webhook-secret': secret }
    });
    await handler(req as unknown as NextApiRequest, res as unknown as NextApiResponse);
    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData().success).toBe(false);
  });
});
