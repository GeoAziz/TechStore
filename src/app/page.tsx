
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Cpu, Laptop, Mouse, MemoryStick, Monitor, Keyboard, Headphones, Camera, HardDrive, CircuitBoard, Power, Wind, View, Heart, Star, Truck, Shield, Rocket } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/lib/firestore-service';

const fonts = "font-[Orbitron,Rajdhani,Space Grotesk,monospace]";

function HeroSection() {
  return (
    <section className={`relative flex flex-col items-center justify-center h-[420px] bg-gradient-to-br from-[#10102a] via-[#18182c] to-[#0c0c1e] text-cyan-100 shadow-neon-accent overflow-hidden ${fonts}`}>
       <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
       <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }} 
        className="glass-panel px-8 py-10 rounded-xl text-center max-w-3xl mx-auto z-10"
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-4 tracking-tight glow-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Upgrade Your Tech Universe
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl mb-6 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Shop the best computer accessories & electronics with sci-fi style.
        </motion.p>
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.6, type: 'spring', stiffness: 120 }}
        >
          <Button size="lg" variant="default" className="bg-accent text-white neon-glow px-10 py-5 text-2xl font-bold animate-pulse shadow-lg" asChild>
            <Link href="/shop">Shop Now</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Icon className="w-7 h-7 glow-accent text-accent" />
      <h2 className="text-2xl md:text-3xl font-bold glow-primary">{title}</h2>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const [wish, setWish] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to add items to your cart.' });
      router.push('/login');
      return;
    }
    const result = await addToCart(user.uid, product.id);
    if(result.success) {
        toast({ title: "Success", description: `${product.name} added to cart!`});
    } else {
        toast({ variant: 'destructive', title: "Error", description: result.message });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
      className={`w-72 bg-card/60 border-accent/20 border shadow-neon-accent rounded-xl p-4 flex flex-col gap-2 glass-panel ${fonts} relative group`}
      tabIndex={0}
      aria-label={product.name}
    >
      {product.badge && (
        <Badge variant="default" className="absolute top-3 left-3 bg-accent text-accent-foreground neon-glow text-xs font-bold z-10">{product.badge}</Badge>
      )}
      <div className="relative">
        <Image src={product.image} alt={product.name} width={250} height={160} className="rounded-lg h-40 object-cover mb-2 w-full" loading="lazy" />
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/30 hover:bg-black/60 rounded-full" aria-label="Wishlist" onClick={(e) => { e.preventDefault(); setWish(!wish); }}>
          <Heart className={`w-5 h-5 transition-all ${wish ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
        </Button>
      </div>
      <div className="flex items-start justify-between">
        <h2 className="font-bold text-lg text-cyan-100 pr-2 flex-1">{product.name}</h2>
        <Badge variant={product.inStock ? 'secondary' : 'destructive'} className={`${product.inStock ? 'bg-green-500/20 text-green-300' : ''}`}>{product.inStock ? (product.stock < 5 ? 'Low Stock' : 'In Stock') : 'Out of Stock'}</Badge>
      </div>
       <div className="flex items-center gap-1 mt-1 text-sm">
        <Star className="w-4 h-4 text-yellow-400" />
        <span className="font-bold">{product.rating}</span>
        <span className="text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
      </div>
      <div className="flex gap-2 text-xs text-muted-foreground mt-2">
        <Badge variant="outline" className="flex items-center gap-1"><Truck className="w-3 h-3 text-accent" /> <span>Free Shipping</span></Badge>
        <Badge variant="outline" className="flex items-center gap-1"><Shield className="w-3 h-3 text-accent" /> <span>1yr Warranty</span></Badge>
      </div>
       <div className="flex-grow" />
       <div className="flex gap-2 mt-3 flex-wrap">
        {product.specs.map((spec: string) => (
          <Badge key={spec} variant="secondary">{spec}</Badge>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
          <Button variant="default" className="w-full font-bold glow-primary shadow-lg transition-transform" aria-label={`Add ${product.name} to cart`} onClick={handleAddToCart}>Add to Cart</Button>
        </motion.div>
        <Button variant="outline" className="font-bold" aria-label={`Compare ${product.name}`}>Compare</Button>
      </div>
    </motion.div>
  );
}

function HorizontalScroller({ products, title, icon, viewAllHref, badge }: { products: any[]; title: string; icon: React.ElementType; viewAllHref: string; badge: string }) {
  return (
    <section className="py-12">
      <div className="container">
        <SectionHeading icon={icon} title={title} />
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0c0c1e] to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0c0c1e] to-transparent pointer-events-none z-10" />
          <ScrollArea className="w-full whitespace-nowrap -m-2 p-2">
            <div className="flex w-max space-x-6 py-2 snap-x snap-mandatory overflow-x-auto">
              {products.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="snap-center">
                  <Link href={`/product/${product.id}`}><ProductCard product={{ ...product, badge }} /></Link>
                </motion.div>
              ))}
              <motion.div 
                initial={{ opacity: 0, x: 40 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.5, delay: products.length * 0.1 }}
                className="snap-center flex items-center justify-center"
              >
                  <Link href={viewAllHref}>
                    <div className="flex items-center justify-center w-48 h-full rounded-xl glass-panel glow-primary text-accent font-bold text-lg hover:bg-accent/10 transition-all">
                        View All →
                    </div>
                  </Link>
              </motion.div>
            </div>
            <ScrollBar orientation="horizontal" className="mt-4" />
          </ScrollArea>
        </div>
      </div>
    </section>
  );
}


function FeaturedCategories() {
  const modules = [
    { name: 'Gaming Gear', icon: MemoryStick, href: '/shop?category=Graphic Cards' },
    { name: 'Displays', icon: Monitor, href: '/shop?category=Monitors' },
    { name: 'Audio Systems', icon: Headphones, href: '/shop?category=Headphones' },
    { name: 'Storage Drives', icon: HardDrive, href: '/shop?category=Storage Drives' },
  ];
  return (
    <section className="py-12">
      <div className="container">
        <SectionHeading icon={View} title="Mission Modules" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {modules.map((mod, i) => (
            <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
            >
                <Link href={mod.href}>
                  <div className="glass-panel card-glow flex flex-col items-center justify-center p-6 rounded-xl hover:bg-accent/10 transition-all h-full">
                    <mod.icon className="w-10 h-10 mb-3 text-accent" />
                    <span className="font-bold text-lg text-center">{mod.name}</span>
                  </div>
                </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  // Mock data for demonstration
  const trendingProducts = [
    { id: 'rtx-3060-ti', name: 'NVIDIA RTX 3060 Ti', image: 'https://placehold.co/400x300.png', inStock: true, stock: 8, rating: 4.8, reviewCount: 120, specs: ['RGB', '12GB GDDR6X', 'PCIe 4.0'], dataAiHint: "graphics card" },
    { id: 'mx-master-3s', name: 'Logitech MX Master 3S', image: 'https://placehold.co/400x300.png', inStock: true, stock: 2, rating: 4.9, reviewCount: 98, specs: ['Wireless', '8K DPI', 'Quiet Click'], dataAiHint: "computer mouse" },
    { id: 'samsung-980-pro-1tb', name: 'Samsung 980 Pro 1TB', image: 'https://placehold.co/400x300.png', inStock: true, stock: 15, rating: 4.9, reviewCount: 210, specs: ['1TB', 'NVMe', '7,000 MB/s'], dataAiHint: "solid state drive" },
    { id: 'redragon-k552', name: 'Redragon K552 Keyboard', image: 'https://placehold.co/400x300.png', inStock: false, stock: 0, rating: 4.4, reviewCount: 155, specs: ['Mechanical', 'Tenkeyless', 'RGB'], dataAiHint: "gaming keyboard" },
  ];
  const newArrivals = [
    { id: 'jbl-quantum-400', name: 'JBL Quantum 400 Headset', image: 'https://placehold.co/400x300.png', inStock: true, stock: 12, rating: 4.6, reviewCount: 45, specs: ['Surround 7.1', 'Wireless', 'RGB'], dataAiHint: "gaming headset" },
    { id: 'acer-nitro-5', name: 'Acer Nitro 5 Laptop', image: 'https://placehold.co/400x300.png', inStock: true, stock: 5, rating: 4.5, reviewCount: 32, specs: ['16GB RAM', 'RTX 4060', '1TB SSD'], dataAiHint: "gaming laptop" },
    { id: 'corsair-vengeance-16gb', name: 'Corsair Vengeance 16GB RAM', image: 'https://placehold.co/400x300.png', inStock: true, stock: 20, rating: 4.7, reviewCount: 60, specs: ['16GB Kit', 'DDR5', '3200MHz'], dataAiHint: "ram module" },
    { id: 'cooler-master-hyper-212', name: 'Cooler Master Hyper 212', image: 'https://placehold.co/400x300.png', inStock: true, stock: 25, rating: 4.7, reviewCount: 190, specs: ['Air Cooler', '4 Heatpipes', 'Quiet Fan'], dataAiHint: "cpu cooler" },
  ];
  const topDeals = [
    { id: 'dell-ultrasharp-27', name: 'Dell UltraSharp 27" Monitor', image: 'https://placehold.co/400x300.png', inStock: true, stock: 3, rating: 4.8, reviewCount: 80, specs: ['27"', '4K IPS', '144Hz'], dataAiHint: "computer monitor" },
    { id: 'hp-pavilion-15', name: 'HP Pavilion 15 Laptop', image: 'https://placehold.co/400x300.png', inStock: true, stock: 6, rating: 4.6, reviewCount: 65, specs: ['Core i5', '512GB SSD', 'Intel Iris Xe'], dataAiHint: "business laptop" },
    { id: 'seagate-1tb-hdd', name: 'Seagate 1TB External HDD', image: 'https://placehold.co/400x300.png', inStock: true, stock: 15, rating: 4.6, reviewCount: 95, specs: ['1TB', 'USB 3.0', 'Portable'], dataAiHint: "hard drive" },
  ];

  return (
    <div className={`min-h-screen bg-[#0c0c1e] text-cyan-100 ${fonts}`}>
      <main className="flex-1">
        <HeroSection />
        <HorizontalScroller products={trendingProducts} title="🔥 Trending Tech" icon={Cpu} viewAllHref="/shop?sort=trending" badge="🔥 Trending" />
        <HorizontalScroller products={newArrivals} title="🚀 New Arrivals" icon={Rocket} viewAllHref="/shop?sort=new" badge="💡 New" />
        <HorizontalScroller products={topDeals} title="💸 Top Deals" icon={Star} viewAllHref="/deals" badge="⚡️ Deal" />
        <FeaturedCategories />
      </main>
      <style jsx global>{`
        body { 
            font-family: 'Space Grotesk', 'Rajdhani', 'Orbitron', monospace; 
            background-color: #0c0c1e;
        }
        .glow-primary { text-shadow: 0 0 8px hsl(var(--primary) / 0.8), 0 0 20px hsl(var(--primary) / 0.4); }
        .glow-accent { text-shadow: 0 0 8px hsl(var(--accent) / 0.9), 0 0 24px hsl(var(--accent) / 0.5); }
        .glass-panel { 
            background: rgba(16, 16, 42, 0.6); 
            backdrop-filter: blur(10px); 
            border: 1px solid hsl(var(--primary) / 0.2); 
        }
        .card-glow:hover { 
            box-shadow: 0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.15);
        }
        .bg-grid-pattern {
            background-image:
                linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px),
                linear-gradient(to right, hsl(var(--primary) / 0.05) 1px, transparent 1px);
            background-size: 30px 30px;
        }
      `}</style>
    </div>
  );
}

    