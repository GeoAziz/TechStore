
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const MAX_COMPARE_ITEMS = 4;

interface CompareContextType {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareItems, setCompareItems] = useState<Product[]>([]);
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem('compareItems');
      if (storedItems) {
        setCompareItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Failed to parse compare items from localStorage", error);
      setCompareItems([]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('compareItems', JSON.stringify(compareItems));
    }
  }, [compareItems, isInitialized]);

  const addToCompare = (product: Product) => {
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      toast({
        variant: "destructive",
        title: "Compare List Full",
        description: `You can only compare up to ${MAX_COMPARE_ITEMS} items at a time.`,
      });
      return;
    }
    if (!compareItems.some(item => item.id === product.id)) {
      setCompareItems(prevItems => [...prevItems, product]);
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  return (
    <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
