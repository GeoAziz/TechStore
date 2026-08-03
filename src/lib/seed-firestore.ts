/**
 * Firestore Database Seeding Script
 *
 * This script populates your Firestore database with the complete product catalog.
 *
 * USAGE:
 * 1. Make sure you have Firebase Admin SDK initialized in firebase-admin.ts
 * 2. Call this function once to seed the database: seedDatabase()
 * 3. You can run it from an admin page or API route
 *
 * Example API route:
 * export async function POST(req: Request) {
 *   const result = await seedDatabase();
 *   return Response.json(result);
 * }
 */

import { db } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import seedProducts from './seed-database';

export async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...');
    console.log(`📦 Seeding ${seedProducts.length} products...`);

    const batch = db.batch();
    let batchCount = 0;
    const maxBatchSize = 500; // Firestore batch write limit

    for (const product of seedProducts) {
      // Generate a readable ID from the product name
      const productId = product.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 50) +
        '-' +
        Math.random().toString(36).substr(2, 9);

      const docRef = db.collection('products').doc(productId);

      // Add timestamps
      const productData = {
        ...product,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        // Initialize metrics
        views: product.views || 0,
        cartCount: product.cartCount || 0,
        ordersCount: product.ordersCount || 0,
        reviewsCount: product.reviewsCount || 0,
      };

      batch.set(docRef, productData);
      batchCount++;

      // Commit batch when it reaches 500 documents
      if (batchCount === maxBatchSize) {
        await batch.commit();
        console.log(`✅ Committed ${batchCount} products`);
        batchCount = 0;
      }
    }

    // Commit remaining documents
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ Committed final ${batchCount} products`);
    }

    console.log('✨ Database seeding completed successfully!');
    return {
      success: true,
      message: `Successfully seeded ${seedProducts.length} products to Firestore`,
      count: seedProducts.length,
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return {
      success: false,
      message: 'Failed to seed database',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clear all products from the database (for testing/reset)
 * WARNING: This will delete all products!
 */
export async function clearProducts() {
  try {
    console.log('🗑️ Clearing all products...');
    const snapshot = await db.collection('products').get();

    const batch = db.batch();
    let count = 0;

    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });

    await batch.commit();
    console.log(`✅ Deleted ${count} products`);

    return {
      success: true,
      message: `Deleted ${count} products`,
      count,
    };
  } catch (error) {
    console.error('❌ Error clearing products:', error);
    return {
      success: false,
      message: 'Failed to clear products',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const snapshot = await db.collection('products').get();
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Group by category
    const byCategory: { [key: string]: number } = {};
    products.forEach((p: any) => {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    });

    return {
      success: true,
      totalProducts: products.length,
      categories: byCategory,
      products,
    };
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return {
      success: false,
      message: 'Failed to get stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
