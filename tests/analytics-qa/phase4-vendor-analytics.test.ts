import { authorizeVendorRequest } from '@/lib/vendor/vendor-security';
import handler from '@/pages/api/vendor/analytics';
import { ga4DataClient } from '@/lib/analytics/data-api-client';

const mockUsers = new Map<string, any>();
const mockProducts = new Map<string, any>();

jest.mock('@/lib/firebase-admin', () => ({
  auth: {
    verifyIdToken: jest.fn().mockImplementation(async (token: string) => {
      if (token === 'token-vendor-a') return { uid: 'user-vendor-a' };
      if (token === 'token-vendor-b') return { uid: 'user-vendor-b' };
      if (token === 'token-customer') return { uid: 'user-customer' };
      throw new Error('Invalid token');
    }),
  },
  db: {
    collection: (col: string) => ({
      doc: (id: string) => ({
        get: jest.fn().mockImplementation(async () => {
          if (col === 'users') {
            const data = mockUsers.get(id);
            return { exists: !!data, data: () => data };
          }
          return { exists: false, data: () => null };
        }),
      }),
      where: (field: string, op: string, val: any) => ({
        get: jest.fn().mockImplementation(async () => {
          const docs: any[] = [];
          if (col === 'products') {
            for (const [id, prod] of mockProducts.entries()) {
              if (prod[field] === val) {
                docs.push({ id, data: () => prod });
              }
            }
          }
          return { docs };
        }),
      }),
    }),
  },
}));

jest.mock('@/lib/firestore-service', () => ({
  getOrdersByVendor: jest.fn().mockImplementation(async (vendorKey: string) => {
    if (vendorKey === 'vendor-a' || vendorKey === 'Vendor Alpha') {
      return [
        { id: 'ORD-1', total: 50000, items: [{ productId: 'prod-a1', price: 50000, quantity: 1 }] },
      ];
    }
    if (vendorKey === 'vendor-b' || vendorKey === 'Vendor Beta') {
      return [
        { id: 'ORD-2', total: 20000, items: [{ productId: 'prod-b1', price: 20000, quantity: 1 }] },
      ];
    }
    return [];
  }),
}));

describe('Phase 4 Multi-Tenant Vendor Analytics: Authorization & Cross-Tenant Isolation', () => {
  beforeEach(() => {
    mockUsers.clear();
    mockProducts.clear();

    // Vendor A
    mockUsers.set('user-vendor-a', {
      role: 'vendor',
      vendorId: 'vendor-a',
      vendorBrand: 'Vendor Alpha',
      displayName: 'Alice Vendor',
    });
    mockProducts.set('prod-a1', { name: 'Alpha Laptop', vendorId: 'vendor-a', brand: 'Vendor Alpha' });
    mockProducts.set('prod-a2', { name: 'Alpha Mouse', vendorId: 'vendor-a', brand: 'Vendor Alpha' });

    // Vendor B
    mockUsers.set('user-vendor-b', {
      role: 'vendor',
      vendorId: 'vendor-b',
      vendorBrand: 'Vendor Beta',
      displayName: 'Bob Vendor',
    });
    mockProducts.set('prod-b1', { name: 'Beta Keyboard', vendorId: 'vendor-b', brand: 'Vendor Beta' });

    // Customer
    mockUsers.set('user-customer', {
      role: 'customer',
      displayName: 'Charlie Customer',
    });
  });

  it('rejects unauthorized or missing bearer token with 401', async () => {
    await expect(authorizeVendorRequest(undefined)).rejects.toThrow('UNAUTHORIZED');
    await expect(authorizeVendorRequest('Basic 12345')).rejects.toThrow('UNAUTHORIZED');
  });

  it('rejects non-vendor accounts with 403 Forbidden', async () => {
    await expect(authorizeVendorRequest('Bearer token-customer')).rejects.toThrow('FORBIDDEN');
  });

  it('resolves strictly owned products for authenticated vendor', async () => {
    const contextA = await authorizeVendorRequest('Bearer token-vendor-a');
    expect(contextA.vendorId).toBe('vendor-a');
    expect(contextA.ownedProductIds.sort()).toEqual(['prod-a1', 'prod-a2']);
    expect(contextA.ownedProductIds).not.toContain('prod-b1');

    const contextB = await authorizeVendorRequest('Bearer token-vendor-b');
    expect(contextB.vendorId).toBe('vendor-b');
    expect(contextB.ownedProductIds).toEqual(['prod-b1']);
    expect(contextB.ownedProductIds).not.toContain('prod-a1');
  });

  it('guarantees tenant isolation: Vendor A API call receives only Vendor A financials and product filters', async () => {
    const runReportSpy = jest.spyOn(ga4DataClient, 'runReport').mockResolvedValue({
      source: 'ga4_data_api',
      isFallback: false,
      freshnessTimestamp: new Date().toISOString(),
      timeZone: 'Africa/Nairobi',
      period: '30daysAgo_to_today',
      dimensionHeaders: ['itemId', 'itemName'],
      metricHeaders: ['itemsViewed', 'itemsPurchased'],
      rows: [
        { dimensionValues: ['prod-a1', 'Alpha Laptop'], metricValues: [200, 10] },
      ],
      totalRows: 1,
    });

    const req = {
      method: 'GET',
      headers: { authorization: 'Bearer token-vendor-a' },
    } as any;

    let responseStatusCode = 0;
    let responseData: any = null;

    const res = {
      status: (code: number) => {
        responseStatusCode = code;
        return {
          json: (data: any) => {
            responseData = data;
          },
        };
      },
    } as any;

    await handler(req, res);

    expect(responseStatusCode).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.vendor.id).toBe('vendor-a');

    // Assert financial settlement accuracy
    expect(responseData.financialSettlement.grossRevenue).toBe(50000);
    expect(responseData.financialSettlement.commissionAmount).toBe(5000); // 10%
    expect(responseData.financialSettlement.netPayout).toBe(45000);

    // Assert GA4 query was strictly scoped to Vendor A's product IDs
    expect(runReportSpy).toHaveBeenCalled();
    const passedFilter = runReportSpy.mock.calls[0][0].dimensionFilter as any;
    expect(passedFilter.filter.inListFilter.values).toEqual(['prod-a1', 'prod-a2']);
    expect(passedFilter.filter.inListFilter.values).not.toContain('prod-b1');

    runReportSpy.mockRestore();
  });
});

