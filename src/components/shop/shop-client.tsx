
"use client";

import { useState, useMemo } from 'react';
import type { Product } from '@/lib/types';
import { categories } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from './product-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

// Extracted FilterPanel component
const FilterPanel = ({ 
  searchTerm, 
  setSearchTerm, 
  handleSearch, 
  clearSearch, 
  handleSortChange,
  currentSort 
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  clearSearch: () => void;
  handleSortChange: (value: string) => void;
  currentSort?: string;
}) => (
  <aside className="lg:h-screen lg:sticky top-16 bg-card/30 backdrop-blur-sm p-6 lg:w-80 border-r border-primary/10">
     <h2 className="text-2xl font-bold mb-6 glow-primary">Filters</h2>
     <form onSubmit={handleSearch} className="space-y-8">
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
     </form>
  </aside>
);


export default function ShopClient({ products, searchParams }: { products: Product[], searchParams: { category?: string, search?: string, sort?: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.search || '');

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    return params.toString();
  };

  const handleCategoryChange = (category: string) => {
    const newCategory = category === 'All' ? '' : category;
    router.push(pathname + '?' + createQueryString('category', newCategory));
  };
  
  const handleSortChange = (sortValue: string) => {
    router.push(pathname + '?' + createQueryString('sort', sortValue));
  };
  
  const handleSearch = (e: React.FormEvent) => {
     e.preventDefault();
     router.push(pathname + '?' + createQueryString('search', searchTerm));
  }

  const clearSearch = () => {
    setSearchTerm('');
    router.push(pathname + '?' + createQueryString('search', ''));
  }

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const categoryMatch = searchParams.category ? product.category === searchParams.category : true;
      const searchMatch = searchParams.search ? product.name.toLowerCase().includes(searchParams.search.toLowerCase()) : true;
      return categoryMatch && searchMatch;
    });

    switch (searchParams.sort) {
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
  }, [products, searchParams]);

  return (
    <div className="container mx-auto">
      <div className="lg:flex">
        {/* Desktop Filter Panel */}
        <div className="hidden lg:block">
           <FilterPanel 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            clearSearch={clearSearch}
            handleSortChange={handleSortChange}
            currentSort={searchParams.sort}
           />
        </div>

        <main className="flex-1 py-8 lg:py-12 px-4 lg:px-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tighter mb-2 glow-primary">Product Marketplace</h1>
            <p className="text-muted-foreground">Browse all products or filter by category.</p>
          </header>

          {/* Category Tabs */}
           <div className="mb-8">
            <Tabs defaultValue={searchParams.category || "All"} onValueChange={handleCategoryChange}>
              <TabsList className="bg-transparent p-0">
                  <TabsTrigger value="All" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">All</TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger key={category.name} value={category.name} className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
           </div>
          
           {/* Mobile Filter Button */}
           <div className="flex justify-between items-center mb-6 lg:hidden">
             <p className="text-muted-foreground">{filteredAndSortedProducts.length} transmissions found</p>
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters & Sort
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
                      currentSort={searchParams.sort}
                    />
                </SheetContent>
             </Sheet>
           </div>


           <div className="hidden lg:flex justify-end items-center mb-6">
             <p className="text-muted-foreground mr-4">{filteredAndSortedProducts.length} transmissions found</p>
           </div>

          <motion.div 
            layout 
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
          >
            {filteredAndSortedProducts.map(product => (
              <motion.div layout key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ProductCard product={product} />
              </motion.div>
            ))}
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
