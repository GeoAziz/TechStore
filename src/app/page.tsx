"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Cpu, Laptop, Mouse, MemoryStick, Monitor, Keyboard, Headphones, Camera, HardDrive, CircuitBoard, Power, Wind, View, Heart, Star, Truck, Shield, Rocket } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const fonts = "font-[Orbitron,Rajdhani,Space Grotesk,monospace]";

function HeroSection() {
  return (
    <section className={`relative flex flex-col items-center justify-center h-[420px] bg-gradient-to-br from-[#10102a] via-[#18182c] to-[#0c0c1e] text-cyan-100 shadow-neon-accent ${fonts}`}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="glass-panel px-8 py-10 rounded-xl text-center max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight neon-glow">Upgrade Your Tech Universe</h1>
        <p className="text-xl md:text-2xl mb-6 text-muted-foreground">Shop the best computer accessories & electronics with sci-fi style.</p>
        <Button size="lg" variant="default" className="bg-accent text-white neon-glow px-10 py-5 text-2xl font-bold animate-pulse shadow-lg">Shop Now</Button>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="absolute bottom-0 left-0 right-0 flex justify-center gap-8 py-4">
        <Badge variant="secondary" className="text-lg animate-pulse">Trending</Badge>
        <Badge variant="outline" className="text-lg animate-pulse">New Arrivals</Badge>
        <Badge variant="default" className="text-lg animate-pulse">Top Deals</Badge>
      </motion.div>
    </section>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Icon className="w-7 h-7 neon-glow text-accent" />
      <h2 className="text-2xl md:text-3xl font-bold neon-glow">{title}</h2>
    </div>
  );
}

