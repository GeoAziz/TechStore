
import { categories } from '@/lib/mock-data';
import ProductCard from '@/components/shop/product-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Cpu, Laptop, Mouse, MemoryStick, Search, ChevronRight, Monitor, Keyboard, Headphones, Camera, HardDrive, CircuitBoard, Power, Wind } from 'lucide-react';
import { getProducts } from '@/lib/firestore-service';

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

export default async function ShopPage({ searchParams }: { searchParams: { category?: string, search?: string } }) {
  const currentCategory = searchParams.category;
  const searchTerm = searchParams.search;

  const allProducts = await getProducts();

  const filteredProducts = allProducts.filter(product => {
    const categoryMatch = currentCategory ? product.category === currentCategory : true;
    const searchMatch = searchTerm ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return categoryMatch && searchMatch;
  });

  return (
    <div className="container py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tighter mb-2 glow-primary">Product Marketplace</h1>
        <p className="text-muted-foreground">Browse all products or filter by category.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <Card className="sticky top-24 bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-primary">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Find your gear..." className="pl-10" defaultValue={searchTerm}/>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-primary">Categories</h3>
                <ul className="space-y-2">
                  <li key="all">
                    <Link href="/shop" className={`flex items-center justify-between p-2 rounded-md transition-colors ${!currentCategory ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>
                      All Products
                      <ChevronRight className="w-4 h-4"/>
                    </Link>
                  </li>
                  {categories.map(category => {
                    const Icon = iconMap[category.name];
                    return (
                      <li key={category.name}>
                        <Link href={category.href} className={`flex items-center justify-between p-2 rounded-md transition-colors ${currentCategory === category.name ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}>
                           <span className="flex items-center gap-2">
                            {Icon && <Icon className="w-4 h-4" />}
                            {category.name}
                          </span>
                           <ChevronRight className="w-4 h-4"/>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">{filteredProducts.length} transmissions found</p>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
