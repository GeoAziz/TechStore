
"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
          <AccordionTrigger className="text-base font-semibold text-primary">Brand</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {brands.map(brand => (
                <Button
                  key={brand}
                  size="sm"
                  variant={selectedBrands.includes(brand) ? "secondary" : "outline"}
                  onClick={() => toggleBrand(brand)}
                  className="rounded-full"
                >
                  {brand}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-semibold text-primary">Price Range</AccordionTrigger>
          <AccordionContent className="pt-4">
             <Slider
                value={priceRange}
                min={0}
                max={maxPrice}
                step={1000}
                onValueChange={(value) => setPriceRange(value as [number, number])}
              />
              <div className="flex justify-between text-muted-foreground text-sm mt-2">
                <span>KES {priceRange[0].toLocaleString()}</span>
                <span>KES {priceRange[1].toLocaleString()}</span>
              </div>
          </AccordionContent>
        </AccordionItem>
        
      </Accordion>
      
      <Button variant="ghost" onClick={clearFilters} className="w-full">Clear All Filters</Button>
    </div>
  );
}
