"use client";

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Filter, BadgeDollarSign, RotateCcw, Palette, Layers, Check } from 'lucide-react';
import type { Product, ProductCategory } from '@/lib/types';
import SidebarBestSellers from './sidebar-best-sellers';

export interface ColorOption {
  name: string;
  hex: string;
}

const AVAILABLE_COLORS: ColorOption[] = [
  { name: 'Black', hex: '#18181b' },
  { name: 'Silver', hex: '#d4d4d8' },
  { name: 'White', hex: '#f8fafc' },
  { name: 'Space Gray', hex: '#4b5563' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'RGB', hex: 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)' },
];

interface FilterPanelProps {
  categories: { name: ProductCategory; count: number }[];
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  brandCounts: { brand: string; count: number }[];
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  maxPrice: number;
  selectedColor?: string;
  onSelectColor: (color: string) => void;
  clearFilters: () => void;
  bestSellerProducts?: Product[];
}

export default function FilterPanel({
  categories,
  activeCategory,
  onSelectCategory,
  brandCounts,
  selectedBrands,
  toggleBrand,
  priceRange,
  setPriceRange,
  maxPrice,
  selectedColor,
  onSelectColor,
  clearFilters,
  bestSellerProducts = [],
}: FilterPanelProps) {
  return (
    <div className="w-full p-4 space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <h3 className="text-sm font-bold tracking-wider uppercase text-white glow-primary">
          Shop By
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-7 px-2 text-[11px] text-lime-400 hover:text-lime-300 hover:bg-lime-400/10 font-semibold"
        >
          Reset
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["category", "price", "brand", "color"]} className="w-full space-y-2">
        {/* Category Accordion */}
        <AccordionItem value="category" className="border-b border-white/10">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wider text-white hover:text-lime-300 transition-colors flex items-center gap-2 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-lime-400" />
              <span>Category</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-3">
            <div className="space-y-1">
              {categories.map(({ name, count }) => {
                const isActive = activeCategory === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onSelectCategory(name)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                      isActive
                        ? 'bg-lime-400/15 text-lime-400 font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground ml-2">({count})</span>
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Slider Accordion */}
        <AccordionItem value="price" className="border-b border-white/10">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wider text-white hover:text-lime-300 transition-colors flex items-center gap-2 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <BadgeDollarSign className="w-3.5 h-3.5 text-lime-400" />
              <span>Price Range</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-3 pb-4">
            <div className="space-y-4">
              <Slider
                value={priceRange}
                min={0}
                max={maxPrice}
                step={1000}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="[&_>_span:first-child_>_span]:bg-[#bef264] [&_>_span:last-child]:bg-[#bef264] cursor-pointer"
              />
              <div className="flex justify-between items-center text-xs font-mono text-neutral-300">
                <span className="bg-white/5 px-2 py-1 rounded border border-white/10">
                  KES {priceRange[0].toLocaleString()}
                </span>
                <span className="text-muted-foreground">-</span>
                <span className="bg-white/5 px-2 py-1 rounded border border-white/10">
                  KES {priceRange[1].toLocaleString()}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Manufacturer / Brand Checklist */}
        <AccordionItem value="brand" className="border-b border-white/10">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wider text-white hover:text-lime-300 transition-colors flex items-center gap-2 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-lime-400" />
              <span>Manufacturer</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-3">
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {brandCounts.map(({ brand, count }) => {
                const isChecked = selectedBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className="w-full flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-lime-400 border-lime-400 text-black'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className={`truncate ${isChecked ? 'text-white font-semibold' : 'text-neutral-400'}`}>
                        {brand}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground ml-2">({count})</span>
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Color Swatches */}
        <AccordionItem value="color" className="border-b-0">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wider text-white hover:text-lime-300 transition-colors flex items-center gap-2 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-lime-400" />
              <span>Color</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-3">
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_COLORS.map((col) => {
                const isSelected = selectedColor === col.name;
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => onSelectColor(col.name)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-lime-400 bg-lime-400/10 text-white font-bold'
                        : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ background: col.hex }}
                    />
                    <span className="truncate">{col.name}</span>
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Best Sellers Mini-Widget */}
      <SidebarBestSellers products={bestSellerProducts} />

      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full rounded-xl border-white/15 text-white/90 hover:text-white hover:bg-white/10 transition-all text-xs font-bold gap-2 h-9"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset All Filters
      </Button>
    </div>
  );
}
