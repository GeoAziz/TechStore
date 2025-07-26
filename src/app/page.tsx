
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Cpu, Monitor, Headphones, HardDrive, View, Rocket, Star } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import ProductCard from '@/components/shop/product-card';
import type { Product } from '@/lib/types';

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

function HorizontalScroller({ products, title, icon, viewAllHref }: { products: Product[]; title: string; icon: React.ElementType; viewAllHref: string; }) {
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
              <motion.div 
                initial={{ opacity: 0, x: 40 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.5, delay: products.length * 0.1 }}
                className="snap-center flex items-center justify-center"
              >
                  <Link href={viewAllHref}>
                    <div className="flex items-center justify-center w-48 h-full rounded-xl glass-panel glow-primary text-accent font-bold text-lg hover:bg-accent/10 transition-all">
                        View All →
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {modules.map((mod, i) => (
            <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
            >
                <Link href={mod.href}>
                  <div className="glass-panel card-glow flex flex-col items-center justify-center p-6 rounded-xl hover:bg-accent/10 transition-all h-full">
                    <mod.icon className="w-10 h-10 mb-3 text-accent" />
                    <span className="font-bold text-lg text-center">{mod.name}</span>
                  </div>
                </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default function Home() {
  // Mock data for demonstration - using the full Product type
  const trendingProducts: Product[] = [
    { id: 'rtx-3060-ti', name: 'NVIDIA RTX 3060 Ti', imageUrl: 'https://placehold.co/400x300.png', category: 'Graphic Cards', brand: 'NVIDIA', price: 82000, currency: 'KES', stock: 8, description: 'Powerful graphics card for high-end gaming.', featured: true, rating: 4.8, promoTag: '🔥 Trending', dataAiHint: "graphics card" },
    { id: 'mx-master-3s', name: 'Logitech MX Master 3S', imageUrl: 'https://placehold.co/400x300.png', category: 'Mice', brand: 'Logitech', price: 12800, currency: 'KES', stock: 2, description: 'Ergonomic wireless mouse with 8K DPI.', featured: true, rating: 4.9, dataAiHint: "computer mouse" },
    { id: 'samsung-980-pro-1tb', name: 'Samsung 980 Pro 1TB', imageUrl: 'https://placehold.co/400x300.png', category: 'Storage Drives', brand: 'Samsung', price: 17500, currency: 'KES', stock: 15, description: 'High-speed NVMe SSD for gaming and pro apps.', featured: false, rating: 4.9, promoTag: '🔥 Trending', dataAiHint: "solid state drive" },
    { id: 'redragon-k552', name: 'Redragon K552 Keyboard', imageUrl: 'https://placehold.co/400x300.png', category: 'Keyboards', brand: 'Redragon', price: 5499, currency: 'KES', stock: 0, description: 'Mechanical gaming keyboard with RGB backlighting.', featured: false, rating: 4.4, dataAiHint: "gaming keyboard" },
  ];
  const newArrivals: Product[] = [
    { id: 'jbl-quantum-400', name: 'JBL Quantum 400 Headset', imageUrl: 'https://placehold.co/400x300.png', category: 'Headphones', brand: 'JBL', price: 8500, currency: 'KES', stock: 12, description: 'Immersive surround sound gaming headset.', featured: false, rating: 4.6, promoTag: '💡 New', dataAiHint: "gaming headset" },
    { id: 'acer-nitro-5', name: 'Acer Nitro 5 Laptop', imageUrl: 'https://placehold.co/400x300.png', category: 'Laptops', brand: 'Acer', price: 109999, currency: 'KES', stock: 5, description: 'Gaming laptop with RTX 4060 and 16GB RAM.', featured: true, rating: 4.5, promoTag: '💡 New', dataAiHint: "gaming laptop" },
    { id: 'corsair-vengeance-16gb', name: 'Corsair Vengeance 16GB RAM', imageUrl: 'https://placehold.co/400x300.png', category: 'RAM Modules', brand: 'Corsair', price: 8499, currency: 'KES', stock: 20, description: 'High-speed DDR5 memory for modern PCs.', featured: false, rating: 4.7, dataAiHint: "ram module" },
    { id: 'cooler-master-hyper-212', name: 'Cooler Master Hyper 212', imageUrl: 'https://placehold.co/400x300.png', category: 'Coolers/Fans', brand: 'Cooler Master', price: 4500, currency: 'KES', stock: 25, description: 'Legendary air cooler for CPUs.', featured: false, rating: 4.7, dataAiHint: "cpu cooler" },
  ];
  const topDeals: Product[] = [
    { id: 'dell-ultrasharp-27', name: 'Dell UltraSharp 27" Monitor', imageUrl: 'https://placehold.co/400x300.png', category: 'Monitors', brand: 'Dell', price: 58000, currency: 'KES', stock: 3, description: '4K IPS monitor with stunning color accuracy.', featured: true, rating: 4.8, promoTag: '⚡️ Deal', dataAiHint: "computer monitor" },
    { id: 'hp-pavilion-15', name: 'HP Pavilion 15 Laptop', imageUrl: 'https://placehold.co/400x300.png', category: 'Laptops', brand: 'HP', price: 74999, currency: 'KES', stock: 6, description: 'Versatile laptop for work and entertainment.', featured: false, rating: 4.6, promoTag: '⚡️ Deal', dataAiHint: "business laptop" },
    { id: 'seagate-1tb-hdd', name: 'Seagate 1TB External HDD', imageUrl: 'https://placehold.co/400x300.png', category: 'Storage Drives', brand: 'Seagate', price: 5299, currency: 'KES', stock: 15, description: 'Portable external hard drive for extra storage.', featured: false, rating: 4.6, dataAiHint: "hard drive" },
  ];

  return (
    <div className={`min-h-screen bg-[#0c0c1e] text-cyan-100 ${fonts}`}>
      <main className="flex-1">
        <HeroSection />
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
