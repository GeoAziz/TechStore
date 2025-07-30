// src/lib/firestore-cart.ts
import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

/**
 * Add a product to the user's cart, storing denormalized product info for display.
 * @param userId
 * @param product { productId, quantity, name, price, imageUrl }
 */
export async function addToCart(
  userId: string,
  product: { productId: string; quantity: number; name: string; price: number; imageUrl: string }
) {
  const cartRef = doc(db, 'users', userId, 'cart', 'current');
  const cartSnap = await getDoc(cartRef);
  let cart = cartSnap.exists() ? cartSnap.data() : { items: [] };
  const existing = cart.items.find((item: any) => item.productId === product.productId);
  if (existing) {
    existing.quantity += product.quantity;
  } else {
    cart.items.push(product);
  }
  await setDoc(cartRef, cart);
}

export async function removeFromCart(userId: string, productId: string) {
  const cartRef = doc(db, 'users', userId, 'cart', 'current');
  const cartSnap = await getDoc(cartRef);
  if (!cartSnap.exists()) return;
  let cart = cartSnap.data();
  cart.items = cart.items.filter((item: any) => item.productId !== productId);
  await setDoc(cartRef, cart);
}

export async function getCart(userId: string) {
  const cartRef = doc(db, 'users', userId, 'cart', 'current');
  const cartSnap = await getDoc(cartRef);
  return cartSnap.exists() ? cartSnap.data() : { items: [] };
}

export async function clearCart(userId: string) {
  const cartRef = doc(db, 'users', userId, 'cart', 'current');
  await setDoc(cartRef, { items: [] });
}

// Wishlist
export async function addToWishlist(userId: string, productId: string) {
  const wishlistRef = doc(db, 'users', userId, 'wishlist', 'current');
  const wishlistSnap = await getDoc(wishlistRef);
  let wishlist = wishlistSnap.exists() ? wishlistSnap.data() : { items: [] };
  if (!wishlist.items.includes(productId)) {
    wishlist.items.push(productId);
    await setDoc(wishlistRef, wishlist);
  }
}

export async function removeFromWishlist(userId: string, productId: string) {
  const wishlistRef = doc(db, 'users', userId, 'wishlist', 'current');
  const wishlistSnap = await getDoc(wishlistRef);
  if (!wishlistSnap.exists()) return;
  let wishlist = wishlistSnap.data();
  wishlist.items = wishlist.items.filter((id: string) => id !== productId);
  await setDoc(wishlistRef, wishlist);
}

export async function getWishlist(userId: string) {
  const wishlistRef = doc(db, 'users', userId, 'wishlist', 'current');
  const wishlistSnap = await getDoc(wishlistRef);
  return wishlistSnap.exists() ? wishlistSnap.data() : { items: [] };
}

// Utility to perform checkout: create order, update inventory, clear cart
export async function checkout(userId: string, userInfo: any) {
  const cartRef = doc(db, 'users', userId, 'cart', 'current');
  const cartSnap = await getDoc(cartRef);
  if (!cartSnap.exists() || !cartSnap.data().items.length) {
    throw new Error('Cart is empty');
  }
  const cart = cartSnap.data();
  // Fetch product details and update inventory
  const orderItems = [];
  for (const item of cart.items) {
    const productRef = doc(db, 'products', item.productId);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) throw new Error('Product not found: ' + item.productId);
    const product = productSnap.data();
    if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
    // Update inventory
    await updateDoc(productRef, { stock: product.stock - item.quantity });
    orderItems.push({ ...item, name: product.name, price: product.price });
  }
  // Create order document
  const ordersCol = collection(db, 'orders');
  const orderData = {
    userId,
    userInfo,
    items: orderItems,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(ordersCol), orderData);
  // Clear cart
  await setDoc(cartRef, { items: [] });
  return orderData;
}