function HorizontalScroller({ products, title, icon, viewAllHref, badge }: { products: any[]; title: string; icon: React.ElementType; viewAllHref: string; badge: string }) {
  return (
    <section className="py-10">
      <div className="container">
        <SectionHeading icon={icon} title={title} />
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#10102a] via-transparent to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#10102a] via-transparent to-transparent pointer-events-none z-10" />
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-6 p-2 snap-x snap-mandatory overflow-x-auto">
              {products.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="snap-center">
                  <ProductCard product={{ ...product, badge }} />
                </motion.div>
              ))}
              <Link href={viewAllHref} className="flex items-center justify-center w-48 h-64 rounded-xl glass-panel neon-glow text-accent font-bold text-lg hover:bg-accent/10 transition-all snap-center">
                Explore More
              </Link>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div className="flex justify-end mt-4">
          <Button asChild variant="outline" className="neon-glow">
            <Link href={viewAllHref}>View All</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: any }) {
  const [wish, setWish] = useState(false);
  return (
    <motion.div
      whileHover={{ scale: 1.07 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-card/80 border-accent/40 shadow-neon-accent rounded-xl p-4 flex flex-col gap-2 glass-panel ${fonts} relative group`}
      tabIndex={0}
      aria-label={product.name}
    >
      {product.badge && (
        <Badge variant="default" className="absolute top-2 left-2 neon-glow text-xs font-bold z-10">{product.badge}</Badge>
      )}
      <div className="relative">
        <img src={product.image} alt={product.name} className="rounded-lg h-40 object-cover mb-2 w-full" loading="lazy" />
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 neon-glow" aria-label="Wishlist" onClick={() => setWish(!wish)}>
          <Heart className={`w-6 h-6 ${wish ? 'text-accent' : 'text-muted-foreground'}`} />
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-cyan-100">{product.name}</h2>
        <Badge variant={product.inStock ? 'secondary' : 'destructive'}>{product.inStock ? (product.stock < 5 ? 'Low Stock' : 'In Stock') : 'Out of Stock'}</Badge>
      </div>
      <div className="flex gap-2 text-xs text-muted-foreground">
        <Truck className="w-4 h-4 text-accent" /> <span>Free Shipping</span>
        <Shield className="w-4 h-4 text-accent ml-2" /> <span>Warranty: 1yr</span>
      </div>
      <div className="flex gap-2 mt-2">
        <motion.div whileHover={{ scale: 1.1 }} className="flex-1">
          <Button variant="default" className="w-full font-bold neon-glow shadow-lg transition-transform" aria-label={`Add ${product.name} to cart`}>Add to Cart</Button>
        </motion.div>
        <Button variant="ghost" className="flex-1 font-bold" aria-label={`Compare ${product.name}`}>Compare</Button>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <Star className="w-4 h-4 text-yellow-400" />
        <span className="font-bold">{product.rating}</span>
        <span className="text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
      </div>
      <motion.div className="flex gap-2 mt-2 flex-wrap" whileHover={{ y: -2, scale: 1.05 }}>
        {product.specs.map((spec: string) => (
          <Badge key={spec} variant="secondary">{spec}</Badge>
        ))}
      </motion.div>
    </motion.div>
  );
}

function MissionModules() {
  const modules = [
    { name: '🎮 Gaming Gear', icon: MemoryStick, href: '/shop?category=Gaming' },
    { name: '🖥️ Monitor & Display', icon: Monitor, href: '/shop?category=Monitors' },
    { name: '🔊 Audio Systems', icon: Headphones, href: '/shop?category=Audio' },
    { name: '💾 Storage Drives', icon: HardDrive, href: '/shop?category=Storage' },
  ];
  return (
    <section className="py-10">
      <div className="container">
        <SectionHeading icon={View} title="Mission Modules" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {modules.map((mod) => (
            <Link href={mod.href} key={mod.name} className="glass-panel neon-glow flex flex-col items-center justify-center p-6 rounded-xl hover:bg-accent/10 transition-all">
              <mod.icon className="w-8 h-8 mb-2 text-accent" />
              <span className="font-bold text-lg">{mod.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Add FeaturedCategories component
function FeaturedCategories({ categories }: { categories: { name: string; icon: React.ElementType; href: string }[] }) {
  return (
    <section className="py-10">
      <div className="container">
        <SectionHeading icon={Star} title="Featured Categories" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link href={cat.href} key={cat.name} className="glass-panel neon-glow flex flex-col items-center justify-center p-6 rounded-xl hover:bg-accent/10 transition-all">
              <cat.icon className="w-8 h-8 mb-2 text-accent" />
              <span className="font-bold text-lg">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  // Example data
  const trendingProducts = [
    { id: 1, name: 'Corsair RGB Keyboard', image: '/products/keyboard.jpg', inStock: true, stock: 8, rating: 4.8, reviewCount: 120, specs: ['RGB', 'Mechanical', 'USB'] },
    { id: 2, name: 'Logitech G502 Mouse', image: '/products/mouse.jpg', inStock: true, stock: 2, rating: 4.7, reviewCount: 98, specs: ['Wireless', 'Gaming', 'DPI'] },
    { id: 3, name: 'Samsung SSD 1TB', image: '/products/ssd.jpg', inStock: false, stock: 0, rating: 4.9, reviewCount: 210, specs: ['1TB', 'NVMe', 'Fast'] },
  ];
  const newArrivals = [
    { id: 4, name: 'Razer Gaming Headset', image: '/products/headset.jpg', inStock: true, stock: 12, rating: 4.6, reviewCount: 45, specs: ['Surround', 'Wireless', 'RGB'] },
    { id: 5, name: 'Acer Nitro Laptop', image: '/products/laptop.jpg', inStock: true, stock: 5, rating: 4.5, reviewCount: 32, specs: ['16GB RAM', 'RTX 4060', '1TB SSD'] },
    { id: 6, name: 'WD Blue HDD 2TB', image: '/products/hdd.jpg', inStock: true, stock: 20, rating: 4.4, reviewCount: 60, specs: ['2TB', 'SATA', '7200RPM'] },
    { id: 9, name: 'Kingston Fury RAM 32GB', image: '/products/ram.jpg', inStock: true, stock: 15, rating: 4.9, reviewCount: 95, specs: ['32GB', 'DDR5', 'RGB'] },
  ];
  const featuredCategories = [
    { name: 'Gaming', icon: MemoryStick, href: '/shop?category=Gaming' },
    { name: 'Laptops', icon: Laptop, href: '/shop?category=Laptops' },
    { name: 'Audio', icon: Headphones, href: '/shop?category=Audio' },
    { name: 'Storage', icon: HardDrive, href: '/shop?category=Storage' },
  ];
  const topDeals = [
    { id: 7, name: 'Dell UltraSharp Monitor', image: '/products/monitor.jpg', inStock: true, stock: 3, rating: 4.8, reviewCount: 80, specs: ['27"', 'IPS', '144Hz'] },
    { id: 8, name: 'SteelSeries Mechanical Keyboard', image: '/products/steelseries.jpg', inStock: true, stock: 6, rating: 4.7, reviewCount: 65, specs: ['Mechanical', 'RGB', 'USB-C'] },
    { id: 9, name: 'Kingston Fury RAM 32GB', image: '/products/ram.jpg', inStock: true, stock: 15, rating: 4.9, reviewCount: 95, specs: ['32GB', 'DDR5', 'RGB'] },
  ];
  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#10102a] via-[#18182c] to-[#0c0c1e] text-cyan-100 ${fonts}`}>
      <main className="flex-1">
        <HeroSection />
        <HorizontalScroller products={trendingProducts} title="🔥 Trending Tech" icon={Cpu} viewAllHref="/shop?sort=trending" badge="🔥 Trending" />
        <HorizontalScroller products={newArrivals} title="🚀 New Arrivals" icon={Rocket} viewAllHref="/shop?sort=new" badge="💡 New" />
        <HorizontalScroller products={topDeals} title="🪐 Top Deals" icon={Star} viewAllHref="/shop?sort=deals" badge="⚡️ Deal" />
        <MissionModules />
        <FeaturedCategories categories={featuredCategories} />
      </main>
      <style jsx global>{`
        body { font-family: 'Orbitron', 'Rajdhani', 'Space Grotesk', monospace; background: linear-gradient(135deg, #10102a 0%, #18182c 60%, #0c0c1e 100%); }
        .neon-glow { text-shadow: 0 0 8px #00fff7, 0 0 24px #7f00ff; }
        .glass-panel { background: rgba(16,16,42,0.7); backdrop-filter: blur(8px); border-radius: 1rem; border: 1px solid #00fff7; }
        .card-glow { box-shadow: 0 0 24px #00fff7cc, 0 0 8px #7f00ff; }
      `}</style>
    </div>
  );
}
