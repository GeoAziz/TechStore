
'use server';

import { db } from './firebase-admin';
import type { Product, Order } from './types';

// Re-export types for convenience
export type { Product, Order };

// --- Product Functions ---

/**
 * Fetches all products from the 'products' collection.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  const productsCol = db.collection('products');
  const snapshot = await productsCol.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

/**
 * Fetches a single product by its ID from the 'products' collection.
 * @param {string} id - The ID of the product to fetch.
 * @returns {Promise<Product | null>} A promise that resolves to the product or null if not found.
 */
export async function getProductById(id: string): Promise<Product | null> {
  const docRef = db.collection('products').doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() } as Product;
}

/**
 * Fetches all products by a specific brand.
 * @param {string} brandName - The name of the brand.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProductsByVendor(brandName: string): Promise<Product[]> {
  const productsCol = db.collection('products');
  const snapshot = await productsCol.where('brand', '==', brandName).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}


// --- Order Functions ---

/**
 * Fetches all orders from the 'orders' collection.
 * @returns {Promise<Order[]>} A promise that resolves to an array of orders.
 */
export async function getOrders(): Promise<Order[]> {
  const ordersCol = db.collection('orders');
  const snapshot = await ordersCol.orderBy('timestamp', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

/**
 * Fetches all orders for a specific user.
 * @param {string} userEmail - The email of the user.
 * @returns {Promise<Order[]>} A promise that resolves to an array of orders.
 */
export async function getOrdersByUser(userEmail: string): Promise<Order[]> {
    const ordersCol = db.collection('orders');
    const snapshot = await ordersCol.where('user', '==', userEmail).orderBy('timestamp', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}


/**
 * Fetches all orders for products belonging to a specific vendor.
 * @param {string} brandName - The name of the vendor.
 * @returns {Promise<Order[]>} A promise that resolves to an array of orders for that vendor.
 */
export async function getOrdersByVendor(brandName: string): Promise<Order[]> {
  // First, get the names of the products sold by the vendor.
  const vendorProducts = await getProductsByVendor(brandName);
  const vendorProductNames = vendorProducts.map(p => p.name);

  if (vendorProductNames.length === 0) {
    return [];
  }

  // Then, fetch orders where the productName is one of the vendor's products.
  // Firestore 'in' queries are limited to 30 items. For more, you'd need multiple queries.
  const ordersCol = db.collection('orders');
  const snapshot = await ordersCol.where('productName', 'in', vendorProductNames).orderBy('timestamp', 'desc').get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}
