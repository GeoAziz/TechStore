"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Cpu, Laptop, Mouse, MemoryStick, ChevronRight, Monitor, Keyboard, Headphones, Camera, HardDrive, CircuitBoard, Power, Wind, View } from 'lucide-react';
import Image from 'next/image';
import { categoryData } from '@/lib/mock-data';
import ProductCardExternal from '@/components/shop/product-card';
import { getProducts } from '@/lib/firestore-service';
import type { Product } from '@/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const iconMap: { [key: string]: React.ElementType } = {
  Laptops: Laptop,
  Desktops: Monitor,
  Monitors: Monitor,
  Keyboards: Keyboard,
  Mice: Mouse,
  Headphones: Headphones,
  Webcams: Camera,
  'Storage Drives': HardDrive,
  'Graphic Cards': MemoryStick,
  Processors: Cpu,
  'RAM Modules': MemoryStick,
  Motherboards: CircuitBoard,
  'Power Supplies': Power,
  'Coolers/Fans': Wind,
};

function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center h-[400px] bg-gradient-to-br from-[#10102a] via-[#18182c] to-[#0c0c1e] text-cyan-100 shadow-neon-accent">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight neon-glow">Upgrade Your Tech Universe</h1>
      <p className="text-lg md:text-2xl mb-6 text-muted-foreground">Shop the best computer accessories & electronics with sci-fi style.</p>
      <Button size="lg" variant="default" className="bg-accent text-white neon-glow px-8 py-4 text-xl font-bold animate-pulse">Shop Now</Button>
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-8 py-4">
        <Badge variant="secondary" className="text-lg animate-pulse">Trending</Badge>
        <Badge variant="outline" className="text-lg animate-pulse">New Arrivals</Badge>
        <Badge variant="default" className="text-lg animate-pulse">Top Deals</Badge>
      </div>
    </section>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-card/80 border-accent/40 shadow-neon-accent rounded-xl p-4 flex flex-col gap-2 animate-pulse h-64 w-full" aria-label="Loading product" />
  );
}

function ProductCardLocal({ product, onCompare }: { product: any; onCompare: (product: any) => void }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="bg-card/80 border-accent/40 shadow-neon-accent rounded-xl p-4 flex flex-col gap-2 font-[Orbitron,Space Grotesk,monospace]" tabIndex={0} aria-label={product.name}>
      <img src={product.image} alt={product.name} className="rounded-lg h-40 object-cover mb-2" loading="lazy" />
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-cyan-100">{product.name}</h2>
        <Badge variant={product.inStock ? 'secondary' : 'destructive'}>{product.inStock ? 'In Stock' : 'Out of Stock'}</Badge>
      </div>
      <div className="flex gap-2 text-xs text-muted-foreground">
        <span>Ships in 24h</span>
        <span>Warranty: 1yr</span>
      </div>
      <div className="flex gap-2 mt-2">
        <Button variant="default" className="flex-1 font-bold animate-pulse shadow-lg hover:scale-105 transition-transform" aria-label="Add {product.name} to cart">Add to Cart</Button>
        <Button variant="outline" className="flex-1 font-bold animate-pulse hover:bg-accent/10 hover:text-accent transition-colors" aria-label="Add {product.name} to wishlist">Wishlist</Button>
        <Button variant="ghost" className="flex-1 font-bold" onClick={() => onCompare(product)} aria-label="Compare {product.name}">Compare</Button>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-yellow-400">★</span>
        <span className="font-bold">{product.rating}</span>
        <span className="text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
      </div>
      <div className="flex gap-2 mt-2">
        {product.specs.map((spec: string) => (
          <Badge key={spec} variant="secondary">{spec}</Badge>
        ))}
      </div>
    </motion.div>
  );
}

