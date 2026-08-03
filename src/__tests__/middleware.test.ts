jest.mock('next/server', () => {
  class MockNextRequest {
    url: string;
    cookies: Map<string, string>;
    nextUrl: URL;
    constructor(input: string | URL, init?: any) {
      const u = typeof input === 'string' ? new URL(input) : input;
      this.url = u.toString();
      this.nextUrl = u;
      this.cookies = new Map();
    }
    get cookies() { return this._cookies; }
    set cookies(v: any) { this._cookies = v; }
    _cookies = {
      get: (name: string) => ({ value: this._cookieStore.get(name) || '' }),
      set: (name: string, value: string) => { this._cookieStore.set(name, value); },
      _cookieStore: new Map<string, string>(),
    };
  }
  class MockNextResponse extends Response {
    static redirect(url: string | URL) {
      const res = new MockNextResponse(null, { status: 307 });
      res.headers.set('location', typeof url === 'string' ? url : url.toString());
      return res;
    }
    constructor(body?: any, init?: ResponseInit) {
      super(body, init);
    }
  }
  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

function createRequest(path: string, cookieStore: Record<string, string> = {}): any {
  const url = new URL(`http://localhost:3000${path}`);
  const req: any = {
    url: url.toString(),
    nextUrl: url,
    cookies: {
      get: (name: string) => cookieStore[name] ? { value: cookieStore[name] } : undefined,
      set: jest.fn(),
    },
    headers: new Map(),
  };
  return req;
}

let middleware: any;

beforeAll(async () => {
  const mod = await import('@/middleware');
  middleware = mod.middleware;
});

describe('Middleware security headers', () => {
  it('adds X-Frame-Options DENY', () => {
    const res = middleware(createRequest('/'));
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('adds X-Content-Type-Options nosniff', () => {
    const res = middleware(createRequest('/'));
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('adds HSTS header', () => {
    const res = middleware(createRequest('/'));
    expect(res.headers.get('Strict-Transport-Security')).toContain('max-age=63072000');
  });

  it('adds CSP header', () => {
    const res = middleware(createRequest('/'));
    const csp = res.headers.get('Content-Security-Policy');
    expect(csp).toContain("default-src 'self'");
  });

  it('removes X-Powered-By', () => {
    const res = middleware(createRequest('/'));
    expect(res.headers.get('X-Powered-By')).toBeNull();
  });
});

describe('Middleware route protection', () => {
  it('redirects unauthenticated /admin to login', () => {
    const res = middleware(createRequest('/admin'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('redirects unauthenticated /dashboard to login', () => {
    const res = middleware(createRequest('/dashboard'));
    expect(res.status).toBe(307);
  });

  it('redirects unauthenticated /checkout to login', () => {
    const res = middleware(createRequest('/checkout'));
    expect(res.status).toBe(307);
  });

  it('allows authenticated /admin', () => {
    const res = middleware(createRequest('/admin', { __session: 'tok' }));
    expect(res.status).not.toBe(307);
  });

  it('allows unauthenticated /shop', () => {
    const res = middleware(createRequest('/shop'));
    expect(res.status).not.toBe(307);
  });

  it('allows unauthenticated /login', () => {
    const res = middleware(createRequest('/login'));
    expect(res.status).not.toBe(307);
  });
});
