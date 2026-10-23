"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame, Database, Radio } from "lucide-react";
import type { Product } from "@/lib/types";

interface PixelTopProductsProps {
  products: Product[];
  analyticsData?: {
    source: 'ga4_data_api' | 'firestore_database';
    isFallback: boolean;
    period: string;
    freshnessTimestamp: string;
    items?: Array<{
      itemId: string;
      itemName: string;
      itemCategory: string;
      views?: number;
      purchases: number;
      revenue: number;
      conversionRate?: number;
    }>;
  };
}

export function PixelTopProducts({ products, analyticsData }: PixelTopProductsProps) {
  const topItems = products.length > 0 ? products.slice(0, 5) : [];

  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground tracking-tight font-headline">
            Top Selling Products
          </h2>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="flex items-center gap-3">
          {analyticsData && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-[11px] font-medium text-muted-foreground border border-border">
              {analyticsData.source === 'ga4_data_api' ? (
                <>
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span className="text-emerald-500 font-semibold">GA4 Live</span>
                </>
              ) : (
                <>
                  <Database className="w-3 h-3 text-blue-400" />
                  <span>DB Verified</span>
                </>
              )}
            </div>
          )}

          <Link
            href="/admin?tab=inventory"
            className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Horizontal Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topItems.map((product, idx) => (
          <div
            key={product.id || idx}
            className="group relative p-4 rounded-xl bg-background border border-border/60 hover:border-border transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                    No image
                  </div>
                )}
                {idx === 0 && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-black text-[10px] font-bold">
                    <Flame className="w-3 h-3" />
                    #1 Best Seller
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                  {product.category}
                </p>
                <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-emerald-500 transition-colors">
                  {product.name}
                </h3>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">
                KES {product.price.toLocaleString()}
              </span>
              <span className="text-muted-foreground text-[11px]">
                {product.stock} in stock
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
