'use server';

import { db } from './firebase-admin';
import type { Product, Order, CartItem, Review, OrderStatus, UserProfile, UserRole } from './types';
// Define AuditLog type here since it's missing from types
export type AuditLog = {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: 'product' | 'user' | 'order';
  targetId: string;
  details: Record<string, any>;
  timestamp: string;
};

import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
// Remove or stub missing genkit import
// import { runGenkitFlow } from './genkit'; // hypothetical Genkit SDK wrapper
const runGenkitFlow = async (flow: string, params: Record<string, any>) => {
  // Stub: return mock result
  return { success: true, flow, params };
};

// Re-export types for convenience
export type { Product, Order, CartItem, Review };


// Helper function to safely convert Firestore Timestamps
function serializeTimestamp(data: { [key: string]: any }): { [key: string]: any } {
  const serializedData = { ...data };
  for (const key in serializedData) {
    if (serializedData[key] instanceof Timestamp) {
      serializedData[key] = serializedData[key].toDate().toISOString();
    }
  }
  return serializedData;
}


// --- Product Functions ---

/**
 * Fetches all products from the 'products' collection.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProducts(): Promise<Product[]> {
  const productsCol = db.collection('products');
  const snapshot = await productsCol.orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...serializeTimestamp(doc.data()) } as Product));
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
  return { id: doc.id, ...serializeTimestamp(doc.data() || {}) } as Product;
}

/**
 * Fetches multiple products by their IDs.
 * @param {string[]} ids - An array of product IDs.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) {
        return [];
    }
    const productRefs = ids.map(id => db.collection('products').doc(id));
    const productDocs = await db.getAll(...productRefs);
    return productDocs.map(doc => ({ id: doc.id, ...serializeTimestamp(doc.data() || {}) } as Product)).filter(p => p.name); // filter out non-existent products
}


/**
 * Fetches all products by a specific brand.
 * @param {string} brandName - The name of the brand.
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export async function getProductsByVendor(brandName: string): Promise<Product[]> {
  const productsCol = db.collection('products');
  const snapshot = await productsCol.where('brand', '==', brandName).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...serializeTimestamp(doc.data()) } as Product));
}

// --- Dynamic Homepage Section Fetchers ---

/**
 * Fetches trending products. Logic: highest views, then most orders.
 */
export async function getTrendingProducts(): Promise<Product[]> {
    const productsCol = db.collection('products');
    const snapshot = await productsCol.orderBy('views', 'desc').orderBy('ordersCount', 'desc').limit(10).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...serializeTimestamp(doc.data()) } as Product));
}

/**
 * Fetches new arrival products (created within the last 30 days).
 */
export async function getNewArrivals(): Promise<Product[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);

    const productsCol = db.collection('products');
    const snapshot = await productsCol
        .where('createdAt', '>=', thirtyDaysAgoTimestamp)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...serializeTimestamp(doc.data()) } as Product));
}

/**
 * Fetches products that are on deal.
 */
export async function getDeals(): Promise<Product[]> {
    const productsCol = db.collection('products');
    const snapshot = await productsCol
        .where('discountPercent', '>=', 10)
        .orderBy('discountPercent', 'desc')
        .limit(10)
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...serializeTimestamp(doc.data()) } as Product));
}

/**
 * Fetches featured products as flagged by an admin.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
    const productsCol = db.collection('products');
    const snapshot = await productsCol.where('isFeatured', '==', true).limit(10).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...serializeTimestamp(doc.data()) } as Product));
}


// --- Order Functions ---

/**
 * Fetches all orders from the 'orders' collection.
 * @returns {Promise<Order[]>} A promise that resolves to an array of orders.
 */
export async function getOrders(): Promise<Order[]> {
  const ordersCol = db.collection('orders');
  const snapshot = await ordersCol.orderBy('timestamp', 'desc').get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    let timestamp;
    if (data.timestamp && typeof data.timestamp.toDate === 'function') {
      timestamp = data.timestamp.toDate().toISOString();
    } else if (typeof data.timestamp === 'string') {
      // Try to parse string timestamp
      const parsed = new Date(data.timestamp);
      timestamp = isNaN(parsed.getTime()) ? data.timestamp : parsed.toISOString();
    } else if (data.timestamp && typeof data.timestamp._seconds === 'number') {
      timestamp = new Date(data.timestamp._seconds * 1000).toISOString();
    } else {
      timestamp = new Date().toISOString(); // Fallback
    }
    return { 
      id: doc.id, 
      ...data,
      timestamp,
    } as Order
  });
}

/**
 * Fetches all orders for a specific user email.
 * @param {string} userEmail - The email of the user.
 * @returns {Promise<Order[]>} A promise that resolves to an array of orders.
 */
