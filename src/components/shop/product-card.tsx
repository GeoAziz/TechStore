
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addToCart, toggleWishlist } from '@/lib/firestore-service';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to add items to your cart.",
      });
      router.push('/login');
      return;
    }
    setIsAdding(true);
    const result = await addToCart(user.uid, product.id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setIsAdding(false);
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to manage your wishlist.",
      });
      router.push('/login');
      return;
    }
    const result = await toggleWishlist(user.uid, product.id);
     if (result.success) {
      toast({ title: "Wishlist Updated", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };


  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 overflow-hidden group card-glow flex flex-col">
       <div className="relative">
        <Link href={`/product/${product.id}`} className="block">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={400}
              height={400}
              className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={`${product.category.toLowerCase()} electronics`}
            />
        </Link>
        {product.featured && <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">Featured</Badge>}
        <Button size="icon" variant="ghost" className="absolute top-2 right-2 bg-background/50 backdrop-blur-sm hover:bg-primary/20 hover:text-primary rounded-full" onClick={handleToggleWishlist}>
            <Heart className="w-5 h-5" />
        </Button>
      </div>
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
          <Button size="icon" variant="ghost" className="hover:bg-primary/20 hover:text-primary" onClick={handleAddToCart} disabled={isAdding}>
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
