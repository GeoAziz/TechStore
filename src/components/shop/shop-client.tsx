"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import type { Product, ProductCategory } from '@/lib/types';
import { categoryData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, SlidersHorizontal, X, List, LayoutGrid, DollarSign, Filter } from 'lucide-react';
import ProductCard from './product-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const FilterPanel = ({ 
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
  clearFilters
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleSortChange: (value: string) => void;
  currentSort?: string;
  brands: string[];
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  maxPrice: number;
  clearFilters: () => void;
}) => (
  <aside className="lg:h-screen lg:sticky top-16 bg-transparent p-6 lg:w-80 space-y-8">
     <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold glow-primary flex items-center gap-2"><Filter className="w-6 h-6"/> Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all</Button>
     </div>
     <div className="space-y-8">
        <div>
           <h3 className="text-lg font-semibold mb-3 text-primary">Search</h3>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="Find your gear..." 
               className="pl-10" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
        <div>
           <h3 className="text-lg font-semibold mb-3 text-primary">Sort By</h3>
           <Select onValueChange={handleSortChange} defaultValue={currentSort}>
             <SelectTrigger>
               <SelectValue placeholder="Relevance" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="relevance">Relevance</SelectItem>
               <SelectItem value="price-asc">Price: Low to High</SelectItem>
               <SelectItem value="price-desc">Price: High to Low</SelectItem>
               <SelectItem value="rating">Rating</SelectItem>
             </SelectContent>
           </Select>
        </div>
        <Accordion type="multiple" defaultValue={['price', 'brands']} className="w-full">
            <AccordionItem value="price">
                <AccordionTrigger className="text-lg font-semibold text-primary">Price Range</AccordionTrigger>
                <AccordionContent>
                    <div className="pt-4 px-1">
                       <Slider
                          min={0}
                          max={maxPrice}
                          step={1000}
                          value={priceRange}
                          onValueChange={(value: number[]) => setPriceRange(value as [number, number])}
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                            <span>{priceRange[0].toLocaleString()} KES</span>
                            <span>{priceRange[1].toLocaleString()} KES</span>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="brands">
                <AccordionTrigger className="text-lg font-semibold text-primary">Brands</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2 pt-2 max-h-48 overflow-y-auto">
                        {brands.map(brand => (
                            <div key={brand} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={`brand-${brand}`}
                                    checked={selectedBrands.includes(brand)}
                                    onChange={() => toggleBrand(brand)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor={`brand-${brand}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {brand}
                                </label>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
     </div>
  </aside>
);

function ShopClientInternal({ products, searchParams }: { products: Product[], searchParams: { category?: string, search?: string, sort?: string, subcategory?: string } }) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState(searchParams.search || '');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(searchParams.category as ProductCategory || 'Laptops');
  const [activeSubcategory, setActiveSubcategory] = useState(searchParams.subcategory || 'All');
  const [sortBy, setSortBy] = useState(searchParams.sort || 'relevance');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 100000;
    return Math.ceil(Math.max(...products.map(p => p.price)) / 1000) * 1000;
  }, [products]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);
  
  const updateURL = (newParams: Record<string, string | null | string[]>) => {
      const current = new URLSearchParams(Array.from(useSearchParams().entries()));
      
      for (const [key, value] of Object.entries(newParams)) {
          if (value === null || (Array.isArray(value) && value.length === 0)) {
              current.delete(key);
          } else if (Array.isArray(value)) {
              current.delete(key);
              value.forEach(v => current.append(key, v));
          } else {
              current.set(key, value);
          }
      }
      
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`, { scroll: false });
  };
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setActiveCategory((params.get('category') as ProductCategory) || 'Laptops');
    setActiveSubcategory(params.get('subcategory') || 'All');
    setSortBy(params.get('sort') || 'relevance');
    setSearchTerm(params.get('search') || '');
    setSelectedBrands(params.getAll('brands'));
    const minPrice = params.get('minPrice');
    const maxPriceParam = params.get('maxPrice');
    setPriceRange([minPrice ? Number(minPrice) : 0, maxPriceParam ? Number(maxPriceParam) : maxPrice]);
  }, [useSearchParams(), maxPrice]);


  const handleCategoryChange = (category: ProductCategory) => {
    setActiveCategory(category);
    setActiveSubcategory('All');
    updateURL({ category, subcategory: null });
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setActiveSubcategory(subcategory);
    updateURL({ subcategory: subcategory === 'All' ? null : subcategory });
  };
  
  const handleSortChange = (sortValue: string) => {
    setSortBy(sortValue);
    updateURL({ sort: sortValue });
  };

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
    updateURL({ search: term || null });
  };

  const toggleBrand = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newBrands);
    updateURL({ brands: newBrands });
  };

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
    updateURL({ minPrice: String(value[0]), maxPrice: String(value[1]) });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrands([]);
    setPriceRange([0, maxPrice]);
    setSortBy('relevance');
    updateURL({ search: null, brands: null, minPrice: null, maxPrice: null, sort: null });
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const categoryMatch = product.category === activeCategory;
      const subcategoryMatch = activeSubcategory === 'All' ? true : product.subcategory === activeSubcategory;
      const searchMatch = searchTerm ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      const brandMatch = selectedBrands.length > 0 ? selectedBrands.includes(product.brand) : true;
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      return categoryMatch && subcategoryMatch && searchMatch && brandMatch && priceMatch;
    });

    switch (sortBy) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        default:
            break;
    }

    return filtered;
  }, [products, activeCategory, activeSubcategory, searchTerm, sortBy, selectedBrands, priceRange]);
  
  const activeFilterChips = useMemo(() => {
    const chips = [];
    if(searchTerm) chips.push({type: 'search', value: searchTerm});
    selectedBrands.forEach(b => chips.push({type: 'brand', value: b}));
    if(priceRange[0] > 0 || priceRange[1] < maxPrice) chips.push({type: 'price', value: `${priceRange[0]}-${priceRange[1]}`});
    return chips;
  }, [searchTerm, selectedBrands, priceRange, maxPrice]);
  
  const removeFilter = (chip: {type: string, value: string}) => {
    if(chip.type === 'search') handleSearchTermChange('');
    if(chip.type === 'brand') toggleBrand(chip.value);
    if(chip.type === 'price') handlePriceChange([0, maxPrice]);
  }

  const subcategories = useMemo(() => {
      const current = categoryData.find(c => c.name === activeCategory);
      return current?.subcategories || [];
  }, [activeCategory]);

  const allBrands = useMemo(() => Array.from(new Set(products.filter(p => p.category === activeCategory).map(p => p.brand))), [products, activeCategory]);

  return (
    <div className="container mx-auto">
      <div className="lg:flex">
        <div className="hidden lg:block">
           <FilterPanel 
            searchTerm={searchTerm}
            setSearchTerm={handleSearchTermChange}
            handleSortChange={handleSortChange}
            currentSort={sortBy}
            brands={allBrands}
            selectedBrands={selectedBrands}
            toggleBrand={toggleBrand}
            priceRange={priceRange}
            setPriceRange={handlePriceChange}
            maxPrice={maxPrice}
            clearFilters={clearFilters}
           />
        </div>

        <main className="flex-1 py-8 lg:py-12 px-4 lg:px-8 border-l border-border">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tighter mb-2 glow-primary">Product Marketplace</h1>
            <p className="text-muted-foreground">Browse all products or filter by category.</p>
          </header>

           <div className="mb-4">
            <Tabs value={activeCategory} onValueChange={(val) => handleCategoryChange(val as ProductCategory)}>
                <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="bg-transparent p-0">
                        {categoryData.map(category => (
                        <TabsTrigger key={category.name} value={category.name} className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-base px-4 py-2">
                            {category.name}
                        </TabsTrigger>
                        ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </Tabs>
           </div>
          
           {subcategories.length > 0 && (
             <div className="mb-8">
                <Tabs value={activeSubcategory} onValueChange={handleSubcategoryChange}>
                    <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList className="bg-transparent p-0">
                            <TabsTrigger value="All" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">All {activeCategory}</TabsTrigger>
                            {subcategories.map(sub => (
                            <TabsTrigger key={sub} value={sub} className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                                {sub}
                            </TabsTrigger>
                            ))}
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </Tabs>
            </div>
           )}
          
           <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
             <div className="flex items-center gap-2 flex-wrap">
                {activeFilterChips.length > 0 && activeFilterChips.map(chip => (
                  <Badge key={chip.value} variant="secondary" className="text-sm flex gap-2 items-center">
                    {chip.value}
                    <button onClick={() => removeFilter(chip)}><X className="w-3 h-3"/></button>
                  </Badge>
                ))}
             </div>
             <div className='flex items-center gap-2'>
                <p className="text-muted-foreground hidden sm:block">{filteredAndSortedProducts.length} results</p>
                <div className="hidden md:flex items-center gap-2">
                    <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                        <LayoutGrid className="w-5 h-5" />
                    </Button>
                     <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                        <List className="w-5 h-5" />
                    </Button>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="lg:hidden">
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[320px] sm:w-[400px] p-0 border-primary/20 bg-background">
                         <SheetHeader className="p-6 pb-0">
                           <SheetTitle>Filters</SheetTitle>
                         </SheetHeader>
                        <FilterPanel 
                            searchTerm={searchTerm}
                            setSearchTerm={handleSearchTermChange}
                            handleSortChange={handleSortChange}
                            currentSort={sortBy}
                            brands={allBrands}
                            selectedBrands={selectedBrands}
                            toggleBrand={toggleBrand}
                            priceRange={priceRange}
                            setPriceRange={handlePriceChange}
                            maxPrice={maxPrice}
                            clearFilters={clearFilters}
                        />
                    </SheetContent>
                </Sheet>
             </div>
           </div>

          <motion.div 
            layout 
            className={`grid gap-6 lg:gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
          >
            <AnimatePresence>
                {filteredAndSortedProducts.map(product => (
                  <motion.div 
                    layout 
                    key={product.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                      <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
          {filteredAndSortedProducts.length === 0 && (
             <div className="text-center col-span-full py-16">
                <h2 className="text-2xl font-bold">No Transmissions Found</h2>
                <p className="text-muted-foreground mt-2">Your search query returned no results. Try a different filter.</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopClient(props: { products: Product[], searchParams: { category?: string, search?: string, sort?: string, subcategory?: string } }) {
  return (
    <Suspense>
      <ShopClientInternal {...props} />
    </Suspense>
  )
}
