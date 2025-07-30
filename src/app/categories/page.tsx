import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { categoryData } from '@/lib/mock-data';
import { Cpu, Laptop, Mouse, MemoryStick, Monitor, Keyboard, Headphones, Camera, HardDrive, CircuitBoard, Power, Wind } from 'lucide-react';

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

export default function CategoriesPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tighter mb-2 glow-primary">All Categories</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">Select a category to explore the available modules and components in the OrderVerse database.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {categoryData.map((category) => {
          const Icon = iconMap[category.name];
          return (
            <Link href={category.href} key={category.name}>
              <Card className="glass-panel hover:border-primary transition-all duration-300 card-glow group h-full">
                <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                  {Icon && <Icon className="w-12 h-12 mb-4 text-primary transition-transform group-hover:scale-110" />}
                  <h3 className="text-lg font-bold">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
