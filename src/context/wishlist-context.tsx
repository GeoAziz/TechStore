"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import { getWishlist, toggleWishlist as serverToggleWishlist } from "@/lib/firestore-service";

interface WishlistContextType {
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  refetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: [],
  isInWishlist: () => false,
  toggleWishlist: async () => ({ success: false, message: 'Not initialized' }),
  loading: false,
  refetchWishlist: async () => {},
});

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds([]);
      return;
    }
    try {
      setLoading(true);
      const ids = await getWishlist(user.uid);
      setWishlistIds(ids);
    } catch (err) {
      console.warn("Failed to fetch wishlist:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!user) {
        return { success: false, message: "Please log in to manage your wishlist." };
      }

      // Optimistic update
      const currentlySaved = wishlistIds.includes(productId);
      setWishlistIds((prev) =>
        currentlySaved ? prev.filter((id) => id !== productId) : [...prev, productId]
      );

      try {
        const result = await serverToggleWishlist(user.uid, productId);
        if (!result.success) {
          // Revert optimistic update on error
          setWishlistIds((prev) =>
            currentlySaved ? [...prev, productId] : prev.filter((id) => id !== productId)
          );
        }
        return result;
      } catch (err: any) {
        setWishlistIds((prev) =>
          currentlySaved ? [...prev, productId] : prev.filter((id) => id !== productId)
        );
        return { success: false, message: err?.message || "Failed to update wishlist." };
      }
    },
    [user, wishlistIds]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        loading,
        refetchWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

