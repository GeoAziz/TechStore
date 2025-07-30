
"use client";

import { useState, useEffect, useCallback } from 'react';

const RECENTLY_VIEWED_KEY = 'zizo-recently-viewed';
const MAX_ITEMS = 10;

export const useRecentlyViewed = () => {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedIds = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (storedIds) {
        setProductIds(JSON.parse(storedIds));
      }
    } catch (error) {
      console.error('Failed to parse recently viewed items from localStorage', error);
      setProductIds([]);
    }
    setIsInitialized(true);
  }, []);

  const addRecentlyViewed = useCallback((productId: string) => {
    if (!isInitialized) return;

    setProductIds(prevIds => {
      // Remove the product if it already exists to move it to the front
      const newIds = prevIds.filter(id => id !== productId);
      // Add the new product to the front
      const updatedIds = [productId, ...newIds];
      // Limit the number of items
      const finalIds = updatedIds.slice(0, MAX_ITEMS);
      
      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(finalIds));
      } catch (error) {
        console.error('Failed to save recently viewed items to localStorage', error);
      }
      
      return finalIds;
    });
  }, [isInitialized]);

  return { productIds, addRecentlyViewed };
};
