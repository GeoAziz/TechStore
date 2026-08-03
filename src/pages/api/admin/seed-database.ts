/**
 * POST /api/admin/seed-database
 *
 * Admin endpoint to seed the Firestore database with products
 *
 * Query params:
 * - action: 'seed' (default), 'clear', or 'stats'
 *
 * Example requests:
 * POST /api/admin/seed-database?action=seed
 * POST /api/admin/seed-database?action=stats
 * POST /api/admin/seed-database?action=clear (dangerous - clears all products)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { seedDatabase, clearProducts, getDatabaseStats } from '@/lib/seed-firestore';
import { auth, db } from '@/lib/firebase-admin';

type ResponseData = {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  totalProducts?: number;
  categories?: Record<string, number>;
  products?: { id: string }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Check if the request has admin authentication
    // This is a basic check - you should implement proper auth
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - provide a valid Firebase token',
      });
    }

    // Verify the token (optional but recommended)
    try {
      const token = authHeader.slice(7);
      const decodedToken = await auth.verifyIdToken(token);
      // You could add additional checks here (e.g., check if user is admin)
      console.log('🔐 Request authorized by:', decodedToken.email);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      });
    }

    const action = (req.query.action as string) || 'seed';

    switch (action) {
      case 'seed': {
        const result = await seedDatabase();
        return res.status(result.success ? 200 : 500).json(result);
      }

      case 'clear': {
        // Extra confirmation check
        if (req.query.confirm !== 'true') {
          return res.status(400).json({
            success: false,
            message:
              'Clear operation requires ?confirm=true to prevent accidental deletion',
          });
        }
        const result = await clearProducts();
        return res.status(result.success ? 200 : 500).json(result);
      }

      case 'stats': {
        const result = await getDatabaseStats();
        return res.status(result.success ? 200 : 500).json(result);
      }

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use: seed, stats, or clear',
        });
    }
  } catch (error) {
    console.error('❌ Seed API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
