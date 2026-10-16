"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Award } from "lucide-react";
import type { Product } from "@/lib/types";

interface VendorTopProductsProps {
  products: Product[];
}

export function VendorTopProducts({ products }: VendorTopProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const topItems = products.length > 0
    ? products.slice(0, 5)
    : [
        {
          id: "placeholder-1",
          name: "Sample Product",
          price: 12000,
          currency: "KES",
          stock: 40,
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
        } as Product,
      ];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? topItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === topItems.length - 1 ? 0 : prev + 1));
  };

  const currentProduct = topItems[currentIndex];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-md flex flex-col justify-between h-full">
      {/* Header with celebration */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Congratulations! 🎉</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Some of your products already have the highest buyer demand
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-[#bef264]">
          <Award className="w-4 h-4" />
        </div>
      </div>

      {/* Featured Spotlight Card */}
      <div className="relative my-auto py-3 flex items-center justify-center">
        {/* Carousel Prev Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-0 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-[#bef264] hover:text-black border border-white/20 flex items-center justify-center text-white transition-all shadow-lg"
          aria-label="Previous product"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Product Visual Card */}
        <div className="w-[180px] sm:w-[200px] rounded-2xl p-4 bg-gradient-to-b from-white/[0.08] to-white/[0.03] border border-white/20 shadow-2xl backdrop-blur-xl text-center group hover:border-lime-400/50 transition-all">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/40 mb-3 border border-white/10">
            <Image
              src={currentProduct.imageUrl}
              alt={currentProduct.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="text-xs font-bold text-white line-clamp-1 group-hover:text-lime-300 transition-colors">
            {currentProduct.name}
          </div>
          <div className="text-[11px] font-mono text-[#bef264] mt-0.5">
            KES {currentProduct.price.toLocaleString()}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {currentProduct.stock} in stock
          </div>
        </div>

        {/* Carousel Next Button */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-0 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-[#bef264] hover:text-black border border-white/20 flex items-center justify-center text-white transition-all shadow-lg"
          aria-label="Next product"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Pagination indicators */}
      <div className="flex items-center justify-center gap-1.5 pt-3">
        {topItems.map((_, idx) => (
          <span
            key={idx}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentIndex
                ? "w-5 bg-[#bef264] shadow-[0_0_8px_rgba(190,242,100,0.8)]"
                : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

