"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  RefreshCcw, 
  Truck, 
  ShieldCheck, 
  Cpu, 
  Rocket, 
  Star, 
  X,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductCard from '@/components/shop/product-card';
import type { Product } from '@/lib/types';
import RecentlyViewedProducts from '@/components/shop/recently-viewed-products';
import { motion } from 'framer-motion';

function HeroSection() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <section className="relative overflow-hidden pt-6 pb-12 lg:pt-10 lg:pb-20">
      {/* Background Matrix & Radial Glow */}
      <div className="absolute inset-0 bg-cyber-matrix pointer-events-none -z-10" />
      <div className="absolute -top-32 right-1/4 w-96 h-96 bg-[#bef264]/10 rounded-full blur-[128px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-10 w-72 h-72 bg-lime-500/5 rounded-full blur-[96px] pointer-events-none -z-10" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Typography, CTAs, and Trust Bar */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <span className="font-mono text-xs font-bold tracking-[0.25em] text-[#bef264] uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                NEW SEASON. NEW TECH.
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-6"
            >
              Upgrade Your <br />
              <span className="text-[#bef264] font-serif italic drop-shadow-[0_0_30px_rgba(190,242,100,0.35)]">
                Everyday Tech.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-lg mb-8 leading-relaxed"
            >
              Latest gadgets. Premium brands. Performance you can trust.
            </motion.p>

            {/* Dual CTAs: Shop Now & Video Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 sm:gap-6 mb-12"
            >
              {/* Primary Electric Lime Pill Button */}
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#bef264] hover:bg-lime-300 text-black font-extrabold text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(190,242,100,0.4)] hover:shadow-[0_0_35px_rgba(190,242,100,0.6)] hover:scale-105 active:scale-95"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Watch Showcase Circle CTA */}
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="group flex items-center gap-3 py-2 pr-4 pl-2 rounded-full hover:bg-white/[0.05] transition-all"
                aria-label="Watch showcase video"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#bef264] group-hover:text-black group-hover:border-[#bef264] group-hover:shadow-[0_0_20px_rgba(190,242,100,0.5)] transition-all">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white group-hover:text-lime-300 transition-colors">
                    Watch Showcase
                  </div>
                  <div className="text-xs text-muted-foreground">Play Video</div>
                </div>
              </button>
            </motion.div>

            {/* Feature Trust Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 w-full max-w-2xl"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#bef264] shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white">100% Original</div>
                  <div className="text-muted-foreground text-[11px]">Direct from Brands</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <RefreshCcw className="w-5 h-5 text-[#bef264] shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white">Easy Returns</div>
                  <div className="text-muted-foreground text-[11px]">7 Days Policy</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-[#bef264] shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white">Free Shipping</div>
                  <div className="text-muted-foreground text-[11px]">On Orders KES 5,000+</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#bef264] shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white">Secure Checkout</div>
                  <div className="text-muted-foreground text-[11px]">M-Pesa & Card</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Visual with Glowing Lime Ring & Gadgets */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-lg aspect-square flex items-center justify-center"
            >
              {/* Lime Ambient Neon Halo Ring */}
              <div className="absolute w-[80%] h-[80%] rounded-full border border-lime-400/40 shadow-[0_0_50px_rgba(190,242,100,0.25)] animate-pulse" />
              <div className="absolute w-[95%] h-[95%] rounded-full border border-dashed border-white/10" />

              {/* Main Visual Image Composition */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80"
                  alt="Modern Tech Enthusiast"
                  fill
                  className="object-cover object-center filter brightness-90 contrast-110"
                  priority
                />
                {/* Code watermark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-transparent to-transparent opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f]/60 via-transparent to-[#090a0f]/40" />

                {/* Floating Tech Badges on Hero Image */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between p-3.5 rounded-2xl bg-[#12141c]/80 backdrop-blur-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-300">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Apple M3 Pro & Intel i9</div>
                      <div className="text-[11px] text-muted-foreground">Certified In Stock</div>
                    </div>
                  </div>
                  <Link
                    href="/shop"
                    className="text-xs font-bold text-[#bef264] hover:underline"
                  >
                    Explore →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-3xl bg-[#12141c] border-white/10 text-white rounded-2xl overflow-hidden p-0">
          <DialogHeader className="p-4 border-b border-white/10 flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Play className="w-4 h-4 text-[#bef264] fill-current" />
              TechStore Showcase 2026
            </DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video w-full bg-black">
            <iframe
              className="w-full h-full"
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="TechStore Product Showcase"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

const categoryCards = [
  {
    name: 'Smartphones',
    href: '/shop?category=Smartphones',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80',
    subtitle: 'Latest Flagships',
  },
  {
    name: 'Laptops',
    href: '/shop?category=Laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80',
    subtitle: 'MacBooks & Ultrabooks',
  },
  {
    name: 'Audio',
    href: '/shop?category=Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    subtitle: 'Noise Cancelling',
  },
  {
    name: 'Smartwatches',
    href: '/shop?category=Accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    subtitle: 'Fitness & Everyday',
  },
  {
    name: 'Accessories',
    href: '/shop?category=Accessories',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=80',
    subtitle: 'Fast Chargers & Hubs',
  },
  {
    name: 'Cameras',
    href: '/shop?category=Webcams',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80',
    subtitle: '4K Pro Streaming',
  },
];

function ShopByCategorySection() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Shop By Category
          </h2>
          <Link
            href="/categories"
            className="text-xs sm:text-sm font-bold text-muted-foreground hover:text-[#bef264] flex items-center gap-1.5 transition-colors group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 6 Horizontal Glass Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {categoryCards.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
            >
              <Link
                href={cat.href}
                className="group relative flex flex-col justify-between h-[230px] sm:h-[250px] p-4 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-lime-400/40 backdrop-blur-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
              >
                {/* Product Image on dark reflective pedestal */}
                <div className="relative w-full h-32 flex items-center justify-center">
                  <div className="absolute inset-0 bg-radial from-white/10 to-transparent rounded-full opacity-40 group-hover:opacity-75 transition-opacity" />
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={180}
                    height={180}
                    className="max-h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
                  />
                </div>

                {/* Card Title & Link */}
                <div className="mt-auto pt-2 border-t border-white/5">
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-lime-300 transition-colors">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground group-hover:text-[#bef264] transition-colors mt-0.5">
                    <span>Shop Now</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <div className="w-8 h-8 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-[#bef264]">
        <Icon className="w-4 h-4" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{title}</h2>
    </div>
  );
}

function HorizontalScroller({
  products,
  title,
  icon,
  viewAllHref,
}: {
  products: Product[];
  title: string;
  icon: React.ElementType;
  viewAllHref?: string;
}) {
  if (!products || products.length === 0) return null;

  return (
    <motion.section
      className="py-10"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-6">
          <SectionHeading icon={icon} title={title} />
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs sm:text-sm font-bold text-muted-foreground hover:text-[#bef264] flex items-center gap-1.5 transition-colors group"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        <div className="relative">
          <ScrollArea className="w-full whitespace-nowrap -m-2 p-2">
            <div className="flex w-max space-x-6 py-4">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  className="w-72 snap-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, delay: i * 0.05 }}
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

export default function HomeClient({
  trendingProducts,
  newArrivals,
  topDeals,
}: {
  trendingProducts: Product[];
  newArrivals: Product[];
  topDeals: Product[];
}) {
  return (
    <main className="flex-1 pb-16">
      {/* 1. Hero Section matching inspiration */}
      <HeroSection />

      {/* 2. Shop By Category Frosted Cards matching inspiration */}
      <ShopByCategorySection />

      {/* 3. Recently Viewed Section */}
      <RecentlyViewedProducts />

      {/* 4. Curated Catalog Scrollers */}
      <HorizontalScroller
        products={trendingProducts}
        title="Trending Tech"
        icon={Cpu}
        viewAllHref="/shop?sort=trending"
      />
      <HorizontalScroller
        products={newArrivals}
        title="New Arrivals"
        icon={Rocket}
        viewAllHref="/shop?sort=new"
      />
      <HorizontalScroller
        products={topDeals}
        title="Exclusive Offers"
        icon={Star}
        viewAllHref="/deals"
      />
    </main>
  );
}
