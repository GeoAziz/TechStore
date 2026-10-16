"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Star } from 'lucide-react';

interface SidebarBestSellersProps {
  products: Product[];
}

export default function SidebarBestSellers({ products }: SidebarBestSellersProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider glow-primary">
          Best Sellers
        </h4>
        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Top Rated</span>
      </div>

      <div className="space-y-3">
        {products.slice(0, 3).map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-lime-400/30 transition-all duration-200"
          >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-neutral-900/60 p-1 flex-shrink-0 flex items-center justify-center border border-white/5">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="56px"
                className="object-contain p-1 transition-transform group-hover:scale-105"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white group-hover:text-lime-300 transition-colors truncate">
                {product.name}
              </p>
              <div className="flex items-center gap-1 my-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.round(product.averageRating || 5)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-neutral-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs font-mono font-bold text-lime-400">
                {product.price.toLocaleString()} {product.currency}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

