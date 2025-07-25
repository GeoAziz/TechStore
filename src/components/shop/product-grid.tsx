"use client";
import React, { useState, useEffect } from 'react';
import ProductCard from './product-card';
import type { Product } from '@/lib/types';
import { motion } from 'framer-motion';

// Remove local Product type, use the one from '@/lib/types'

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [visible, setVisible] = useState(12);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisible(v => v + 12);
      setLoading(false);
    }, 600); // Simulate network delay
  };

  useEffect(() => {
    setVisible(12);
  }, [products]);

  return (
    <div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
      >
        {products.slice(0, visible).map((product) => (
          <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
      {visible < products.length && (
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-2 bg-neon-blue text-black font-bold rounded-xl shadow-neon hover:bg-neon-violet transition-all"
            onClick={handleLoadMore}
            disabled={loading}
            type="button"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
