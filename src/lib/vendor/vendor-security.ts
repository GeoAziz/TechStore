import { auth, db } from '@/lib/firebase-admin';

export interface VerifiedVendorContext {
  vendorId: string;
  vendorBrand: string;
  vendorName: string;
  role: 'vendor' | 'admin';
  ownedProductIds: string[];
}

/**
 * Authorizes a vendor request using Firebase Auth token,
 * asserts the role, and queries Firestore to establish the authoritative set
 * of product IDs owned by this vendor.
 *
 * Prevents cross-tenant access and data leakage.
 */
export async function authorizeVendorRequest(
  authHeader?: string
): Promise<VerifiedVendorContext> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED: Missing or invalid Authorization header');
  }

  const token = authHeader.split('Bearer ')[1];
  const decoded = await auth.verifyIdToken(token);
  const userId = decoded.uid;

  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    throw new Error('FORBIDDEN: User profile not found');
  }

  const userData = userDoc.data() || {};
  const role = userData.role;
  if (role !== 'vendor' && role !== 'admin') {
    throw new Error('FORBIDDEN: Vendor role required');
  }

  const vendorId = userData.vendorId || userId;
  const vendorBrand = userData.vendorBrand || userData.displayName || 'Vendor';
  const vendorName = userData.displayName || 'Vendor Partner';

  // Query Firestore products owned by this vendor (by vendorId or brand)
  const productSnap1 = await db.collection('products').where('vendorId', '==', vendorId).get();
  const ownedIds = new Set<string>();

  productSnap1.docs.forEach(d => ownedIds.add(d.id));

  if (vendorBrand) {
    const productSnap2 = await db.collection('products').where('brand', '==', vendorBrand).get();
    productSnap2.docs.forEach(d => ownedIds.add(d.id));
  }

  return {
    vendorId,
    vendorBrand,
    vendorName,
    role,
    ownedProductIds: Array.from(ownedIds),
  };
}

