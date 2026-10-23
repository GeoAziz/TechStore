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

    // 2. Query GA4 Realtime API
    const realtimeReport = await ga4DataClient.runRealtimeReport({
      dimensions: ['unifiedScreenName'],
      metrics: ['activeUsers'],
      limit: 10,
    });

    if (realtimeReport) {
      const totalActiveUsers = realtimeReport.rows.reduce(
        (sum, r) => sum + (r.metricValues[0] || 0),
        0
      );

      return res.status(200).json({
        success: true,
        source: 'ga4_data_api',
        isFallback: false,
        freshnessTimestamp: realtimeReport.freshnessTimestamp,
        timeZone: realtimeReport.timeZone,
        period: realtimeReport.period,
        activeUsers: totalActiveUsers,
        screens: realtimeReport.rows.map(r => ({
          screen: r.dimensionValues[0],
          activeUsers: r.metricValues[0],
        })),
      });
    }

    // 3. Fallback: Recent active sessions estimated from recent processing orders in Firestore
    const recentOrdersSnap = await db
      .collection('orders')
      .where('status', 'in', ['Processing', 'Pending'])
      .limit(20)
      .get();

    return res.status(200).json({
      success: true,
      source: 'firestore_database',
      isFallback: true,
      freshnessTimestamp: new Date().toISOString(),
      timeZone: 'Africa/Nairobi',
      period: 'recent_orders',
      activeUsers: recentOrdersSnap.size,
      notes: 'GA4 Realtime API not configured; displaying pending order count as live activity signal.',
      screens: [],
    });
  } catch (error: any) {
    console.error('Error fetching admin realtime analytics:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

