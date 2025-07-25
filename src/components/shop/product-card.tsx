
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ShoppingCart, Heart, Eye, Star, Scale } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addToCart, toggleWishlist } from '@/lib/firestore-service';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCompare } from '@/context/compare-context';

export default function ProductCard({ product, viewMode = 'grid' }: { product: Product, viewMode?: 'grid' | 'list' }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const { compareItems, addToCompare, removeFromCompare } = useCompare();

  const isProductInCompare = compareItems.some(item => item.id === product.id);

  const handleToggleCompare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isProductInCompare) {
      removeFromCompare(product.id);
      toast({ title: 'Removed from Compare' });
    } else {
      addToCompare(product);
      toast({ title: 'Added to Compare' });
    }
  };

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
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

  const handleToggleWishlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
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

  if (viewMode === 'list') {
    return (
        <Card className="glass-panel overflow-hidden group card-glow flex flex-col sm:flex-row h-full">
            <Link href={`/product/${product.id}`} className="block sm:w-1/3 relative">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-48 sm:h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={`${product.category.toLowerCase()} electronics`}
                />
                {product.promoTag && <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground animate-pulse">{product.promoTag}</Badge>}
            </Link>
            <CardContent className="p-4 flex flex-col flex-grow sm:w-2/3">
                <div className='flex-grow'>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors font-headline">
                        <Link href={`/product/${product.id}`}>{product.name}</Link>
                    </h3>
                    <div className="flex items-center gap-2 my-2">
                        <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i: number) => (
                            <Star key={i} className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                        ))}
                        </div>
                        <span className="text-muted-foreground text-sm">({product.rating})</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                </div>
                <div className="flex justify-between items-end mt-4">
                    <p className="text-xl font-bold text-primary">
                        {product.price.toLocaleString()} <span className="text-sm font-normal">{product.currency}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="w-8 h-8" onClick={handleToggleWishlist} title="Add to Wishlist">
                            <Heart className="w-4 h-4" />
                        </Button>
                        <Button variant={isProductInCompare ? "secondary" : "outline"} size="icon" className="w-8 h-8" onClick={handleToggleCompare} title="Compare">
                            <Scale className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="bg-primary/80 hover:bg-primary text-primary-foreground" onClick={handleAddToCart} disabled={isAdding}>
                            <ShoppingCart className="w-4 h-4 mr-2" /> Cart
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
  }

  // Grid view
  return (
    <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300 }}
    >
    <Card className="glass-panel overflow-hidden group card-glow h-full flex flex-col">
        <Link href={`/product/${product.id}`} className="block">
            <div className="relative">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={`${product.category.toLowerCase()} device`}
                />
                 {product.promoTag && <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground animate-pulse">{product.promoTag}</Badge>}
            </div>
        </Link>
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className='flex-grow'>
            <p className="text-xs text-muted-foreground">{product.category}</p>
            <h3 className="text-base font-bold group-hover:text-primary transition-colors">
                 <Link href={`/product/${product.id}`}>{product.name}</Link>
            </h3>
             <div className="flex items-center gap-1 my-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                ))}
                <span className="text-xs text-muted-foreground ml-1">({product.rating})</span>
            </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
            <p className="text-lg font-bold text-primary">{product.price.toLocaleString()} {product.currency}</p>
            <Button variant="ghost" size="icon" onClick={handleAddToCart} disabled={isAdding} className="w-9 h-9">
                <ShoppingCart className="w-5 h-5"/>
            </Button>
        </div>
        <div className="flex gap-2 mt-2">
             <Button variant={isProductInCompare ? "secondary" : "outline"} size="sm" className="w-full" onClick={handleToggleCompare}>
                <Scale className="w-4 h-4 mr-2" /> {isProductInCompare ? 'Comparing' : 'Compare'}
            </Button>
             <Button variant="outline" size="sm" className="w-full" onClick={handleToggleWishlist}>
                <Heart className="w-4 h-4 mr-2"/> Wishlist
            </Button>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}

    