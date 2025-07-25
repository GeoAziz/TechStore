"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { categories } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, SlidersHorizontal, X, List, LayoutGrid } from 'lucide-react';
import ProductCard from './product-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const FilterPanel = ({ 
  searchTerm, 
  setSearchTerm, 
  handleSearch, 
  clearSearch, 
  handleSortChange,
  currentSort,
  brands,
  selectedBrands,
  toggleBrand
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  clearSearch: () => void;
  handleSortChange: (value: string) => void;
  currentSort?: string;
  brands: string[];
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
}) => (
  <aside className="lg:h-screen lg:sticky top-16 bg-card/30 backdrop-blur-sm p-6 lg:w-80 border-r border-primary/10">
     <h2 className="text-2xl font-bold mb-6 glow-primary">Filters</h2>
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
             {searchTerm && (
                 <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={clearSearch}>
                     <X className="h-4 w-4" />
                 </Button>
             )}
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
        <Accordion type="multiple" defaultValue={['brands']} className="w-full">
            <AccordionItem value="brands">
                <AccordionTrigger className="text-lg font-semibold text-primary">Brands</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-2 pt-2">
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


export default function ShopClient({ products, searchParams }: { products: Product[], searchParams: { category?: string, search?: string, sort?: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.search || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.category || 'All');
  const [sortBy, setSortBy] = useState(searchParams.sort || 'relevance');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const uniqueBrands = useMemo(() => {
    const brands = new Set(products.map(p => p.brand));
    return Array.from(brands);
  }, [products]);

  const createQueryString = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(currentSearchParams.toString());
    for (const [name, value] of Object.entries(params)) {
        if (value) {
            newParams.set(name, value);
        } else {
            newParams.delete(name);
        }
    }
    return newParams.toString();
  };

  const updateURL = (newParams: Record<string, string | null>) => {
      router.push(pathname + '?' + createQueryString(newParams), { scroll: false });
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    updateURL({ category: category === 'All' ? null : category });
  };
  
  const handleSortChange = (sortValue: string) => {
    setSortBy(sortValue);
    updateURL({ sort: sortValue });
  };
  
  const handleSearch = (e: React.FormEvent) => {
     e.preventDefault();
     updateURL({ search: searchTerm });
  }

  const clearSearch = () => {
    setSearchTerm('');
    updateURL({ search: null });
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
        prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  }

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const categoryMatch = activeCategory === 'All' ? true : product.category === activeCategory;
      const searchMatch = searchTerm ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      const brandMatch = selectedBrands.length > 0 ? selectedBrands.includes(product.brand) : true;
      return categoryMatch && searchMatch && brandMatch;
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
        default: // 'relevance' or undefined
            // keep original order or implement relevance logic
            break;
    }

    return filtered;
  }, [products, activeCategory, searchTerm, sortBy, selectedBrands]);

  return (
    <div className="container mx-auto">
      <div className="lg:flex">
        <div className="hidden lg:block">
           <FilterPanel 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            clearSearch={clearSearch}
            handleSortChange={handleSortChange}
            currentSort={sortBy}
            brands={uniqueBrands}
            selectedBrands={selectedBrands}
            toggleBrand={toggleBrand}
           />
        </div>

        <main className="flex-1 py-8 lg:py-12 px-4 lg:px-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tighter mb-2 glow-primary">Product Marketplace</h1>
            <p className="text-muted-foreground">Browse all products or filter by category.</p>
          </header>

           <div className="mb-8">
            <Tabs defaultValue={activeCategory} onValueChange={handleCategoryChange}>
                <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="bg-transparent p-0">
                        <TabsTrigger value="All" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">All</TabsTrigger>
                        {categories.map(category => (
                        <TabsTrigger key={category.name} value={category.name} className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                            {category.name}
                        </TabsTrigger>
                        ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </Tabs>
           </div>
          
           <div className="flex justify-between items-center mb-6">
             <p className="text-muted-foreground">{filteredAndSortedProducts.length} transmissions found</p>
             <div className='flex items-center gap-2'>
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
                            setSearchTerm={setSearchTerm}
                            handleSearch={handleSearch}
                            clearSearch={clearSearch}
                            handleSortChange={handleSortChange}
                            currentSort={sortBy}
                            brands={uniqueBrands}
                            selectedBrands={selectedBrands}
                            toggleBrand={toggleBrand}
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

// Re-add ScrollArea and ScrollBar to be used in the component
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
