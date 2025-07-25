
'use server';

import { db } from './firebase-admin';
import type { Product, Order, CartItem } from './types';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

// Re-export types for convenience
export type { Product, Order, CartItem };

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


// --- User Interaction Functions (Cart, Wishlist) ---

/**
 * Adds a product to a user's cart.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product to add.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function addToCart(userId: string, productId: string) {
  if (!userId) {
    return { success: false, message: "User not authenticated." };
  }
  
  const product = await getProductById(productId);
  if (!product) {
    return { success: false, message: "Product not found." };
  }

  const userRef = db.collection('users').doc(userId);
  const cartRef = userRef.collection('cart').doc(productId);

  try {
    await cartRef.set({
      productId: product.id,
      quantity: 1, // For now, default to 1. Could be updated to increment.
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    }, { merge: true }); // Use merge to not overwrite if item already exists

    revalidatePath('/product/[id]', 'page');
    revalidatePath('/');
    return { success: true, message: `${product.name} added to cart.` };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, message: "Failed to add item to cart." };
  }
}

/**
 * Adds a product to a user's wishlist.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product to add.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function toggleWishlist(userId: string, productId: string) {
  if (!userId) {
    return { success: false, message: "User not authenticated." };
  }

  const userRef = db.collection('users').doc(userId);
  
  try {
    const userDoc = await userRef.get();
    const wishlist = userDoc.data()?.wishlist || [];
    let message = '';

    if (wishlist.includes(productId)) {
      // Remove from wishlist
      await userRef.update({
        wishlist: FieldValue.arrayRemove(productId)
      });
      message = 'Removed from wishlist.';
    } else {
      // Add to wishlist
      await userRef.update({
        wishlist: FieldValue.arrayUnion(productId)
      });
      message = 'Added to wishlist.';
    }
    
    revalidatePath('/product/[id]', 'page');
    revalidatePath('/');
    return { success: true, message };
  } catch (error) {
    console.error("Error updating wishlist:", error);
    return { success: false, message: "Failed to update wishlist." };
  }
}

/**
 * Gets the current cart items for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<CartItem[]>}
 */
export async function getCart(userId: string): Promise<CartItem[]> {
  if (!userId) return [];
  const cartSnapshot = await db.collection('users').doc(userId).collection('cart').get();
  if (cartSnapshot.empty) {
    return [];
  }
  return cartSnapshot.docs.map(doc => doc.data() as CartItem);
}
