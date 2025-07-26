
"use client";

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import type { Product, ProductCategory } from '@/lib/types';
import { categoryData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, SlidersHorizontal, X, List, LayoutGrid } from 'lucide-react';
import ProductCard from './product-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from "@/components/ui/badge";
import FilterPanel from './filter-panel';


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
  
  const updateURL = useCallback((newParams: Record<string, string | string[] | number | null>) => {
      const current = new URLSearchParams(Array.from((searchParams ?? new URLSearchParams()).entries()));
      
      for (const [key, value] of Object.entries(newParams)) {
          if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
              current.delete(key);
          } else if (Array.isArray(value)) {
              current.delete(key);
              value.forEach(v => current.append(key, String(v)));
          } else {
              current.set(key, String(value));
          }
      }
      
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`, { scroll: false });
  }, [searchParams, pathname, router]);
  
  useEffect(() => {
    setActiveCategory((searchParams?.get('category') as ProductCategory) || 'Laptops');
    setActiveSubcategory(searchParams?.get('subcategory') || 'All');
    setSortBy(searchParams?.get('sort') || 'relevance');
    setSearchTerm(searchParams?.get('search') || '');
    setSelectedBrands(searchParams?.getAll('brands') || []);
    const minPrice = searchParams?.get('minPrice');
    const maxPriceParam = searchParams?.get('maxPrice');
    setPriceRange([minPrice ? Number(minPrice) : 0, maxPriceParam ? Number(maxPriceParam) : maxPrice]);
  }, [searchParams, maxPrice]);


  const handleCategoryChange = (category: ProductCategory) => {
    setActiveCategory(category);
    setActiveSubcategory('All');
    updateURL({ category, subcategory: null, brands: null });
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setActiveSubcategory(subcategory);
    updateURL({ subcategory: subcategory === 'All' ? null : subcategory });
  };
  
  const handleSortChange = (sortValue: string) => {
    setSortBy(sortValue);
    updateURL({ sort: sortValue });
  };

  const debouncedUpdateURL = useCallback((term: string) => {
     const handler = setTimeout(() => {
        updateURL({ search: term || null });
    }, 300);
    return () => clearTimeout(handler);
  }, [updateURL]);

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
    debouncedUpdateURL(term);
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
    const handler = setTimeout(() => {
      updateURL({ minPrice: String(value[0]), maxPrice: String(value[1]) });
    }, 500);
    return () => clearTimeout(handler);
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, maxPrice]);
    updateURL({ brands: null, minPrice: null, maxPrice: null });
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
    const chips: { type: string, value: string, display: string }[] = [];
    selectedBrands.forEach(b => chips.push({ type: 'brand', value: b, display: b }));
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) {
      chips.push({ type: 'price', value: 'price', display: `KES ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}` });
    }
    return chips;
  }, [selectedBrands, priceRange, maxPrice]);
  
  const removeFilter = (chip: {type: string, value: string}) => {
    if(chip.type === 'brand') toggleBrand(chip.value);
    if(chip.type === 'price') {
      const newPriceRange: [number, number] = [0, maxPrice];
      setPriceRange(newPriceRange);
      updateURL({ minPrice: null, maxPrice: null });
    }
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
    <div className="container mx-auto py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* -- Filters Sidebar (Desktop) -- */}
        <aside className="hidden lg:block w-full lg:w-1/4 xl:w-1/5 sticky top-24 h-fit">
           <div className="p-4 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg">
             <h3 className="text-xl font-bold mb-4 glow-primary">Filters</h3>
             <FilterPanel 
              brands={allBrands}
              selectedBrands={selectedBrands}
              toggleBrand={toggleBrand}
              priceRange={priceRange}
              setPriceRange={handlePriceChange}
              maxPrice={maxPrice}
              clearFilters={clearFilters}
             />
           </div>
        </aside>

        {/* -- Main Content -- */}
        <main className="flex-1">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tighter mb-2 glow-primary">Product Marketplace</h1>
            <p className="text-muted-foreground">Browse all products or filter by category.</p>
          </header>

          {/* -- Main Category Tabs -- */}
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
          
           {/* -- Subcategory Tabs -- */}
           {subcategories.length > 0 && (
             <motion.div
               className="mb-6"
               initial={{ opacity: 0, y: 12 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ type: 'spring', stiffness: 120, damping: 18 }}
             >
                <Tabs value={activeSubcategory} onValueChange={handleSubcategoryChange}>
                    <ScrollArea className="w-full whitespace-nowrap">
                        <TabsList className="bg-transparent p-0 gap-2">
                            <TabsTrigger
                              value="All"
                              className="rounded-full font-[Orbitron,Space Grotesk,monospace] px-5 py-2 text-cyan-200 border border-cyan-400/20 bg-[#18182c]/70 data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-100 data-[state=active]:shadow-[0_0_8px_#00fff7] transition-all"
                            >
                              All {activeCategory}
                            </TabsTrigger>
                            {subcategories.map(sub => (
                              <motion.div
                                key={sub}
                                whileHover={{ scale: 1.08 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="inline-block"
                              >
                                <TabsTrigger
                                  value={sub}
                                  className="rounded-full font-[Orbitron,Space Grotesk,monospace] px-5 py-2 text-cyan-200 border border-cyan-400/20 bg-[#18182c]/70 data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-100 data-[state=active]:shadow-[0_0_8px_#00fff7] transition-all"
                                >
                                  {sub}
                                </TabsTrigger>
                              </motion.div>
                            ))}
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </Tabs>
            </motion.div>
           )}
          
          {/* -- Utility Bar: Search, Sort, View Toggle -- */}
           <motion.div
             layout
             className="sticky top-20 z-40 mb-6"
             initial={{ y: -32, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ type: 'spring', stiffness: 120, damping: 18 }}
           >
             <div
               className="flex flex-col md:flex-row gap-4 items-center justify-between px-4 py-4 rounded-xl border border-cyan-400/20 bg-gradient-to-r from-[#10102a]/80 via-[#0c0c1e]/80 to-[#10102a]/80 shadow-[0_2px_32px_#00fff733] backdrop-blur-md"
               style={{ boxShadow: '0 0 24px #00fff733, 0 0 2px #00fff7' }}
             >
               <div className="relative w-full md:w-auto md:flex-grow max-w-sm">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400/80" />
                 <Input
                   placeholder="Search products..."
                   value={searchTerm}
                   onChange={(e) => handleSearchTermChange(e.target.value)}
                   className="pl-10 font-[Orbitron,Space Grotesk,monospace] bg-[#18182c]/80 border-cyan-400/30 focus:border-cyan-400 text-cyan-100 placeholder:text-cyan-400/40 shadow-[0_0_8px_#00fff733]"
                 />
               </div>

               <div className="flex items-center gap-4 w-full md:w-auto">
                 <Select value={sortBy} onValueChange={handleSortChange}>
                   <SelectTrigger className="w-full md:w-[180px] font-[Orbitron,Space Grotesk,monospace] bg-[#18182c]/80 border-cyan-400/30 focus:border-cyan-400 text-cyan-100">
                     <SelectValue placeholder="Sort by" />
                   </SelectTrigger>
                   <SelectContent className="bg-[#18182c] border-cyan-400/30 text-cyan-100">
                     <SelectItem value="relevance">Relevance</SelectItem>
                     <SelectItem value="price-asc">Price: Low to High</SelectItem>
                     <SelectItem value="price-desc">Price: High to Low</SelectItem>
                     <SelectItem value="rating">Top Rated</SelectItem>
                   </SelectContent>
                 </Select>

                 <div className="hidden md:flex items-center gap-2 p-1 bg-[#18182c]/80 rounded-md border border-cyan-400/20 shadow-[0_0_8px_#00fff733]">
                   <Button
                     variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                     size="icon"
                     onClick={() => setViewMode('grid')}
                     className={`transition-all ${viewMode === 'grid' ? 'ring-2 ring-cyan-400/80' : ''}`}
                   >
                     <LayoutGrid className="w-5 h-5 text-cyan-300" />
                   </Button>
                   <Button
                     variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                     size="icon"
                     onClick={() => setViewMode('list')}
                     className={`transition-all ${viewMode === 'list' ? 'ring-2 ring-cyan-400/80' : ''}`}
                   >
                     <List className="w-5 h-5 text-cyan-300" />
                   </Button>
                 </div>

                 {/* -- Mobile Filter Trigger -- */}
                 <Sheet>
               <SheetTrigger asChild>
                 <Button 
                   variant="outline" 
                   className="lg:hidden fixed bottom-6 right-6 z-[60] border-cyan-400/80 text-cyan-200 bg-[#18182c]/90 hover:bg-cyan-400/10 shadow-[0_0_24px_#00fff7] animate-pulse rounded-full w-16 h-16 flex flex-col items-center justify-center"
                   style={{ boxShadow: '0 0 32px #00fff7, 0 0 64px #00fff7' }}
                   aria-label="Open Filters"
                 >
                   <SlidersHorizontal className="h-7 w-7 text-cyan-400 mb-1" />
                   <span className="text-xs font-[Orbitron,Space Grotesk,monospace]">Filters</span>
                 </Button>
               </SheetTrigger>
                   <SheetContent className="w-[320px] sm:w-[400px] p-0 border-cyan-400/20 bg-[#10102a]">
                     <SheetHeader className="p-4 pb-0">
                       <SheetTitle className="glow-primary">Filters</SheetTitle>
                     </SheetHeader>
                     <FilterPanel
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
           </motion.div>

           {/* -- Active Filter Chips -- */}
           <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
             <div className="flex items-center gap-2 flex-wrap">
                <AnimatePresence>
                  {activeFilterChips.length > 0 && activeFilterChips.map(chip => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      key={chip.value}
                    >
                      <Badge variant="secondary" className="text-sm flex gap-2 items-center pl-3 pr-2 py-1 rounded-full">
                        {chip.display}
                        <button title={`Remove ${chip.display} filter`} onClick={() => removeFilter(chip)} className="bg-background/50 hover:bg-background rounded-full w-5 h-5 flex items-center justify-center">
                          <X className="w-3 h-3"/>
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
             <p className="text-muted-foreground text-sm">{filteredAndSortedProducts.length} results found</p>
           </div>
          
          {/* -- Product Grid -- */}
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

          {/* -- Load More Button -- */}
          {visibleCount < filteredAndSortedProducts.length && (
            <div className="flex justify-center mt-8">
              <Button onClick={loadMoreProducts} variant="outline" size="lg">
                Load More Products
              </Button>
            </div>
          )}

          {/* -- No Results -- */}
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
