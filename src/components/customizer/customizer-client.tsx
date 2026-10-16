"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product } from '@/lib/types';
import { Cpu, MemoryStick, HardDrive, CircuitBoard, Power, Wind, PackagePlus, DollarSign, Loader2, Check } from 'lucide-react';
import { addToCart } from '@/lib/firestore-service';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const componentCategories = [
  { name: 'Processors', label: 'Processor', icon: Cpu },
  { name: 'Graphic Cards', label: 'Graphics Card', icon: MemoryStick },
  { name: 'RAM Modules', label: 'RAM Module', icon: CircuitBoard },
  { name: 'Storage Drives', label: 'Storage Drive', icon: HardDrive },
  { name: 'Power Supplies', label: 'Power Supply', icon: Power },
  { name: 'Coolers/Fans', label: 'Cooler / Fan', icon: Wind },
  { name: 'Motherboards', label: 'Motherboard', icon: CircuitBoard },
];

type Selections = {
  [key: string]: Product | null;
};

export default function CustomizerClient({ products }: { products: Product[] }) {
  const [selections, setSelections] = useState<Selections>({});
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSelect = (categoryName: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelections(prev => ({
      ...prev,
      [categoryName]: product || null,
    }));
  };

  const totalCost = Object.values(selections).reduce((acc, product) => {
    return acc + (product ? product.price : 0);
  }, 0);

  const selectedProducts = Object.values(selections).filter(Boolean) as Product[];

  const handleAddBuildToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add your custom PC build to the cart.",
      });
      router.push('/login?redirect=/customizer');
      return;
    }

    if (selectedProducts.length === 0) return;

    setIsAdding(true);
    let successCount = 0;

    for (const prod of selectedProducts) {
      try {
        const res = await addToCart(user.uid, prod.id);
        if (res.success) successCount++;
      } catch (err) {
        console.error(`Failed to add ${prod.name} to cart:`, err);
      }
    }

    setIsAdding(false);

    if (successCount > 0) {
      toast({
        title: "Build Added to Cart!",
        description: `Successfully added ${successCount} components to your cart.`,
      });
      router.push('/checkout');
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add all components to cart. Please try again.",
      });
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold tracking-tighter mb-2 glow-primary">PC Customizer</h1>
      <p className="text-muted-foreground mb-8">
        Build your dream rig by selecting real components from our catalog.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {componentCategories.map(({ name, label, icon: Icon }) => {
            const categoryProducts = products.filter(
              p => p.category?.toLowerCase() === name.toLowerCase() ||
                   p.subcategory?.toLowerCase() === name.toLowerCase()
            );

            return (
              <Card key={name} className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-primary" />
                    <span>Select a {label}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryProducts.length > 0 ? (
                    <Select onValueChange={(value) => handleSelect(name, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Choose ${label.toLowerCase()}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryProducts.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} — KES {product.price.toLocaleString()} ({product.brand})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-xs text-muted-foreground italic py-2">
                      No components currently listed under {name} in the live catalog.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 bg-card/50 backdrop-blur-sm border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-accent glow-accent">
                <PackagePlus className="w-6 h-6" />
                Build Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No components selected yet.</p>
                ) : (
                  Object.entries(selections).map(([category, product]) => {
                    if (!product) return null;
                    return (
                      <div key={category} className="flex justify-between items-center text-sm gap-2">
                        <span className="font-semibold text-muted-foreground shrink-0">{category}:</span>
                        <span className="text-right truncate text-cyan-200" title={product.name}>
                          {product.name}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              <Separator className="my-4 bg-accent/20" />
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-accent" /> Total Cost:
                  </span>
                  <span className="text-accent">KES {totalCost.toLocaleString()}</span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full mt-6"
                disabled={totalCost === 0 || isAdding}
                onClick={handleAddBuildToCart}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding to Cart...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Add Build to Cart
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

