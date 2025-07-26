
"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Cpu, Monitor, Headphones, HardDrive, View, Rocket, Star, ArrowRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import ProductCard from '@/components/shop/product-card';
import type { Product } from '@/lib/types';
import RecentlyViewedProducts from '@/components/shop/recently-viewed-products';
import { motion } from 'framer-motion';
import { getTrendingProducts, getNewArrivals, getDeals, getFeaturedProducts } from '@/lib/firestore-service';
import { useEffect, useState } from 'react';

const fonts = "font-[Orbitron,Rajdhani,Space Grotesk,monospace]";

function HeroSection() {
  return (
    <section className={`relative flex flex-col items-center justify-center h-[420px] bg-gradient-to-br from-[#10102a] via-[#18182c] to-[#0c0c1e] text-cyan-100 shadow-neon-accent overflow-hidden ${fonts}`}>
       <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
       <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }} 
        className="glass-panel px-8 py-10 rounded-xl text-center max-w-3xl mx-auto z-10"
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-4 tracking-tight glow-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Upgrade Your Tech Universe
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl mb-6 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Shop the best computer accessories & electronics with sci-fi style.
        </motion.p>
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.6, type: 'spring', stiffness: 120 }}
        >
          <Button size="lg" variant="default" className="bg-accent text-white neon-glow px-10 py-5 text-2xl font-bold animate-pulse shadow-lg" asChild>
            <Link href="/shop">Shop Now</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Icon className="w-7 h-7 glow-accent text-accent" />
      <h2 className="text-2xl md:text-3xl font-bold glow-primary">{title}</h2>
    </div>
  );
}

function HorizontalScroller({ products, title, icon, viewAllHref }: { products: Product[]; title: string; icon: React.ElementType; viewAllHref?: string; }) {
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
        <div className="flex justify-between items-center mb-6">
            <SectionHeading icon={icon} title={title} />
            {viewAllHref && (
                 <Link href={viewAllHref}>
                    <Button variant="outline" className="hidden md:flex">
                        View All →
                    </Button>
                 </Link>
            )}
        </div>
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


function FeaturedCategories() {
  const modules = [
    { name: 'Gaming Gear', icon: Cpu, href: '/shop?category=Graphic Cards' },
    { name: 'Displays', icon: Monitor, href: '/shop?category=Monitors' },
    { name: 'Audio Systems', icon: Headphones, href: '/shop?category=Headphones' },
    { name: 'Storage Drives', icon: HardDrive, href: '/shop?category=Storage Drives' },
  ];
  return (
    <motion.section 
        className="py-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="container">
        <SectionHeading icon={View} title="Mission Modules" />
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0c0c1e] to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0c0c1e] to-transparent pointer-events-none z-10" />
            <ScrollArea className="w-full whitespace-nowrap -m-2 p-2">
                <div className="flex w-max space-x-6 py-4">
                    {modules.map((mod, i) => (
                        <motion.div
                            key={mod.name}
                            className="w-60 snap-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Link href={mod.href}>
                              <div className="glass-panel card-glow flex flex-col items-center justify-center p-6 rounded-xl hover:bg-accent/10 transition-all h-full">
                                <mod.icon className="w-10 h-10 mb-3 text-accent" />
                                <span className="font-bold text-lg text-center">{mod.name}</span>
                              </div>
                            </Link>
                        </motion.div>
                      ))}
                      <motion.div
                          className="w-60 snap-center"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <Link href="/categories">
                          <div className="glass-panel card-glow flex flex-col items-center justify-center p-6 rounded-xl hover:bg-primary/10 transition-all h-full border-dashed border-primary/40 hover:border-primary">
                            <ArrowRight className="w-10 h-10 mb-3 text-primary" />
                            <span className="font-bold text-lg text-center text-primary">View All</span>
                          </div>
                        </Link>
                      </motion.div>
                </div>
                <ScrollBar orientation="horizontal" className="mt-4" />
            </ScrollArea>
        </div>
      </div>
    </motion.section>
  );
}

export default function Home() {
    const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [topDeals, setTopDeals] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const [trending, arrivals, deals] = await Promise.all([
                getTrendingProducts(),
                getNewArrivals(),
                getDeals(),
            ]);
            setTrendingProducts(trending);
            setNewArrivals(arrivals);
            setTopDeals(deals);
        };
        fetchProducts();
    }, []);

  return (
    <div className={`min-h-screen bg-[#0c0c1e] text-cyan-100 ${fonts}`}>
      <main className="flex-1">
        <HeroSection />
        <RecentlyViewedProducts />
        <HorizontalScroller products={trendingProducts} title="🔥 Trending Tech" icon={Cpu} viewAllHref="/shop?sort=trending" />
        <HorizontalScroller products={newArrivals} title="🚀 New Arrivals" icon={Rocket} viewAllHref="/shop?sort=new" />
        <HorizontalScroller products={topDeals} title="💸 Top Deals" icon={Star} viewAllHref="/deals" />
        <FeaturedCategories />
      </main>
      <style jsx global>{`
        body { 
            font-family: 'Space Grotesk', 'Rajdhani', 'Orbitron', monospace; 
            background-color: #0c0c1e;
        }
        .glow-primary { text-shadow: 0 0 8px hsl(var(--primary) / 0.8), 0 0 20px hsl(var(--primary) / 0.4); }
        .glow-accent { text-shadow: 0 0 8px hsl(var(--accent) / 0.9), 0 0 24px hsl(var(--accent) / 0.5); }
        .glass-panel { 
            background: rgba(16, 16, 42, 0.6); 
            backdrop-filter: blur(10px); 
            border: 1px solid hsl(var(--primary) / 0.2); 
        }
        .card-glow:hover { 
            box-shadow: 0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.15);
        }
        .bg-grid-pattern {
            background-image:
                linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px),
                linear-gradient(to right, hsl(var(--primary) / 0.05) 1px, transparent 1px);
            background-size: 30px 30px;
        }
      `}</style>
    </div>
  );
}