export async function getOrdersByUser(userEmail: string): Promise<Order[]> {
    const ordersCol = db.collection('orders');
    const snapshot = await ordersCol.where('user', '==', userEmail).orderBy('timestamp', 'desc').get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const timestamp = data.timestamp.toDate ? data.timestamp.toDate().toISOString() : new Date(data.timestamp._seconds * 1000).toISOString();
      return { 
        id: doc.id, 
        ...data,
        timestamp,
      } as Order
    });
}

/**
 * Fetches all orders for a specific user ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Order[]>} A promise that resolves to an array of orders.
 */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
    if (!userId) return [];
    // First, get the user's email as orders are keyed by email currently
    const userDoc = await db.collection('users').doc(userId).get();
    const userEmail = userDoc.data()?.email;
    if (!userEmail) return [];
    return getOrdersByUser(userEmail);
}


/**
 * Fetches all orders for products belonging to a specific vendor.
 * @param {string} brandName - The name of the vendor.
 * @returns {Promise<Order[]>} A promise that resolves to an array of orders for that vendor.
 */
export async function getOrdersByVendor(brandName: string): Promise<Order[]> {
  const vendorProducts = await getProductsByVendor(brandName);
  const vendorProductNames = vendorProducts.map(p => p.name);

  if (vendorProductNames.length === 0) {
    return [];
  }

  const ordersCol = db.collection('orders');
  const snapshot = await ordersCol.where('productName', 'in', vendorProductNames).orderBy('timestamp', 'desc').get();
  
  return snapshot.docs.map(doc => {
      const data = doc.data();
      const timestamp = data.timestamp.toDate ? data.timestamp.toDate().toISOString() : new Date(data.timestamp._seconds * 1000).toISOString();
      return { 
        id: doc.id, 
        ...data,
        timestamp,
      } as Order
    });
}


// --- User Interaction Functions (Cart, Wishlist, Reviews, Profile) ---

/**
 * Checks if a product is in the user's cart.
 * @param userId The user's ID.
 * @param productId The product's ID.
 * @returns A promise that resolves to a boolean.
 */
export async function isInCart(userId: string, productId: string): Promise<boolean> {
  if (!userId) return false;
  const cartRef = db.collection('users').doc(userId).collection('cart').doc(productId);
  const doc = await cartRef.get();
  return doc.exists;
}

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
      quantity: 1, 
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    }, { merge: true });

    revalidatePath('/product/[id]', 'page');
    revalidatePath('/');
    return { success: true, message: `${product.name} added to cart.` };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, message: "Failed to add item to cart." };
  }
}

/**
 * Removes a product from a user's cart.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product to remove.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function removeFromCart(userId: string, productId: string) {
    if (!userId) {
        return { success: false, message: "User not authenticated." };
    }
    const cartRef = db.collection('users').doc(userId).collection('cart').doc(productId);
    try {
        await cartRef.delete();
        revalidatePath('/checkout');
        revalidatePath('/product/[id]', 'page');
        return { success: true, message: "Item removed from cart." };
    } catch (error) {
        console.error("Error removing from cart:", error);
        return { success: false, message: "Failed to remove item from cart." };
    }
}


/**
 * Toggles a product in a user's wishlist.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product to toggle.
 * @returns {Promise<{success: boolean, message: string, wishlist?: string[]}>}
 */
