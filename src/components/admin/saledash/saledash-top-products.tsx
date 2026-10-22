"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Award, Flame } from "lucide-react";
import type { Product } from "@/lib/types";

interface SaledashTopProductsProps {
  products: Product[];
}

export function SaledashTopProducts({ products }: SaledashTopProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const topItems = products.length > 0
    ? products.slice(0, 5)
    : [
        {
          id: "prod_macbook",
          name: "Apple MacBook Pro M3 Max",
          price: 245000,
          currency: "KES",
          stock: 18,
          imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
        } as Product,
      ];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? topItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === topItems.length - 1 ? 0 : prev + 1));
  };

  const current = topItems[currentIndex];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-1.5">
              Congratulations! 🎉
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Top tech items with highest buyer demand this week
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-600 dark:text-lime-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        {/* Carousel Visual */}
        <div className="relative my-4 aspect-square max-h-48 w-full rounded-2xl bg-muted/30 border border-border flex items-center justify-center overflow-hidden p-4 group">
          <Image
            src={current.imageUrl || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"}
            alt={current.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />

          {/* Navigation Controls */}
          {topItems.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-card/80 border border-border flex items-center justify-center text-foreground hover:bg-card shadow-sm"
                aria-label="Previous item"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-card/80 border border-border flex items-center justify-center text-foreground hover:bg-card shadow-sm"
                aria-label="Next item"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-2 pt-3 border-t border-border flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-foreground line-clamp-1">{current.name}</h4>
          <span className="text-xs font-mono font-bold text-lime-600 dark:text-lime-400">
            KES {current.price.toLocaleString()}
          </span>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
          {current.stock || 42} in stock
        </span>
      </div>
    </div>
  );
}

