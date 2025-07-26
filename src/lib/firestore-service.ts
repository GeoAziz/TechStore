
'use server';

import { db } from './firebase-admin';
import type { Product, Order, CartItem, Review, OrderStatus, UserProfile } from './types';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

// Re-export types for convenience
export type { Product, Order, CartItem, Review };

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
    return productDocs.map(doc => ({ id: doc.id, ...doc.data() } as Product)).filter(p => p.name); // filter out non-existent products
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
  return snapshot.docs.map(doc => {
    const data = doc.data();
    // Ensure timestamp is converted to a string right away
    const timestamp = data.timestamp.toDate ? data.timestamp.toDate().toISOString() : new Date(data.timestamp._seconds * 1000).toISOString();
    return { 
      id: doc.id, 
      ...data,
      timestamp,
    } as Order
  });
}

/**
 * Fetches all orders for a specific user.
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
      // Use set with merge to avoid errors on non-existent documents
      await userRef.set({
        wishlist: FieldValue.arrayRemove(productId)
      }, { merge: true });
      message = 'Removed from wishlist.';
    } else {
      // Use set with merge to avoid errors on non-existent documents
      await userRef.set({
        wishlist: FieldValue.arrayUnion(productId)
      }, { merge: true });
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
export async function updateUserProfile(userId: string, profileData: { displayName: string, address: string }) {
    if (!userId) return { success: false, message: "User not authenticated." };
    try {
        await db.collection('users').doc(userId).set({
            displayName: profileData.displayName,
            address: profileData.address,
        }, { merge: true });
        revalidatePath('/dashboard/client');
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
export async function updateOrderStatus(orderId: string, status: string) {
    try {
        await db.collection('orders').doc(orderId).update({ status: status as OrderStatus });
        revalidatePath('/dashboard/admin');
        return { success: true, message: "Order status updated." };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, message: "Failed to update status." };
    }
}


// --- Admin Product & User Management ---

export async function addProduct(product: Omit<Product, 'id'>) {
    try {
        const newProductRef = await db.collection('products').add(product);
        revalidatePath('/admin');
        return { success: true, message: "Product added.", productId: newProductRef.id };
    } catch (error) {
        return { success: false, message: "Failed to add product." };
    }
}

export async function updateProduct(productId: string, updates: Partial<Product>) {
    try {
        await db.collection('products').doc(productId).update(updates);
        revalidatePath('/admin');
        return { success: true, message: "Product updated." };
    } catch (error) {
        return { success: false, message: "Failed to update product." };
    }
}

export async function deleteProduct(productId: string) {
    try {
        await db.collection('products').doc(productId).delete();
        revalidatePath('/admin');
        return { success: true, message: "Product deleted." };
    } catch (error) {
        return { success: false, message: "Failed to delete product." };
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
    } as UserProfile;
  });
}

export async function deleteUser(userId: string) {
    try {
        await db.collection('users').doc(userId).delete();
        // Note: This does not delete the Firebase Auth user.
        revalidatePath('/admin');
        return { success: true, message: "User data deleted." };
    } catch (error) {
        return { success: false, message: "Failed to delete user data." };
    }
}

    
