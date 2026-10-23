import type { NextApiRequest, NextApiResponse } from 'next';
import { auth, db } from '@/lib/firebase-admin';
import { ga4DataClient } from '@/lib/analytics/data-api-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 1. Authenticate Admin
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = authHeader.substring(7);
    const decoded = await auth.verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    const role = userDoc.data()?.role;

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    // 2. Query GA4 Data API for Top Products
    const ga4Report = await ga4DataClient.runReport({
      startDate: '30daysAgo',
      endDate: 'today',
      dimensions: ['itemId', 'itemName', 'itemCategory'],
      metrics: ['itemsViewed', 'itemsPurchased', 'itemRevenue'],
      limit: 10,
    });

    if (ga4Report && ga4Report.rows.length > 0) {
      return res.status(200).json({
        success: true,
        source: 'ga4_data_api',
        isFallback: false,
        freshnessTimestamp: ga4Report.freshnessTimestamp,
        timeZone: ga4Report.timeZone,
        period: ga4Report.period,
        items: ga4Report.rows.map(r => ({
          itemId: r.dimensionValues[0],
          itemName: r.dimensionValues[1],
          itemCategory: r.dimensionValues[2],
          views: r.metricValues[0],
          purchases: r.metricValues[1],
          revenue: r.metricValues[2],
          conversionRate: r.metricValues[0] > 0 ? (r.metricValues[1] / r.metricValues[0]) * 100 : 0,
        })),
      });
    }

    // 3. Graceful Fallback: Query verified database sales from Firestore
    const productsSnap = await db.collection('products').limit(10).get();
    const ordersSnap = await db.collection('orders').get();

    const productSalesMap = new Map<string, { count: number; revenue: number }>();
    ordersSnap.docs.forEach(doc => {
      const order = doc.data();
      if (Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const current = productSalesMap.get(item.productId || item.item_id) || { count: 0, revenue: 0 };
          current.count += item.quantity || 1;
          current.revenue += (item.price || 0) * (item.quantity || 1);
          productSalesMap.set(item.productId || item.item_id, current);
        });
      }
    });

    const items = productsSnap.docs.map(doc => {
      const prod = doc.data();
      const sales = productSalesMap.get(doc.id) || { count: 0, revenue: 0 };
      return {
        itemId: doc.id,
        itemName: prod.name || 'Product',
        itemCategory: prod.category || 'General',
        price: prod.price || 0,
        imageUrl: prod.imageUrl || '',
        stock: prod.stock || 0,
        purchases: sales.count,
        revenue: sales.revenue,
      };
    });

    return res.status(200).json({
      success: true,
      source: 'firestore_database',
      isFallback: true,
      freshnessTimestamp: new Date().toISOString(),
      timeZone: 'Africa/Nairobi',
      period: 'lifetime_database_orders',
      notes: 'GA4 Data API not configured or returning empty; displaying verified database transactions.',
      items,
    });
  } catch (error: any) {
    console.error('Error fetching admin top products analytics:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

