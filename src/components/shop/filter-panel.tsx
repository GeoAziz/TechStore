
"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, BadgeDollarSign } from 'lucide-react';

interface FilterPanelProps {
  brands: string[];
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  maxPrice: number;
  clearFilters: () => void;
}

export default function FilterPanel({
  brands,
  selectedBrands,
  toggleBrand,
  priceRange,
  setPriceRange,
  maxPrice,
  clearFilters,
}: FilterPanelProps) {

  return (
    <div className="w-full p-4 space-y-6">
      <Accordion type="multiple" defaultValue={["brand", "price"]} className="w-full">
        <AccordionItem value="brand">
          <AccordionTrigger className="text-base font-semibold text-cyan-300 hover:text-cyan-200 transition-all flex items-center gap-2 [&[data-state=open]]:glow-primary">
            <Filter className="w-4 h-4 mr-1 text-cyan-400/80" />
            <span className="font-headline">Brand</span>
          </AccordionTrigger>
          <AccordionContent asChild>
            <div className="flex flex-wrap gap-2 pt-2">
              {brands.map(brand => (
                <Button
                  key={brand}
                  size="sm"
                  variant={selectedBrands.includes(brand) ? "secondary" : "outline"}
                  onClick={() => toggleBrand(brand)}
                  className={`rounded-full font-[Orbitron,Space Grotesk,monospace] border-cyan-400/40 text-cyan-200 bg-[#18182c]/80 hover:bg-cyan-400/10 transition-all ${selectedBrands.includes(brand) ? 'ring-2 ring-cyan-400/80 shadow-[0_0_8px_#00fff7]' : ''}`}
                >
                  {brand}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-semibold text-cyan-300 hover:text-cyan-200 transition-all flex items-center gap-2 [&[data-state=open]]:glow-primary">
            <BadgeDollarSign className="w-4 h-4 mr-1 text-cyan-400/80" />
            <span className="font-headline">Price Range</span>
          </AccordionTrigger>
          <AccordionContent asChild className="pt-4">
            <div>
              <Slider
                value={priceRange}
                min={0}
                max={maxPrice}
                step={1000}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="[&_>_span:first-child_>_span]:bg-primary [&_>_span:last-child]:bg-primary"
              />
              <div className="flex justify-between text-cyan-400/80 text-sm mt-2 font-mono">
                <span>KES {priceRange[0].toLocaleString()}</span>
                <span>KES {priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        variant="outline"
        onClick={clearFilters}
        className="w-full mt-2 border-accent text-accent hover:bg-accent/20 transition-all font-headline"
      >
        Clear All Filters
      </Button>
    </div>
  );
}