export async function toggleWishlist(userId: string, productId: string) {
  if (!userId) {
    return { success: false, message: "User not authenticated." };
  }

  const userRef = db.collection('users').doc(userId);
  
  try {
    const userDoc = await userRef.get();
    const currentWishlist = userDoc.data()?.wishlist || [];
    let message = '';

    if (currentWishlist.includes(productId)) {
      await userRef.update({
        wishlist: FieldValue.arrayRemove(productId)
      });
      message = 'Removed from wishlist.';
    } else {
      await userRef.update({
        wishlist: FieldValue.arrayUnion(productId)
      });
      message = 'Added to wishlist.';
    }
    
    revalidatePath('/product/[id]', 'page');
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/wishlist');

    // Refetch the latest wishlist state to return it
    const updatedUserDoc = await userRef.get();
    const newWishlist = updatedUserDoc.data()?.wishlist || [];

    return { success: true, message, wishlist: newWishlist };
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


/**
 * Adds a review to a product.
 * @param {string} productId - The ID of the product being reviewed.
 * @param {Omit<Review, 'id' | 'timestamp'>} reviewData - The review data.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function addReview(productId: string, reviewData: Omit<Review, 'id' | 'timestamp'>) {
  if (!reviewData.userId) {
    return { success: false, message: "User not authenticated." };
  }

  const reviewWithTimestamp = {
    ...reviewData,
    timestamp: FieldValue.serverTimestamp(),
  };

  try {
    const reviewsCol = db.collection('products').doc(productId).collection('reviews');
    await reviewsCol.add(reviewWithTimestamp);
    
    revalidatePath(`/product/${productId}`);
    return { success: true, message: "Review added successfully." };
  } catch (error) {
    console.error("Error adding review:", error);
    return { success: false, message: "Failed to add review." };
  }
}

/**
 * Fetches all reviews for a specific product.
 * @param {string} productId - The ID of the product.
 * @returns {Promise<Review[]>}
 */
export async function getReviewsByProductId(productId: string): Promise<Review[]> {
  const reviewsCol = db.collection('products').doc(productId).collection('reviews');
  const snapshot = await reviewsCol.orderBy('timestamp', 'desc').get();
  
  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(doc => {
    const data = doc.data();
    const timestamp = data.timestamp.toDate ? data.timestamp.toDate().toISOString() : new Date(data.timestamp._seconds * 1000).toISOString();
    return {
      id: doc.id,
      ...data,
      timestamp,
    } as Review;
  });
}

/**
 * Gets the current wishlist for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>}
 */
export async function getWishlist(userId: string): Promise<string[]> {
    if (!userId) return [];
    const userDoc = await db.collection('users').doc(userId).get();
    return userDoc.data()?.wishlist || [];
}

/**
 * Updates a user's profile information.
 * @param userId The user's ID.
 * @param profileData The data to update.
 */
export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>) {
    if (!userId) return { success: false, message: "User not authenticated." };
    try {
        await db.collection('users').doc(userId).set(profileData, { merge: true });
        // Log audit action for profile update
        await logAdminAction(userId, profileData.email || '', 'update profile', profileData, 'user');
        revalidatePath('/admin/profile');
        revalidatePath('/admin/layout'); // To refresh header
        revalidatePath('/admin');
        return { success: true, message: "Profile updated." };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, message: "Failed to update profile." };
    }
}

/**
 * Cancels an order.
 * @param orderId The ID of the order to cancel.
 */
export async function cancelOrder(orderId: string) {
    try {
        await db.collection('orders').doc(orderId).update({ status: 'Cancelled' });
        revalidatePath('/dashboard/client');
        return { success: true, message: "Order cancelled." };
    } catch (error) {
        console.error("Error cancelling order:", error);
        return { success: false, message: "Failed to cancel order." };
    }
}

/**
 * Creates a new order based on an existing one.
 * @param orderId The ID of the order to reorder.
 */
export async function reorder(orderId: string) {
    try {
        const orderDoc = await db.collection('orders').doc(orderId).get();
        const order = orderDoc.data();
        if (!order) return { success: false, message: "Order not found." };
        
        const newOrder = {
            ...order,
            status: 'Processing',
            timestamp: FieldValue.serverTimestamp(),
        };
        const newOrderRef = await db.collection('orders').add(newOrder);
        revalidatePath('/dashboard/client');
        return { success: true, message: "Reorder successful.", newOrderId: newOrderRef.id };
    } catch (error) {
        console.error("Error reordering:", error);
        return { success: false, message: "Failed to reorder." };
    }
}

/**
 * Updates an order's status (Admin).
 * @param orderId The ID of the order.
 * @param status The new status.
 */
export async function updateOrderStatus(orderId: string, status: string, adminId: string, adminEmail: string) {
    try {
        await db.collection('orders').doc(orderId).update({ status: status as OrderStatus });
        await logAdminAction(adminId, adminEmail, 'update order status', { orderId, newStatus: status }, 'order');
        revalidatePath('/admin');
        return { success: true, message: "Order status updated." };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, message: "Failed to update status." };
    }
}


// --- Admin Product & User Management ---

