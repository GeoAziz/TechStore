import { ga4DataClient } from '@/lib/analytics/data-api-client';

describe('Phase 3 Admin Reporting: GA4 Data API Client & Fallbacks', () => {
  beforeEach(() => {
    ga4DataClient.clearCache();
    delete process.env.GA4_ACCESS_TOKEN;
    delete process.env.GA4_PROPERTY_ID;
  });

  it('returns null safely when GA4 property ID is not configured', async () => {
    const report = await ga4DataClient.runReport({
      dimensions: ['itemId'],
      metrics: ['itemsViewed'],
    });
    expect(report).toBeNull();
  });

  it('returns null safely when OAuth access token is missing', async () => {
    process.env.GA4_PROPERTY_ID = '123456789';
    const report = await ga4DataClient.runReport({
      dimensions: ['itemId'],
      metrics: ['itemsViewed'],
    });
    expect(report).toBeNull();
  });

  it('parses GA4 Data API response and caches subsequent calls within TTL', async () => {
    process.env.GA4_PROPERTY_ID = '123456789';
    process.env.GA4_ACCESS_TOKEN = 'mock_oauth_token';

    const mockResponse = {
      dimensionHeaders: [{ name: 'itemId' }, { name: 'itemName' }],
      metricHeaders: [{ name: 'itemsViewed' }, { name: 'itemsPurchased' }],
      rows: [
        {
          dimensionValues: [{ value: 'prod-macbook' }, { value: 'MacBook Pro' }],
          metricValues: [{ value: '450' }, { value: '18' }],
        },
      ],
      rowCount: 1,
    };

    const originalFetch = global.fetch;
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    global.fetch = mockFetch;

    try {
      // First call -> hits mock fetch
      const result1 = await ga4DataClient.runReport({
        startDate: '30daysAgo',
        endDate: 'today',
        dimensions: ['itemId', 'itemName'],
        metrics: ['itemsViewed', 'itemsPurchased'],
      });

      expect(result1).not.toBeNull();
      expect(result1?.source).toBe('ga4_data_api');
      expect(result1?.isFallback).toBe(false);
      expect(result1?.rows[0].dimensionValues[0]).toBe('prod-macbook');
      expect(result1?.rows[0].metricValues[0]).toBe(450);
      expect(result1?.rows[0].metricValues[1]).toBe(18);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second identical call within TTL -> returns from memory cache without network hit
      const result2 = await ga4DataClient.runReport({
        startDate: '30daysAgo',
        endDate: 'today',
        dimensions: ['itemId', 'itemName'],
        metrics: ['itemsViewed', 'itemsPurchased'],
      });

      expect(result2).not.toBeNull();
      expect(result2?.rows[0].dimensionValues[0]).toBe('prod-macbook');
      expect(mockFetch).toHaveBeenCalledTimes(1); // Cached!
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('handles realtime reporting with correct period labeling', async () => {
    process.env.GA4_PROPERTY_ID = '987654321';
    process.env.GA4_ACCESS_TOKEN = 'mock_oauth_token_rt';

    const mockRtResponse = {
      dimensionHeaders: [{ name: 'unifiedScreenName' }],
      metricHeaders: [{ name: 'activeUsers' }],
      rows: [
        {
          dimensionValues: [{ value: '/shop/laptops' }],
          metricValues: [{ value: '42' }],
        },
      ],
      rowCount: 1,
    };

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRtResponse,
    });

    try {
      const rtResult = await ga4DataClient.runRealtimeReport({
        dimensions: ['unifiedScreenName'],
        metrics: ['activeUsers'],
      });

      expect(rtResult).not.toBeNull();
      expect(rtResult?.period).toBe('last_30_minutes');
      expect(rtResult?.rows[0].metricValues[0]).toBe(42);
    } finally {
      global.fetch = originalFetch;
    }
  });
});

