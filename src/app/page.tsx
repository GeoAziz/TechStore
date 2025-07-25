
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cpu, Laptop, Mouse, MemoryStick, ChevronRight, Monitor, Keyboard, Headphones, Camera, HardDrive, CircuitBoard, Power, Wind, View } from 'lucide-react';
import Image from 'next/image';
import { categories } from '@/lib/mock-data';
import ProductCard from '@/components/shop/product-card';
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

export default async function Home() {
  const allProducts = await getProducts();
  const featuredProducts = allProducts.filter(p => p.featured).slice(0, 4);
  const displayedCategories = categories.slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="relative text-center py-20 md:py-32 lg:py-40 overflow-hidden">
           <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent"></div>
          <div className="container relative z-10">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary glow-primary">
              Zizo_OrderVerse
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground mb-8">
              System Link Established: Your portal to the next generation of computing hardware.
            </p>
            <Button asChild size="lg" className="bg-primary/90 hover:bg-primary text-primary-foreground font-bold text-lg group">
              <Link href="/shop">
                Start Your Build
                <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold glow-primary">
                <span className="text-accent">{'//'}</span> Mission Modules
              </h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Browse the core components of the OrderVerse. See all available modules in our main database.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {displayedCategories.map((category) => {
                const Icon = iconMap[category.name];
                return (
                  <Link href={category.href} key={category.name}>
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary transition-all duration-300 card-glow group aspect-square">
                      <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                        {Icon && <Icon className="w-10 h-10 mb-2 text-primary transition-transform group-hover:scale-110" />}
                        <h3 className="text-sm font-bold whitespace-normal">{category.name}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
                <Link href="/categories">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary transition-all duration-300 card-glow group aspect-square">
                    <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                      <View className="w-10 h-10 mb-2 text-primary transition-transform group-hover:scale-110" />
                      <h3 className="text-sm font-bold whitespace-normal">View All</h3>
                    </CardContent>
                  </Card>
                </Link>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product as Product} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <Card className="bg-card/50 backdrop-blur-sm border-accent/20 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4">Build Your Dream Rig</h2>
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
                  className="rounded-lg"
                  data-ai-hint="custom pc"
                />
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
