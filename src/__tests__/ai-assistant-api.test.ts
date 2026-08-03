jest.mock('@/ai/genkit', () => ({
  ai: { generate: jest.fn().mockResolvedValue({ output: () => 'Hello!' }) },
}));
jest.mock('@/lib/firebase-admin', () => ({
  auth: { verifyIdToken: jest.fn().mockResolvedValue({ uid: 'u1' }) },
}));

import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/ai-assistant';

function makeReq(overrides: any = {}) {
  const { req, res } = createMocks({
    method: 'POST',
    headers: { authorization: 'Bearer test-token' },
    body: { message: 'Hello' },
    ...overrides,
  });
  return { req, res };
}

describe('AI Assistant API', () => {
  it('rejects GET', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it('rejects without auth', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { message: 'Hi' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it('rejects invalid token', async () => {
    const { auth } = require('@/lib/firebase-admin');
    auth.verifyIdToken.mockRejectedValueOnce(new Error('bad'));
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer bad' },
      body: { message: 'Hi' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it('rejects empty message', async () => {
    const { req, res } = makeReq({ body: { message: '' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('rejects message over 2000 chars', async () => {
    const { req, res } = makeReq({ body: { message: 'x'.repeat(2001) } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  it('accepts valid message', async () => {
    const { req, res } = makeReq({ body: { message: 'What products?' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).reply).toBe('Hello!');
  });
});
