/**
 * Quick seeding endpoint - seeds 5 sample products
 * GET /api/quick-seed
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

type ResponseData = {
  success: boolean;
  message: string;
  count?: number;
  error?: string;
};

const sampleProducts = [
  {
    name: 'HP Pavilion 15 i5 11th Gen',
    category: 'Laptops',
    brand: 'HP',
    price: 74999,
    currency: 'KES',
    stock: 15,
    description: 'Reliable business laptop with Intel Core i5, 8GB RAM, 512GB SSD.',
    imageUrl: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?w=600&h=600&fit=crop',
    isFeatured: true,
    averageRating: 4.6,
    reviewsCount: 24,
  },
  {
    name: 'Dell XPS 13 Plus',
    category: 'Laptops',
    brand: 'Dell',
    price: 149999,
    currency: 'KES',
    stock: 8,
    description: 'Premium ultrabook with stunning display, Intel Core i7, 16GB RAM.',
    imageUrl: 'https://images.pexels.com/photos/7974/pexels-photo.jpg?w=600&h=600&fit=crop',
    isFeatured: true,
    averageRating: 4.9,
    reviewsCount: 52,
  },
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    category: 'Mice',
    brand: 'Logitech',
    price: 12800,
    currency: 'KES',
    stock: 30,
    description: 'Advanced wireless mouse with precision scroll, quiet clicks, 8K DPI sensor.',
    imageUrl: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?w=600&h=600&fit=crop',
    isFeatured: true,
    averageRating: 4.9,
    reviewsCount: 123,
  },
  {
    name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    category: 'Headphones',
    brand: 'Sony',
    price: 34999,
    currency: 'KES',
    stock: 14,
    description: 'Premium noise-cancelling headphones, exceptional sound quality, 30-hour battery.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    isFeatured: true,
    averageRating: 4.9,
    reviewsCount: 156,
  },
  {
    name: 'Apple AirPods Pro (2nd Gen)',
    category: 'Headphones',
    brand: 'Apple',
    price: 24999,
    currency: 'KES',
    stock: 20,
    description: 'Premium wireless earbuds with active noise cancellation, spatial audio.',
    imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80',
    isFeatured: true,
    averageRating: 4.8,
    reviewsCount: 189,
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('🚀 Starting quick seed...');

    let count = 0;
    for (const product of sampleProducts) {
      const docId = `${product.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 50)}-${Math.random().toString(36).substr(2, 9)}`;

      await db.collection('products').doc(docId).set({
        ...product,
        warranty: '1 Year Manufacturer',
        shippingTime: '2-3 Business Days',
        specs: { processor: 'See description', ram: 'Varies', storage: 'Varies' },
        views: 0,
        cartCount: 0,
        ordersCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log(`✅ Added: ${product.name}`);
      count++;
    }

    const totalSnapshot = await db.collection('products').get();

    return res.status(200).json({
      success: true,
      message: `Successfully seeded ${count} sample products!`,
      count: totalSnapshot.size,
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
