import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProducts } from '@/lib/firestore-service';
import { Cpu, Laptop, Mouse, MemoryStick, Monitor, Keyboard, Headphones, Camera, HardDrive, CircuitBoard, Power, Wind, Layers } from 'lucide-react';

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
  Accessories: Layers,
};

export default async function CategoriesPage() {
  let products: any[] = [];
  try {
    products = await getProducts();
  } catch (err) {
    console.error('Failed to fetch products for categories:', err);
    products = [];
  }

  // Aggregate categories dynamically from live Firestore catalog
  const categoryCounts: Record<string, number> = {};
  for (const product of products) {
    if (product.category) {
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    }
  }

  // Ensure standard categories exist even if catalog has zero items in some
  const defaultCategories = [
    'Laptops',
    'Desktops',
    'Monitors',
    'Keyboards',
    'Mice',
    'Headphones',
    'Webcams',
    'Storage Drives',
    'Graphic Cards',
    'Processors',
    'RAM Modules',
    'Motherboards',
    'Power Supplies',
    'Coolers/Fans',
  ];

  for (const cat of defaultCategories) {
    if (!(cat in categoryCounts)) {
      categoryCounts[cat] = 0;
    }
  }

  const categoryList = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tighter mb-2 glow-primary">All Categories</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore hardware modules, peripherals, and components across our live catalog.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categoryList.map(([name, count]) => {
          const Icon = iconMap[name] || Layers;
          return (
            <Link href={`/shop?category=${encodeURIComponent(name)}`} key={name}>
              <Card className="glass-panel hover:border-primary transition-all duration-300 card-glow group h-full">
                <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full gap-2">
                  <Icon className="w-12 h-12 text-primary transition-transform group-hover:scale-110" />
                  <h3 className="text-lg font-bold">{name}</h3>
                  <Badge variant="outline" className="text-xs border-cyan-400/30 text-cyan-200">
                    {count} {count === 1 ? 'item' : 'items'}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
