"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { products } from '@/lib/mock-data'; // We'll use mock data for component selection for now
import type { Product } from '@/lib/types';
import { Cpu, MemoryStick, HardDrive, CircuitBoard, Power, Wind, CheckCircle, PackagePlus, DollarSign } from 'lucide-react';
import Link from 'next/link';

const componentCategories = [
  { name: 'Processors', icon: Cpu },
  { name: 'Graphic Cards', icon: MemoryStick },
  { name: 'RAM Modules', icon: CircuitBoard },
  { name: 'Storage Drives', icon: HardDrive },
  { name: 'Power Supplies', icon: Power },
  { name: 'Coolers/Fans', icon: Wind },
];

type Selections = {
  [key: string]: Product | null;
};

export default function CustomizerPage() {
  const [selections, setSelections] = useState<Selections>({});

  const handleSelect = (category: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelections(prev => ({
      ...prev,
      [category]: product || null,
    }));
  };

  const totalCost = Object.values(selections).reduce((acc, product) => {
    return acc + (product ? product.price : 0);
  }, 0);

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold tracking-tighter mb-2 glow-primary">PC Customizer</h1>
      <p className="text-muted-foreground mb-8">Build your dream rig by selecting components below.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {componentCategories.map(({ name, icon: Icon }) => {
            const categoryProducts = products.filter(p => p.category === name);
            return (
              <Card key={name} className="bg-card/50 backdrop-blur-sm border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-primary" />
                    <span>Select a {name.slice(0, -1)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={(value) => handleSelect(name, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a component..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryProducts.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.price.toLocaleString()} {product.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {Object.entries(selections).map(([category, product]) => {
                    if (!product) return null;
                    return (
                      <div key={category} className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-muted-foreground">{category.slice(0, -1)}:</span>
                        <span className="text-right">{product.name}</span>
                      </div>
                    );
                  })}
                 </div>
                 <Separator className="my-4 bg-accent/20" />
                 <div className="space-y-2">
                    <div className="flex justify-between items-center font-bold text-lg">
                       <span className="flex items-center gap-2"><DollarSign className="w-5 h-5"/> Total Cost:</span>
                       <span className="text-accent">{totalCost.toLocaleString()} KES</span>
                    </div>
                 </div>
                 <Button size="lg" className="w-full mt-6" disabled={totalCost === 0}>
                    Add Build to Cart
                 </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