function ProductFilters({ filters, setFilters, brands, clearAll }: { filters: string[]; setFilters: (f: string[]) => void; brands: { name: string; logo: string }[]; clearAll: () => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map((f: string) => (
        <Badge key={f} variant="outline" className="flex items-center gap-1">
          {f}
          <Button size="sm" variant="ghost" onClick={() => setFilters(filters.filter((x: string) => x !== f))}>×</Button>
        </Badge>
      ))}
      <Button size="sm" variant="outline" onClick={clearAll}>Clear All</Button>
      <div className="flex gap-2 ml-4">
        {brands.map((b: { name: string; logo: string }) => (
          <img key={b.name} src={b.logo} alt={b.name} className="h-6 w-6 rounded-full border" />
        ))}
      </div>
      <select className="ml-auto bg-background border rounded px-2 py-1 text-cyan-100">
        <option>Sort by: Featured</option>
        <option>Price: Low to High</option>
        <option>Price: High to Low</option>
        <option>Rating</option>
        <option>Newest</option>
      </select>
    </div>
  );
}

function CompareBar({ products, onRemove }: { products: any[]; onRemove: (id: number) => void }) {
  if (products.length === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 border-t border-accent/30 flex items-center justify-center gap-4 px-6 py-3 shadow-neon-accent">
      <span className="font-bold text-accent">Comparing:</span>
      {products.map((p) => (
        <div key={p.id} className="flex items-center gap-2 bg-card px-3 py-1 rounded shadow">
          <span>{p.name}</span>
          <Button size="sm" variant="ghost" onClick={() => onRemove(p.id)}>×</Button>
        </div>
      ))}
      <Button variant="default" className="font-bold">Compare Now</Button>
    </div>
  );
}

function CartWishlistBar({ cartTotal, wishlistCount }: { cartTotal: number; wishlistCount: number }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#10102a] via-[#18182c] to-[#0c0c1e] border-t border-accent/30 flex items-center justify-between px-6 py-3 shadow-neon-accent font-[Orbitron,Space Grotesk,monospace]">
      <Button variant="default" className="font-bold animate-pulse" aria-label="Checkout">Checkout (${cartTotal.toFixed(2)})</Button>
      <Button variant="outline" className="font-bold" aria-label="Wishlist">Wishlist ({wishlistCount})</Button>
      <Button variant="ghost" className="font-bold" aria-label="Save for Later">Save for Later</Button>
    </div>
  );
}

function CheckoutSection({ cartTotal }: { cartTotal: number }) {
  return (
    <section className="py-12">
      <div className="container max-w-lg mx-auto bg-card/80 rounded-xl shadow-neon-accent p-8">
        <h2 className="text-2xl font-bold mb-4 neon-glow">Secure Checkout</h2>
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="default" className="font-bold">🔒 Secure Payment</Badge>
          <Badge variant="outline" className="font-bold">💸 Money-back Guarantee</Badge>
          <Badge variant="secondary" className="font-bold">🚚 Fast Shipping</Badge>
        </div>
        <div className="mb-4 text-lg">Order Total: <span className="font-bold text-accent">${cartTotal.toFixed(2)}</span></div>
        <Button variant="default" className="w-full font-bold">Place Order</Button>
      </div>
    </section>
  );
}

function ReviewForm({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <form className="flex flex-col gap-2 mt-4" onSubmit={e => { e.preventDefault(); onSubmit(text); setText(''); }}>
      <textarea value={text} onChange={e => setText(e.target.value)} className="bg-background border rounded px-2 py-1 text-cyan-100" placeholder="Write your review..." required />
      <Button type="submit" variant="default" className="font-bold">Submit Review</Button>
    </form>
  );
}

function ReviewsSection({ reviews }: { reviews: any[] }) {
  return (
    <section className="py-12">
      <div className="container max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4 neon-glow">Top Reviews & Q&A</h2>
        <div className="flex flex-col gap-4">
          {reviews.map((r, i) => (
            <div key={i} className="bg-card/80 rounded-xl p-4 shadow">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Verified Buyer</Badge>
                <span className="font-bold text-cyan-100">{r.user}</span>
                <span className="text-yellow-400">★ {r.rating}</span>
              </div>
              <div className="text-cyan-100">{r.text}</div>
            </div>
          ))}
        </div>
        <ReviewForm onSubmit={text => alert('Review submitted: ' + text)} />
      </div>
    </section>
  );
}

function Recommendations({ products }: { products: any[] }) {
  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-xl font-bold mb-4 neon-glow">You May Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(p => <ProductCardLocal key={p.id} product={p} onCompare={() => {}} />)}
        </div>
      </div>
    </section>
  );
}

