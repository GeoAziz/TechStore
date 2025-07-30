
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { CartItem } from '@/lib/types';
import { useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const cartRef = collection(db, 'users', user.uid, 'cart');
      const unsubscribe = onSnapshot(cartRef, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data() } as CartItem));
        setCartItems(items);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching cart:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load cart items." });
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [user, toast]);
  
  const clearClientCart = useCallback(() => {
    setCartItems([]);
  }, []);
  
  const removeFromCart = useCallback(async (productId: string) => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      return;
    }
    await serverRemoveFromCart(user.uid, productId);
    // The onSnapshot listener will automatically update the local state.
  }, [user, toast]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal > 0 ? subtotal + SHIPPING_COST : 0;

  return (
    <CartContext.Provider value={{ cartItems, cartCount, subtotal, total, loading, clearClientCart, removeFromCart }}>
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
