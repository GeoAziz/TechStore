import type { NextApiRequest, NextApiResponse } from 'next';
import { authorizeVendorRequest } from '@/lib/vendor/vendor-security';
import { ga4DataClient } from '@/lib/analytics/data-api-client';
import { getOrdersByVendor } from '@/lib/firestore-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // 1. Authorize vendor and resolve strictly owned product IDs from Firestore
    const vendorContext = await authorizeVendorRequest(req.headers.authorization);
    const { vendorId, vendorBrand, vendorName, ownedProductIds } = vendorContext;

    // 2. Fetch Authoritative Financial Truth from Firestore
    let orders = await getOrdersByVendor(vendorId);
    if (orders.length === 0 && vendorBrand) {
      orders = await getOrdersByVendor(vendorBrand);
    }

    const grossRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
    // Platform commission rate: 10%
    const commissionRate = 0.10;
    const commission = grossRevenue * commissionRate;
    const netPayout = grossRevenue - commission;

    // 3. Fetch Behavioral Analytics from GA4 with strict tenant product filtering
    let behavioralAnalytics: {
      source: 'ga4_data_api' | 'firestore_database';
      isFallback: boolean;
      totalViews: number;
      totalCartAdds: number;
      cartConversionRate: number;
      productEngagement: Array<{
        itemId: string;
        itemName?: string;
        views: number;
        purchases: number;
      }>;
    } = {
      source: 'firestore_database',
      isFallback: true,
      totalViews: 0,
      totalCartAdds: 0,
      cartConversionRate: 0,
      productEngagement: [],
    };

    if (ownedProductIds.length > 0) {
      // Query GA4 using explicit itemId in list filter, strictly isolated to ownedProductIds
      const dimensionFilter = {
        filter: {
          fieldName: 'itemId',
          inListFilter: {
            values: ownedProductIds,
          },
        },
      };

      const ga4Report = await ga4DataClient.runReport({
        startDate: '30daysAgo',
        endDate: 'today',
        dimensions: ['itemId', 'itemName'],
        metrics: ['itemsViewed', 'itemsPurchased'],
        dimensionFilter,
        limit: 50,
      });

      if (ga4Report && !ga4Report.isFallback) {
        let totalViews = 0;
        let totalPurchases = 0;
        const productEngagement = ga4Report.rows.map(r => {
          const views = r.metricValues[0] || 0;
          const purchases = r.metricValues[1] || 0;
          totalViews += views;
          totalPurchases += purchases;
          return {
            itemId: r.dimensionValues[0],
            itemName: r.dimensionValues[1],
            views,
            purchases,
          };
        });

        behavioralAnalytics = {
          source: 'ga4_data_api',
          isFallback: false,
          totalViews,
          totalCartAdds: Math.round(totalViews * 0.15), // Estimated cart addition
          cartConversionRate: totalViews > 0 ? (totalPurchases / totalViews) * 100 : 0,
          productEngagement,
        };
      }
    }

    return res.status(200).json({
      success: true,
      vendor: {
        id: vendorId,
        brand: vendorBrand,
        name: vendorName,
        totalProductsOwned: ownedProductIds.length,
      },
      financialSettlement: {
        source: 'firestore_orders_ledger',
        currency: 'KES',
        grossRevenue,
        commissionRate: '10%',
        commissionAmount: commission,
        netPayout,
        orderCount: orders.length,
      },
      behavioralAnalytics,
    });
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED')) {
      return res.status(401).json({ success: false, message: error.message });
    }
    if (error.message?.startsWith('FORBIDDEN')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    console.error('Vendor analytics error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

