
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import AiEnhancer from './ai-enhancer';
import { Star, ShoppingCart } from 'lucide-react';

export default function ProductDetailsClient({ product }: { product: Product }) {
  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Card className="overflow-hidden border-primary/20">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-auto object-cover"
              data-ai-hint={`${product.category.toLowerCase()} device`}
            />
          </Card>
        </div>
        
        <div>
          {product.featured && <Badge className="mb-2 bg-accent text-accent-foreground">Featured</Badge>}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-2 glow-primary">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < product.rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
              ))}
            </div>
            <span className="text-muted-foreground">({product.rating})</span>
          </div>

          <p className="text-2xl font-bold text-primary mb-4">{product.price.toLocaleString()} {product.currency}</p>
          <p className="text-muted-foreground mb-6">{product.description}</p>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/10 mb-6">
            <CardContent className="p-4">
               <div className="flex gap-4">
                <Button size="lg" className="flex-1 bg-primary/90 hover:bg-primary text-primary-foreground">
                  <ShoppingCart className="w-5 h-5 mr-2"/>
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline" className="flex-1">Buy Now</Button>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          <AiEnhancer productDescription={product.description} />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Product Details from {product.brand}</h2>
        <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
      </div>
    </div>
  );
}