function RecentlyViewed({ products }: { products: any[] }) {
  if (!products.length) return null;
  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-xl font-bold mb-4 neon-glow">Recently Viewed</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(p => <ProductCardLocal key={p.id} product={p} onCompare={() => {}} />)}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  // Use mock data or fetch in useEffect for client component
  const [filters, setFilters] = useState(['Gaming', 'SSD']);
  const [sort, setSort] = useState('Featured');
  const [compareProducts, setCompareProducts] = useState<any[]>([]);
  const [cartTotal] = useState(289.97); // Example total
  const [wishlistCount] = useState(2); // Example count
  const [loading, setLoading] = useState(false);
  const reviews = [
    { user: 'Alice', rating: 5, text: 'Amazing keyboard, super responsive!' },
    { user: 'Bob', rating: 4, text: 'SSD is blazing fast, great value.' },
    { user: 'Carol', rating: 5, text: 'Mouse fits perfectly, love the DPI settings.' },
  ];
  const recommendations = [
    { id: 1, name: 'Corsair RGB Keyboard', image: '/products/keyboard.jpg', inStock: true, rating: 4.8, reviewCount: 120, specs: ['RGB', 'Mechanical', 'USB'], price: 99.99 },
    { id: 2, name: 'Logitech G502 Mouse', image: '/products/mouse.jpg', inStock: true, rating: 4.7, reviewCount: 98, specs: ['Wireless', 'Gaming', 'DPI'], price: 59.99 },
    { id: 3, name: 'Samsung SSD 1TB', image: '/products/ssd.jpg', inStock: false, rating: 4.9, reviewCount: 210, specs: ['1TB', 'NVMe', 'Fast'], price: 129.99 },
  ];
  const recentlyViewed = recommendations.slice(1, 3);
  const brands = [
    { name: 'Corsair', logo: '/brands/corsair.png' },
    { name: 'Logitech', logo: '/brands/logitech.png' },
    { name: 'Samsung', logo: '/brands/samsung.png' },
  ];
  const products = [
    { id: 1, name: 'Corsair RGB Keyboard', image: '/products/keyboard.jpg', inStock: true, rating: 4.8, reviewCount: 120, specs: ['RGB', 'Mechanical', 'USB'], price: 99.99 },
    { id: 2, name: 'Logitech G502 Mouse', image: '/products/mouse.jpg', inStock: true, rating: 4.7, reviewCount: 98, specs: ['Wireless', 'Gaming', 'DPI'], price: 59.99 },
    { id: 3, name: 'Samsung SSD 1TB', image: '/products/ssd.jpg', inStock: false, rating: 4.9, reviewCount: 210, specs: ['1TB', 'NVMe', 'Fast'], price: 129.99 },
  ];
  const featuredProducts = products;
  const displayedCategories: { name: string; href: string }[] = [
    { name: 'Laptops', href: '/categories/laptops' },
    { name: 'Keyboards', href: '/categories/keyboards' },
    { name: 'Mice', href: '/categories/mice' },
    { name: 'Monitors', href: '/categories/monitors' },
    { name: 'Headphones', href: '/categories/headphones' },
  ];
  const sortedProducts = [...products].sort((a, b) => {
    if (sort === 'Price: Low to High') return (a.price ?? 0) - (b.price ?? 0);
    if (sort === 'Price: High to Low') return (b.price ?? 0) - (a.price ?? 0);
    if (sort === 'Rating') return (b.rating ?? 0) - (a.rating ?? 0);
    if (sort === 'Newest') return (b.id ?? 0) - (a.id ?? 0);
    return 0;
  });
  const clearAll = () => setFilters([]);
  const handleCompare = (product: any) => {
    if (!compareProducts.find(p => p.id === product.id)) {
      setCompareProducts([...compareProducts, product]);
    }
  };
  const handleRemoveCompare = (id: number) => {
    setCompareProducts(compareProducts.filter(p => p.id !== id));
  };

  // Simulate loading for skeletons
  // useEffect(() => { setLoading(true); setTimeout(() => setLoading(false), 1200); }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#10102a] via-[#18182c] to-[#0c0c1e] text-cyan-100 font-[Orbitron,Space Grotesk,monospace]">
      <main className="flex-1">
        <HeroSection />
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold glow-primary">
                <span className="text-accent">{'//'}</span> Mission Modules
              </h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Browse the core components of the OrderVerse. See all available modules in our main database.</p>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-4 p-4">
                    {displayedCategories.map((category: { name: string; href: string }) => {
                        const Icon = iconMap[category.name];
                        return (
                        <Link href={category.href} key={category.name}>
                            <Card className="glass-panel hover:border-primary transition-all duration-300 card-glow group w-40 h-40">
                            <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                                {Icon && <Icon className="w-10 h-10 mb-2 text-primary transition-transform group-hover:scale-110" />}
                                <h3 className="text-sm font-bold whitespace-normal">{category.name}</h3>
                            </CardContent>
                            </Card>
                        </Link>
                        );
                    })}
                    <Link href="/categories">
                        <Card className="glass-panel hover:border-primary transition-all duration-300 card-glow group w-40 h-40">
                        <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                            <View className="w-10 h-10 mb-2 text-primary transition-transform group-hover:scale-110" />
                            <h3 className="text-sm font-bold whitespace-normal">View All</h3>
                        </CardContent>
                        </Card>
                    </Link>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-bold glow-primary">
                  <span className="text-accent">{'//'}</span> 🔥 Featured Deals
                </h2>
                 <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Discover the hottest tech in the galaxy, hand-picked by our specialists.</p>
                 <div className="mt-6">
                    <Button asChild variant="outline">
                    <Link href="/deals">
                        View All Deals <View className="w-4 h-4 ml-2"/>
                    </Link>
                    </Button>
                 </div>
            </div>
            <div className="mb-6 flex items-center gap-4">
              <ProductFilters filters={filters} setFilters={setFilters} brands={brands} clearAll={clearAll} />
              <select value={sort} onChange={e => setSort(e.target.value)} className="bg-background border rounded px-2 py-1 text-cyan-100 font-[Orbitron,Space Grotesk,monospace]">
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
                <option>Newest</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : sortedProducts.map((product: any) => (
                    <ProductCardLocal key={product.id} product={product} onCompare={handleCompare} />
                  ))}
            </div>
            <CompareBar products={compareProducts} onRemove={handleRemoveCompare} />
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <Card className="glass-panel p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4 glow-accent">Build Your Dream Rig</h2>
                <p className="text-muted-foreground mb-6">
                  Use our interactive PC builder to configure your ultimate machine. Mix and match components for peak performance.
                </p>
                <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground group">
                  <Link href="/customizer">
                    Launch Customizer <span className="text-primary ml-2 group-hover:text-accent-foreground">{'->'}</span>
                  </Link>
                </Button>
              </div>
              <div className="flex-shrink-0">
                <Image 
                  src="https://placehold.co/400x300.png"
                  alt="Custom PC Build"
                  width={400}
                  height={300}
                  className="rounded-lg shadow-2xl shadow-accent/20"
                  data-ai-hint="custom pc"
                />
              </div>
            </Card>
          </div>
        </section>

        <CartWishlistBar cartTotal={cartTotal} wishlistCount={wishlistCount} />
        <CheckoutSection cartTotal={cartTotal} />
        <ReviewsSection reviews={reviews} />
        <Recommendations products={recommendations} />
        <RecentlyViewed products={recentlyViewed} />
      </main>
      <style jsx global>{`
        body { font-family: 'Orbitron', 'Space Grotesk', monospace; background: linear-gradient(135deg, #10102a 0%, #18182c 60%, #0c0c1e 100%); }
        .neon-glow { text-shadow: 0 0 8px #00fff7, 0 0 24px #7f00ff; }
        .glass-panel { background: rgba(16,16,42,0.7); backdrop-filter: blur(8px); border-radius: 1rem; border: 1px solid #00fff7; }
        .card-glow { box-shadow: 0 0 24px #00fff7cc, 0 0 8px #7f00ff; }
      `}</style>
    </div>
  );
}
