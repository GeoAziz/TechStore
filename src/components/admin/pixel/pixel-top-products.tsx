"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import type { Product } from "@/lib/types";

interface PixelTopProductsProps {
  products: Product[];
}

export function PixelTopProducts({ products }: PixelTopProductsProps) {
  const topItems = products.length > 0
    ? products.slice(0, 5)
    : [
        {
          id: "prod-1",
          name: "Apple MacBook Pro M3 Max",
          brand: "Apple",
          description: "MacBook Pro laptop with M3 Max chip.",
          category: "Laptops",
          price: 245000,
          currency: "KES",
          stock: 12,
          imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
          createdAt: "2024-01-01T00:00:00.000Z",
        } as Product,
        {
          id: "prod-2",
          name: "Custom Intel i9 Gaming Rig",
          brand: "Custom",
          description: "High-performance Intel i9 gaming desktop.",
          category: "Desktops",
          price: 320000,
          currency: "KES",
          stock: 6,
          imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
          createdAt: "2024-01-01T00:00:00.000Z",
        } as Product,
        {
          id: "prod-3",
          name: "Sony WH-1000XM5 Noise Cancelling",
          brand: "Sony",
          description: "Wireless noise-cancelling over-ear headphones.",
          category: "Audio",
          price: 45000,
          currency: "KES",
          stock: 24,
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
          createdAt: "2024-01-01T00:00:00.000Z",
        } as Product,
        {
          id: "prod-4",
          name: "Samsung Galaxy S24 Ultra",
          brand: "Samsung",
          description: "Samsung flagship smartphone with advanced camera features.",
          category: "Smartphones",
          price: 155000,
          currency: "KES",
          stock: 15,
          imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80",
          createdAt: "2024-01-01T00:00:00.000Z",
        } as Product,
      ];

  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground tracking-tight font-headline">
            Top Selling Products
          </h2>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <Link
          href="/admin?tab=inventory"
          className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {topItems.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-3.5 rounded-xl bg-muted/40 border border-border hover:border-emerald-500/40 transition-all duration-200 group flex flex-col justify-between"
          >
            {/* Image Box */}
            <div className="relative aspect-square w-full rounded-lg bg-card/60 flex items-center justify-center p-2 overflow-hidden mb-3">
              <Image
                src={item.imageUrl || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"}
                alt={item.name}
                fill
                className="object-contain p-2 group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Info */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {item.category || "Hardware"}
              </p>
              <h3 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-emerald-500 transition-colors">
                {item.name}
              </h3>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono font-bold text-foreground">
                  KES {item.price.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {item.stock || 24} sold
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
