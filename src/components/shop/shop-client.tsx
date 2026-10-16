"use client";

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import type { Product, ProductCategory } from '@/lib/types';
import { categoryData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, SlidersHorizontal, X, List, LayoutGrid, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './product-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from "@/components/ui/badge";
import FilterPanel from './filter-panel';
import ShopHeroBanner from './shop-hero-banner';

function ShopClientInternal({ products, searchParams: serverSearchParams }: { products: Product[], searchParams: { category?: string, search?: string, sort?: string, subcategory?: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(serverSearchParams.search || '');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(serverSearchParams.category as ProductCategory || 'Laptops');
  const [activeSubcategory, setActiveSubcategory] = useState(serverSearchParams.subcategory || 'All');
  const [sortBy, setSortBy] = useState(serverSearchParams.sort || 'relevance');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pageSize, setPageSize] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);

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
    const cat = (searchParams?.get('category') as ProductCategory) || 'Laptops';
    const sub = searchParams?.get('subcategory') || 'All';
    const srt = searchParams?.get('sort') || 'relevance';
    const q = searchParams?.get('search') || '';
    const b = searchParams?.getAll('brands') || [];
    const minP = searchParams?.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
    const maxP = searchParams?.get('maxPrice') ? Number(searchParams.get('maxPrice')) : maxPrice;

    setActiveCategory(prev => prev !== cat ? cat : prev);
    setActiveSubcategory(prev => prev !== sub ? sub : prev);
    setSortBy(prev => prev !== srt ? srt : prev);
    setSearchTerm(prev => prev !== q ? q : prev);
    setSelectedBrands(prev => JSON.stringify(prev) !== JSON.stringify(b) ? b : prev);
    setPriceRange(prev => (prev[0] !== minP || prev[1] !== maxP) ? [minP, maxP] : prev);
  }, [searchParams, maxPrice]);

  const handleCategoryChange = (category: ProductCategory) => {
    setActiveCategory(category);
    setActiveSubcategory('All');
    setCurrentPage(1);
    updateURL({ category, subcategory: null, brands: null });
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setActiveSubcategory(subcategory);
    setCurrentPage(1);
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
    setCurrentPage(1);
    debouncedUpdateURL(term);
  };

  const clearSearchTerm = () => {
    setSearchTerm('');
    updateURL({ search: null });
  };

  const toggleBrand = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newBrands);
    setCurrentPage(1);
    updateURL({ brands: newBrands });
  };

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
    setCurrentPage(1);
    const handler = setTimeout(() => {
      updateURL({ minPrice: String(value[0]), maxPrice: String(value[1]) });
    }, 500);
    return () => clearTimeout(handler);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(prev => prev === color ? undefined : color);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, maxPrice]);
    setSearchTerm('');
    setSelectedColor(undefined);
    setCurrentPage(1);
    updateURL({ brands: null, minPrice: null, maxPrice: null, search: null });
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const categoryMatch = product.category === activeCategory;
      const subcategoryMatch = activeSubcategory === 'All' ? true : product.subcategory === activeSubcategory;
      const searchMatch = searchTerm ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      const brandMatch = selectedBrands.length > 0 ? selectedBrands.includes(product.brand) : true;
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      const colorMatch = selectedColor 
        ? (product.color?.toLowerCase().includes(selectedColor.toLowerCase()) || 
           product.description?.toLowerCase().includes(selectedColor.toLowerCase()) || 
           product.name?.toLowerCase().includes(selectedColor.toLowerCase()))
        : true;
      return categoryMatch && subcategoryMatch && searchMatch && brandMatch && priceMatch && colorMatch;
    });

    switch (sortBy) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
            break;
        case 'name-asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            break;
    }

    return filtered;
  }, [products, activeCategory, activeSubcategory, searchTerm, sortBy, selectedBrands, priceRange, selectedColor]);

  // Total pages
  const totalPages = Math.ceil(filteredAndSortedProducts.length / pageSize) || 1;

  // Sliced products for current page
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedProducts.slice(start, start + pageSize);
  }, [filteredAndSortedProducts, currentPage, pageSize]);

  const activeFilterChips = useMemo(() => {
    const chips: { type: string, value: string, display: string }[] = [];
    if (searchTerm) {
      chips.push({ type: 'search', value: searchTerm, display: `Filter: "${searchTerm}"` });
    }
    selectedBrands.forEach(b => chips.push({ type: 'brand', value: b, display: b }));
    if (selectedColor) {
      chips.push({ type: 'color', value: selectedColor, display: `Color: ${selectedColor}` });
    }
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) {
      chips.push({ type: 'price', value: 'price', display: `KES ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}` });
    }
    return chips;
  }, [searchTerm, selectedBrands, selectedColor, priceRange, maxPrice]);
  
  const removeFilter = (chip: {type: string, value: string}) => {
    if (chip.type === 'search') clearSearchTerm();
    if (chip.type === 'brand') toggleBrand(chip.value);
    if (chip.type === 'color') setSelectedColor(undefined);
    if (chip.type === 'price') {
      const newPriceRange: [number, number] = [0, maxPrice];
      setPriceRange(newPriceRange);
      updateURL({ minPrice: null, maxPrice: null });
    }
  };

  const subcategories = useMemo(() => {
      const current = categoryData.find(c => c.name === activeCategory);
      return current?.subcategories || [];
  }, [activeCategory]);

  // Categories list with live item counts
  const categoriesWithCounts = useMemo(() => {
    return categoryData.map(c => ({
      name: c.name as ProductCategory,
      count: products.filter(p => p.category === c.name).length,
    }));
  }, [products]);

  // Brand list with live item counts
  const brandCounts = useMemo(() => {
    const categoryProducts = products.filter(p => p.category === activeCategory);
    const countMap: Record<string, number> = {};
    categoryProducts.forEach(p => {
      countMap[p.brand] = (countMap[p.brand] || 0) + 1;
    });
    return Object.entries(countMap)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);
  }, [products, activeCategory]);

  // Best sellers for sidebar widget
  const bestSellers = useMemo(() => {
    return [...products]
      .filter(p => p.isFeatured || (p.averageRating && p.averageRating >= 4.5))
      .slice(0, 3);
  }, [products]);

  return (
    <div className="container mx-auto py-8">
      {/* Category Hero Banner with Breadcrumbs */}
      <ShopHeroBanner
        category={activeCategory}
        subcategory={activeSubcategory}
        totalResults={filteredAndSortedProducts.length}
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* -- Filters Sidebar (Desktop) -- */}
        <aside className="hidden lg:block w-full lg:w-1/4 xl:w-1/5 sticky top-28 h-fit">
           <div className="bg-[#12141c]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
             <FilterPanel 
              categories={categoriesWithCounts}
              activeCategory={activeCategory}
              onSelectCategory={handleCategoryChange}
              brandCounts={brandCounts}
              selectedBrands={selectedBrands}
              toggleBrand={toggleBrand}
              priceRange={priceRange}
              setPriceRange={handlePriceChange}
              maxPrice={maxPrice}
              selectedColor={selectedColor}
              onSelectColor={handleColorChange}
              clearFilters={clearFilters}
              bestSellerProducts={bestSellers}
             />
           </div>
        </aside>

        {/* -- Main Content -- */}
        <main className="flex-1 min-w-0 w-full">
          {/* -- Main Category Horizontal Pills -- */}
          <div className="mb-4">
            <Tabs value={activeCategory} onValueChange={(val) => handleCategoryChange(val as ProductCategory)}>
                <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="bg-transparent p-0 gap-2">
                        {categoryData.map(category => (
                        <TabsTrigger 
                          key={category.name} 
                          value={category.name} 
                          className="rounded-full px-5 py-2 font-semibold text-sm border border-white/10 bg-[#131622]/80 text-muted-foreground data-[state=active]:bg-[#bef264] data-[state=active]:text-black data-[state=active]:font-extrabold data-[state=active]:border-[#bef264] data-[state=active]:shadow-[0_0_12px_rgba(190,242,100,0.4)] transition-all"
                        >
                            {category.name}
                        </TabsTrigger>
                        ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </Tabs>
          </div>
          
          {/* -- Subcategory Pills -- */}
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
                            className="rounded-full px-4 py-1.5 text-xs font-semibold border border-white/10 bg-[#131622]/60 text-muted-foreground data-[state=active]:bg-white/15 data-[state=active]:text-lime-300 data-[state=active]:border-lime-400/40 transition-all"
                          >
                            All {activeCategory}
                          </TabsTrigger>
                          {subcategories.map(sub => (
                            <TabsTrigger
                              key={sub}
                              value={sub}
                              className="rounded-full px-4 py-1.5 text-xs font-semibold border border-white/10 bg-[#131622]/60 text-muted-foreground data-[state=active]:bg-white/15 data-[state=active]:text-lime-300 data-[state=active]:border-lime-400/40 transition-all"
                            >
                              {sub}
                            </TabsTrigger>
                          ))}
                      </TabsList>
                      <ScrollBar orientation="horizontal" />
                  </ScrollArea>
              </Tabs>
            </motion.div>
          )}
          
          {/* -- Utility Bar: Search, Show limit, Sorting, View Toggle -- */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3 sm:p-4 rounded-2xl border border-white/10 bg-[#131622]/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              {/* Quick Filter */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={`Search ${activeCategory.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => handleSearchTermChange(e.target.value)}
                  className="pl-10 pr-9 h-10 text-xs sm:text-sm bg-[#090a0f]/80 border-white/10 focus:border-lime-400 text-white placeholder:text-muted-foreground rounded-xl"
                  aria-label={`Search in ${activeCategory}`}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearchTerm}
                    aria-label="Clear search input"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Utility controls: Show Count, Sort Selector, View Mode */}
              <div className="flex items-center gap-2.5 shrink-0 justify-between sm:justify-end flex-wrap">
                {/* Show Items per Page */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                  <span className="hidden sm:inline">Show:</span>
                  <Select value={String(pageSize)} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
                    <SelectTrigger className="w-[72px] h-10 text-xs bg-[#090a0f]/80 border-white/10 focus:border-lime-400 text-white rounded-xl">
                      <SelectValue placeholder="Show" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#131622] border-white/15 text-white">
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Selector */}
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[155px] h-10 text-xs sm:text-sm bg-[#090a0f]/80 border-white/10 focus:border-lime-400 text-white rounded-xl">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#131622] border-white/15 text-white">
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="name-asc">Alphabetical (A-Z)</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-[#090a0f]/80 rounded-xl border border-white/10">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={`w-8 h-8 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#bef264] text-black hover:bg-lime-300' : 'text-muted-foreground hover:text-white'}`}
                    aria-label="Grid layout view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={`w-8 h-8 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#bef264] text-black hover:bg-lime-300' : 'text-muted-foreground hover:text-white'}`}
                    aria-label="List layout view"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* -- Active Filter Chips & Counter -- */}
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
                     <Badge variant="secondary" className="text-xs flex gap-1.5 items-center pl-3 pr-2 py-1 rounded-full bg-white/10 text-white border border-white/15">
                       {chip.display}
                       <button title={`Remove ${chip.display} filter`} onClick={() => removeFilter(chip)} className="hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center transition-colors">
                         <X className="w-3 h-3"/>
                       </button>
                     </Badge>
                   </motion.div>
                 ))}
               </AnimatePresence>
               {activeFilterChips.length > 1 && (
                 <button
                   onClick={clearFilters}
                   className="text-xs text-lime-400 hover:text-lime-300 underline underline-offset-4 ml-1"
                 >
                   Clear All
                 </button>
               )}
            </div>
            <p aria-live="polite" className="text-muted-foreground text-xs font-medium">
              Showing {paginatedProducts.length} of {filteredAndSortedProducts.length} results
            </p>
          </div>
          
          {/* -- Product Grid / List -- */}
          <motion.div 
            layout 
            className={`grid gap-6 lg:gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
          >
            <AnimatePresence>
                {paginatedProducts.map(product => (
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

          {/* -- Numeric Pagination Bar -- */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 py-4 border-t border-white/10">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-xl border-white/10 hover:border-white/30 text-white disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#bef264] text-black hover:bg-lime-300 shadow-[0_0_12px_rgba(190,242,100,0.4)]'
                        : 'border-white/10 hover:border-white/30 text-white bg-transparent'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-xl border-white/10 hover:border-white/30 text-white disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* -- No Results with Reset CTA -- */}
          {filteredAndSortedProducts.length === 0 && (
             <div className="text-center col-span-full py-16 p-8 glass-panel rounded-2xl border border-white/10 space-y-4">
                <h2 className="text-2xl font-bold text-white">No Products Found</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                  Your search or active filters returned no hardware in this category. Try adjusting or clearing your filters.
                </p>
                <Button onClick={clearFilters} className="rounded-full bg-[#bef264] text-black font-extrabold hover:bg-lime-300 gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset All Filters
                </Button>
             </div>
          )}
        </main>
      </div>

      {/* -- Mobile Filter Trigger -- */}
      <Sheet>
          <SheetTrigger asChild>
              <Button
                  variant="outline"
                  className="lg:hidden fixed bottom-20 right-6 z-40 border-lime-400/50 text-[#bef264] bg-[#131622]/95 hover:bg-lime-400/10 shadow-[0_4px_24px_rgba(0,0,0,0.6)] rounded-full h-12 px-4 flex items-center gap-2 backdrop-blur-md"
                  aria-label="Open Filters"
              >
                  <SlidersHorizontal className="h-4 w-4 text-lime-400" />
                  <span className="text-xs font-bold">Filters</span>
              </Button>
          </SheetTrigger>
          <SheetContent className="w-[320px] sm:w-[380px] p-0 border-white/15 bg-[#0e1017] text-white overflow-y-auto">
              <SheetHeader className="p-4 pb-0 border-b border-white/10">
                  <SheetTitle className="text-white glow-primary">Filters</SheetTitle>
              </SheetHeader>
              <FilterPanel
                  categories={categoriesWithCounts}
                  activeCategory={activeCategory}
                  onSelectCategory={handleCategoryChange}
                  brandCounts={brandCounts}
                  selectedBrands={selectedBrands}
                  toggleBrand={toggleBrand}
                  priceRange={priceRange}
                  setPriceRange={handlePriceChange}
                  maxPrice={maxPrice}
                  selectedColor={selectedColor}
                  onSelectColor={handleColorChange}
                  clearFilters={clearFilters}
                  bestSellerProducts={bestSellers}
              />
          </SheetContent>
      </Sheet>
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
