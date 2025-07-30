
"use client";

import { useEffect, useState } from 'react';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { getProductsByIds } from '@/lib/firestore-service';
import type { Product } from '@/lib/types';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import ProductCard from './product-card';

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Icon className="w-7 h-7 glow-accent text-accent" />
      <h2 className="text-2xl md:text-3xl font-bold glow-primary">{title}</h2>
    </div>
  );
}

function HorizontalScroller({ products, title, icon }: { products: Product[]; title: string; icon: React.ElementType; }) {
  if (!products || products.length === 0) return null;
  
  return (
    <motion.section 
        className="py-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="container">
        <SectionHeading icon={icon} title={title} />
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0c0c1e] to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0c0c1e] to-transparent pointer-events-none z-10" />
          <ScrollArea className="w-full whitespace-nowrap -m-2 p-2">
            <div className="flex w-max space-x-6 py-4">
              {products.map((product, i) => (
                <motion.div 
                  key={product.id} 
                  className="w-72 snap-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: i * 0.08 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="mt-4" />
          </ScrollArea>
        </div>
      </div>
    </motion.section>
  );
}

export default function RecentlyViewedProducts() {
  const { productIds } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (productIds.length > 0) {
        setLoading(true);
        const fetchedProducts = await getProductsByIds(productIds);
        // Maintain the order from recently viewed
        const orderedProducts = productIds.map(id => fetchedProducts.find(p => p.id === id)).filter(p => p) as Product[];
        setProducts(orderedProducts);
        setLoading(false);
      } else {
        setProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productIds]);

  if (loading || products.length === 0) {
    return null; // Don't render anything if loading or no recently viewed items
  }

  return (
    <HorizontalScroller
      products={products}
      title="Recently Viewed"
      icon={History}
    />
  );
}
