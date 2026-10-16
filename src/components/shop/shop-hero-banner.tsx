"use client";

import Link from 'next/link';
import { ChevronRight, Home, Sparkles } from 'lucide-react';
import type { ProductCategory } from '@/lib/types';

interface ShopHeroBannerProps {
  category: ProductCategory;
  subcategory?: string;
  totalResults: number;
}

export default function ShopHeroBanner({ category, subcategory, totalResults }: ShopHeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-8 border border-white/10 bg-gradient-to-r from-neutral-950 via-[#121620] to-neutral-950 p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      {/* Decorative background ambient glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
        <Link href="/" className="flex items-center gap-1 hover:text-white transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <Link href="/shop" className="hover:text-white transition-colors">
          <span>Shop</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <span className="text-white font-semibold">{category}</span>
        {subcategory && subcategory !== 'All' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span className="text-lime-300 font-semibold">{subcategory}</span>
          </>
        )}
      </nav>

      {/* Banner Content */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Featured Marketplace Collection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase glow-primary">
            {subcategory && subcategory !== 'All' ? subcategory : category}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
            Discover precision-engineered hardware, components, and premium accessories with verified warranty and express delivery.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <span>{totalResults} Products Available</span>
        </div>
      </div>
    </div>
  );
}

