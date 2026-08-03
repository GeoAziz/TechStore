
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef, ReactNode } from "react";
import type { CartItem } from '@/lib/types';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { removeFromCart as serverRemoveFromCart } from "@/lib/firestore-service";

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  total: number;
  loading: boolean;
  clearClientCart: () => void;
  removeFromCart: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const SHIPPING_COST = 2500;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const cartRef = collection(db, 'users', user.uid, 'cart');
      const unsubscribe = onSnapshot(cartRef, (snapshot: any) => {
        const items = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as CartItem));
        setCartItems(items);
        setLoading(false);
      }, (error: any) => {
        console.error("Error fetching cart:", error);
        toastRef.current({ variant: "destructive", title: "Error", description: "Could not load cart items." });
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [user]);
  
  const clearClientCart = useCallback(() => {
    setCartItems([]);
  }, []);
  
  const removeFromCart = useCallback(async (productId: string) => {
    if (!user) {
      toastRef.current({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }
    try {
      await serverRemoveFromCart(user.uid, productId);
    } catch (error) {
      toastRef.current({ variant: "destructive", title: "Error", description: "Failed to remove item from cart." });
    }
  }, [user]);

  const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cartItems]);
  const total = subtotal > 0 ? subtotal + SHIPPING_COST : 0;

  const contextValue = useMemo(() => ({
    cartItems, cartCount, subtotal, total, loading, clearClientCart, removeFromCart
  }), [cartItems, cartCount, subtotal, total, loading, clearClientCart, removeFromCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
