/**
 * FULL DATABASE SEEDING - Seeds all 50+ products
 * GET /api/full-seed
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import seedProducts from '@/lib/seed-database';

type ResponseData = {
  success: boolean;
  message: string;
  productsSeeded?: number;
  totalInDatabase?: number;
  categories?: { [key: string]: number };
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('🚀 Starting FULL database seeding...');
    console.log(`📦 Seeding ${seedProducts.length} products...`);

    const batch = db.batch();
    let batchCount = 0;
    const maxBatchSize = 500;

    for (const product of seedProducts) {
      const productId = `${product.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 50)}-${Math.random().toString(36).substr(2, 9)}`;

      const docRef = db.collection('products').doc(productId);

      batch.set(docRef, {
        ...product,
        warranty: product.warranty || '1 Year Manufacturer',
        shippingTime: product.shippingTime || '2-3 Business Days',
        views: product.views || 0,
        cartCount: product.cartCount || 0,
        ordersCount: product.ordersCount || 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      batchCount++;

      if (batchCount === maxBatchSize) {
        await batch.commit();
        console.log(`✅ Committed ${batchCount} products`);
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ Committed final ${batchCount} products`);
    }

    // Get total count and stats
    const snapshot = await db.collection('products').get();
    const categories: { [key: string]: number } = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const cat = data.category;
      categories[cat] = (categories[cat] || 0) + 1;
    });

    console.log('\n✨ FULL SEEDING COMPLETED!');
    console.log(`📊 Total products in database: ${snapshot.size}`);
    console.log('📂 Products by category:', categories);

    return res.status(200).json({
      success: true,
      message: `✨ Successfully seeded ${seedProducts.length} premium tech products!`,
      productsSeeded: seedProducts.length,
      totalInDatabase: snapshot.size,
      categories,
    });
  } catch (error) {
    console.error('❌ Seeding error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
