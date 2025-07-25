
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 overflow-hidden group card-glow flex flex-col">
      <Link href={`/product/${product.id}`} className="flex-grow">
        <div className="relative">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={`${product.category.toLowerCase()} electronics`}
          />
          {product.featured && <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">Featured</Badge>}
        </div>
      </Link>
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className='flex-grow'>
          <p className="text-xs text-muted-foreground">{product.category}</p>
          <h3 className="text-lg font-bold truncate h-14">
            <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">{product.name}</Link>
          </h3>
          <p className="text-sm text-muted-foreground h-10">{product.description.substring(0, 50)}...</p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-xl font-bold text-primary">{product.price.toLocaleString()} <span className="text-sm font-normal">{product.currency}</span></p>
          <Button size="icon" variant="ghost" className="hover:bg-primary/20 hover:text-primary">
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
