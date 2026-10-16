import type { NextApiRequest, NextApiResponse } from 'next';
import { db, auth } from '@/lib/firebase-admin';
import { getProductsByVendor, getOrdersByVendor } from '@/lib/firestore-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(token);
    const userId = decoded.uid;

    // Fetch user profile from Firestore to confirm role and vendor identity
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(403).json({ success: false, message: 'User profile not found' });
    }

    const userData = userDoc.data() || {};
    const role = userData.role;
    if (role !== 'vendor' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Vendor role required' });
    }

    // Determine vendor lookup keys: vendorId, vendorBrand, or displayName
    const vendorId = userData.vendorId || userId;
    const vendorBrand = userData.vendorBrand || userData.displayName || 'Vendor';

    // Fetch products belonging to this vendor
    let products = await getProductsByVendor(vendorId);
    if (products.length === 0 && vendorBrand) {
      products = await getProductsByVendor(vendorBrand);
    }

    // Fetch orders for this vendor's products
    let orders = await getOrdersByVendor(vendorId);
    if (orders.length === 0 && vendorBrand) {
      orders = await getOrdersByVendor(vendorBrand);
    }

    // Compute metrics
    const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => (p.stock || 0) < 5).length;

    return res.status(200).json({
      success: true,
      vendor: {
        id: vendorId,
        name: userData.displayName || 'Vendor Partner',
        brand: vendorBrand,
        email: userData.email,
      },
      products,
      orders,
      metrics: {
        totalRevenue,
        totalOrders,
        totalProducts,
        lowStockCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching vendor data:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
}