export async function addProduct(product: Omit<Product, 'id'>, adminId: string, adminEmail: string) {
    try {
        const newProductRef = await db.collection('products').add({
            ...product,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
        await logAdminAction(adminId, adminEmail, 'add product', { productId: newProductRef.id, name: product.name }, 'product');
        revalidatePath('/admin');
        return { success: true, message: "Product added.", productId: newProductRef.id };
    } catch (error) {
        console.error("Error adding product:", error);
        return { success: false, message: "Failed to add product." };
    }
}

export async function updateProduct(productId: string, updates: Partial<Product>, adminId: string, adminEmail: string) {
    try {
        await db.collection('products').doc(productId).update({
            ...updates,
            updatedAt: FieldValue.serverTimestamp(),
        });
        await logAdminAction(adminId, adminEmail, 'update product', { productId, updates }, 'product');
        revalidatePath('/admin');
        revalidatePath(`/product/${productId}`);
        return { success: true, message: "Product updated." };
    } catch (error) {
        console.error("Error updating product:", error);
        return { success: false, message: "Failed to update product." };
    }
}

export async function deleteProduct(productId: string, adminId: string, adminEmail: string) {
    try {
        await db.collection('products').doc(productId).delete();
        await logAdminAction(adminId, adminEmail, 'delete product', { productId }, 'product');
        revalidatePath('/admin');
        return { success: true, message: "Product deleted." };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { success: false, message: "Failed to delete product." };
    }
}

export async function deleteMultipleProducts(productIds: string[], adminId: string, adminEmail: string) {
    try {
        const batch = db.batch();
        productIds.forEach(id => {
            batch.delete(db.collection('products').doc(id));
        });
        await batch.commit();
        await logAdminAction(adminId, adminEmail, 'bulk delete products', { productIds }, 'product');
        revalidatePath('/admin');
        return { success: true, message: `${productIds.length} products deleted.` };
    } catch (error) {
        console.error("Error bulk deleting products:", error);
        return { success: false, message: "Failed to delete products." };
    }
}

export async function getUsers(): Promise<UserProfile[]> {
  const usersCol = db.collection('users');
  const snapshot = await usersCol.get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
        uid: doc.id,
        email: data.email || '',
        displayName: data.displayName || '',
        role: data.role || 'client',
        photoURL: data.photoURL || '',
        createdAt: data.createdAt ? serializeTimestamp({ createdAt: data.createdAt }).createdAt : null
    } as UserProfile;
  });
}

export async function updateUserRole(userId: string, role: UserRole, adminId: string, adminEmail: string) {
    if (!userId) return { success: false, message: "User ID is required." };
    try {
        await db.collection('users').doc(userId).update({ role });
        await logAdminAction(adminId, adminEmail, 'update user role', { userId, newRole: role }, 'user');
        revalidatePath('/admin');
        return { success: true, message: "User role updated." };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, message: "Failed to update user role." };
    }
}

export async function deleteUser(userId: string, adminId: string, adminEmail: string) {
    if (!userId) return { success: false, message: "User ID is required." };
    try {
        // Note: This does not delete the Firebase Auth user. That requires a separate SDK call and elevated privileges.
        await db.collection('users').doc(userId).delete();
        await logAdminAction(adminId, adminEmail, 'delete user', { userId }, 'user');
        revalidatePath('/admin');
        return { success: true, message: "User data deleted from Firestore." };
    } catch (error) {
        console.error("Error deleting user data:", error);
        return { success: false, message: "Failed to delete user data." };
    }
}

export async function deleteMultipleUsers(userIds: string[], adminId: string, adminEmail: string) {
    try {
        const batch = db.batch();
        userIds.forEach(id => {
            batch.delete(db.collection('users').doc(id));
        });
        await batch.commit();
        await logAdminAction(adminId, adminEmail, 'bulk delete users', { userIds }, 'user');
        revalidatePath('/admin');
        return { success: true, message: `${userIds.length} users deleted.` };
    } catch (error) {
        console.error("Error bulk deleting users:", error);
        return { success: false, message: "Failed to delete users." };
    }
}

// --- Audit Log Functions ---
export async function logAdminAction(adminId: string, adminEmail: string, action: string, details: Record<string, any>, targetType: 'product' | 'user' | 'order') {
  try {
    await db.collection('audit_logs').add({
      adminId,
      adminEmail,
      action,
      targetType,
      targetId: details.productId || details.userId || details.orderId || 'N/A',
      details,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
    const logsCol = db.collection('audit_logs');
    const snapshot = await logsCol.orderBy('timestamp', 'desc').limit(100).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...serializeTimestamp(doc.data()) } as AuditLog));
}

// --- Genkit AI Flows ---
// These functions integrate with Genkit for product customizer and compatibility checks

export async function getCompatibilityReport(selectedProductIds: string[]): Promise<any> {
  try {
    // Call Genkit flow for compatibility check
    const result = await runGenkitFlow('compatibility-check', { productIds: selectedProductIds });
    return result;
  } catch (error) {
    console.error('Genkit compatibility error:', error);
    return { success: false, message: 'Failed to get compatibility report.' };
  }
}

export async function getCustomizerSuggestions(userInput: string): Promise<any> {
  try {
    // Call Genkit flow for customizer suggestions
    const result = await runGenkitFlow('customizer-suggest', { input: userInput });
    return result;
  } catch (error) {
    console.error('Genkit customizer error:', error);
    return { success: false, message: 'Failed to get customizer suggestions.' };
  }
}
