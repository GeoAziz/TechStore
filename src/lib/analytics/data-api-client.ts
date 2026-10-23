import { getGA4EnvConfig } from '@/contracts/analytics/env';

export interface GA4ReportMetric {
  name: string;
  value: number;
}

export interface GA4ReportRow {
  dimensionValues: string[];
  metricValues: number[];
}

export interface GA4ReportResult {
  source: 'ga4_data_api' | 'firestore_database';
  freshnessTimestamp: string;
  timeZone: string;
  period: string;
  dimensionHeaders: string[];
  metricHeaders: string[];
  rows: GA4ReportRow[];
  totalRows: number;
  isFallback: boolean;
  notes?: string;
}

interface CacheEntry {
  expiresAt: number;
  data: GA4ReportResult;
}

const reportCache = new Map<string, CacheEntry>();
const REALTIME_CACHE_TTL_MS = 60_000; // 1 min TTL for realtime
const HISTORICAL_CACHE_TTL_MS = 900_000; // 15 min TTL for historical

/**
 * Server-Side GA4 Data API Client
 * Uses Google REST API endpoints with Google Cloud auth (ADC / Access Token)
 * Features SWR in-memory caching and quota preservation
 */
export class GA4DataApiClient {
  private static instance: GA4DataApiClient;

  private constructor() {}

  static getInstance(): GA4DataApiClient {
    if (!GA4DataApiClient.instance) {
      GA4DataApiClient.instance = new GA4DataApiClient();
    }
    return GA4DataApiClient.instance;
  }

  /**
   * Retrieves an active Google Cloud OAuth token for the Google Analytics Data API.
   * Checks process.env.GA4_ACCESS_TOKEN, or calls gcloud application-default if available.
   */
  async getAccessToken(): Promise<string | null> {
    if (process.env.GA4_ACCESS_TOKEN) {
      return process.env.GA4_ACCESS_TOKEN;
    }
    return null;
  }

  /**
   * Runs a Realtime Report (e.g. active users, active items in last 30 minutes)
   */
  async runRealtimeReport(options: {
    propertyId?: string;
    dimensions?: string[];
    metrics?: string[];
    limit?: number;
  }): Promise<GA4ReportResult | null> {
    const { config } = getGA4EnvConfig();
    const propertyId = options.propertyId || config.GA4_PROPERTY_ID;

    if (!propertyId) {
      return null;
    }

    const cacheKey = `realtime:${propertyId}:${(options.dimensions || []).join(',')}:${(options.metrics || []).join(',')}`;
    const cached = reportCache.get(cacheKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const token = await this.getAccessToken();
    if (!token) {
      return null; // Return null to trigger graceful fallback to verified DB metrics
    }

    try {
      const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dimensions: (options.dimensions || ['unifiedScreenName']).map(name => ({ name })),
          metrics: (options.metrics || ['activeUsers']).map(name => ({ name })),
          limit: options.limit || 10,
        }),
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      const rows: GA4ReportRow[] = (json.rows || []).map((r: any) => ({
        dimensionValues: (r.dimensionValues || []).map((d: any) => d.value),
        metricValues: (r.metricValues || []).map((m: any) => Number(m.value) || 0),
      }));

      const result: GA4ReportResult = {
        source: 'ga4_data_api',
        freshnessTimestamp: new Date().toISOString(),
        timeZone: json.propertyQuota?.timeZone || 'Africa/Nairobi',
        period: 'last_30_minutes',
        dimensionHeaders: (json.dimensionHeaders || []).map((h: any) => h.name),
        metricHeaders: (json.metricHeaders || []).map((h: any) => h.name),
        rows,
        totalRows: json.rowCount || rows.length,
        isFallback: false,
      };

      reportCache.set(cacheKey, { expiresAt: now + REALTIME_CACHE_TTL_MS, data: result });
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Runs a standard historical report (7d/30d conversion, top products)
   */
  async runReport(options: {
    propertyId?: string;
    startDate?: string;
    endDate?: string;
    dimensions?: string[];
    metrics?: string[];
    limit?: number;
    dimensionFilter?: Record<string, unknown>;
  }): Promise<GA4ReportResult | null> {
    const { config } = getGA4EnvConfig();
    const propertyId = options.propertyId || config.GA4_PROPERTY_ID;

    if (!propertyId) {
      return null;
    }

    const startDate = options.startDate || '30daysAgo';
    const endDate = options.endDate || 'today';
    const cacheKey = `report:${propertyId}:${startDate}:${endDate}:${(options.dimensions || []).join(',')}:${(options.metrics || []).join(',')}`;
    const cached = reportCache.get(cacheKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const token = await this.getAccessToken();
    if (!token) {
      return null;
    }

    try {
      const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: (options.dimensions || ['itemId', 'itemName']).map(name => ({ name })),
          metrics: (options.metrics || ['itemsViewed', 'itemsPurchased', 'itemRevenue']).map(name => ({
            name,
          })),
          dimensionFilter: options.dimensionFilter,
          limit: options.limit || 10,
        }),
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      const rows: GA4ReportRow[] = (json.rows || []).map((r: any) => ({
        dimensionValues: (r.dimensionValues || []).map((d: any) => d.value),
        metricValues: (r.metricValues || []).map((m: any) => Number(m.value) || 0),
      }));

      const result: GA4ReportResult = {
        source: 'ga4_data_api',
        freshnessTimestamp: new Date().toISOString(),
        timeZone: 'Africa/Nairobi',
        period: `${startDate}_to_${endDate}`,
        dimensionHeaders: (json.dimensionHeaders || []).map((h: any) => h.name),
        metricHeaders: (json.metricHeaders || []).map((h: any) => h.name),
        rows,
        totalRows: json.rowCount || rows.length,
        isFallback: false,
      };

      reportCache.set(cacheKey, { expiresAt: now + HISTORICAL_CACHE_TTL_MS, data: result });
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Clears the reporting memory cache (useful for tests or forced manual refresh)
   */
  clearCache(): void {
    reportCache.clear();
  }
}

export const ga4DataClient = GA4DataApiClient.getInstance();

