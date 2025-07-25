"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMemo } from 'react';

interface FilterPanelProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSortChange: (sort: string) => void;
  currentSort: string;
  brands: string[];
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  maxPrice: number;
  clearFilters: () => void;
}

export default function FilterPanel({
  searchTerm,
  setSearchTerm,
  handleSortChange,
  currentSort,
  brands,
  selectedBrands,
  toggleBrand,
  priceRange,
  setPriceRange,
  maxPrice,
  clearFilters,
}: FilterPanelProps) {
  const isMobile = useIsMobile();

  const activeChips = useMemo(() => {
    const chips: { type: string; value: string }[] = [];
    if (searchTerm) chips.push({ type: 'search', value: searchTerm });
    selectedBrands.forEach(b => chips.push({ type: 'brand', value: b }));
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) chips.push({ type: 'price', value: `${priceRange[0]} - ${priceRange[1]}` });
    return chips;
  }, [searchTerm, selectedBrands, priceRange, maxPrice]);

  const removeChip = (chip: { type: string; value: string }) => {
    if (chip.type === 'search') setSearchTerm('');
    if (chip.type === 'brand') toggleBrand(chip.value);
    if (chip.type === 'price') setPriceRange([0, maxPrice]);
  };

  return (
    <aside className="w-full max-w-xs p-4 bg-card/80 rounded-xl border border-border/20 shadow-lg">
      <Accordion type="multiple" defaultValue={["filters"]} className="mb-4">
        <AccordionItem value="filters">
          <AccordionTrigger className="font-bold text-lg">Filters</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="mb-2"
              />
              <div>
                <span className="font-space-mono text-xs text-accent">Sort By</span>
                <label htmlFor="sort-select" className="sr-only">
                  Sort By
                </label>
                <select
                  id="sort-select"
                  aria-label="Sort By"
                  className="w-full mt-1 p-2 rounded border"
                  value={currentSort}
                  onChange={e => handleSortChange(e.target.value)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
              <div>
                <span className="font-space-mono text-xs text-accent">Brand</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {brands.length === 0 ? (
                    <span className="text-muted-foreground text-xs">No brands</span>
                  ) : (
                    brands.map(brand => (
                      <Button
                        key={brand}
                        size="sm"
                        variant={selectedBrands.includes(brand) ? "accent" : "ghost"}
                        onClick={() => toggleBrand(brand)}
                      >
                        {brand}
                      </Button>
                    ))
                  )}
                </div>
              </div>
              <div>
                <span className="font-space-mono text-xs text-accent">Price</span>
                <Slider
                  value={priceRange}
                  min={0}
                  max={maxPrice}
                  step={1000}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
                <div className="mt-2 text-xs text-muted-foreground">
                  {priceRange[0]} - {priceRange[1]}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {activeChips.map(chip => (
                  <Badge key={chip.value} variant="secondary" className="flex items-center gap-1">
                    {chip.value}
                    <button onClick={() => removeChip(chip)} title="Remove filter">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="mt-2" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
