
"use client";

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import type { Product, ProductCategory } from '@/lib/types';
import { categoryData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, SlidersHorizontal, X, List, LayoutGrid, Filter } from 'lucide-react';
import ProductCard from './product-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

// --- Sticky Search/Sort/Toggle Bar ---
import SearchBar from '@/components/search/search-bar';
// Make sure this file exists at src/components/shop/filter-panel.tsx
import FilterPanel from './filter-panel';

// Removed duplicate ShopClient implementation. See below for the correct export.
// ...existing code...

const PRODUCTS_PER_PAGE = 12;

function ShopClientInternal({ products, searchParams: serverSearchParams }: { products: Product[], searchParams: { category?: string, search?: string, sort?: string, subcategory?: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(serverSearchParams.search || '');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(serverSearchParams.category as ProductCategory || 'Laptops');
  const [activeSubcategory, setActiveSubcategory] = useState(serverSearchParams.subcategory || 'All');
  const [sortBy, setSortBy] = useState(serverSearchParams.sort || 'relevance');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 100000;
    return Math.ceil(Math.max(...products.map(p => p.price)) / 1000) * 1000;
  }, [products]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  
  const updateURL = useCallback((newParams: Record<string, string | null | string[]>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      
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
  }, [searchParams, pathname, router]);
  
  useEffect(() => {
    setActiveCategory((searchParams.get('category') as ProductCategory) || 'Laptops');
    setActiveSubcategory(searchParams.get('subcategory') || 'All');
    setSortBy(searchParams.get('sort') || 'relevance');
    setSearchTerm(searchParams.get('search') || '');
    setSelectedBrands(searchParams.getAll('brands'));
    const minPrice = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    setPriceRange([minPrice ? Number(minPrice) : 0, maxPriceParam ? Number(maxPriceParam) : maxPrice]);
  }, [searchParams, maxPrice]);


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
  
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [filteredAndSortedProducts]);

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

  const loadMoreProducts = () => {
    setVisibleCount(prevCount => prevCount + PRODUCTS_PER_PAGE);
  };

  const productsToShow = useMemo(() => {
    return filteredAndSortedProducts.slice(0, visibleCount);
  }, [filteredAndSortedProducts, visibleCount]);

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
                    <button title="Remove filter" onClick={() => removeFilter(chip)}><X className="w-3 h-3"/></button>
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
                {productsToShow.map(product => (
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
          {visibleCount < filteredAndSortedProducts.length && (
            <div className="flex justify-center mt-8">
              <Button onClick={loadMoreProducts} variant="outline">
                Load More
              </Button>
            </div>
          )}
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
  );
}
