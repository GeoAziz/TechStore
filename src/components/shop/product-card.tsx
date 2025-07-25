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
  const [showSpecs, setShowSpecs] = useState(false);

  // Fix: Product type extension for badges and specs
  type ExtendedProduct = Product & {
    badges?: string[];
    specs?: string[];
    promoTag?: string;
  };
  const extendedProduct = product as ExtendedProduct;

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
      <motion.div
        whileHover={{ y: -5, scale: 1.04, boxShadow: '0 0 32px #7DF9FF, 0 0 8px #9F00FF', rotateY: 8 }}
        whileTap={{ scale: 0.98, rotateY: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="h-full"
      >
        <Card className="glass-panel overflow-hidden group card-glow flex flex-col sm:flex-row h-full neon-glow">
          <Link href={`/product/${product.id}`} className="block sm:w-1/3">
            <motion.div
              className="relative h-full"
              whileHover={{ scale: 1.08, rotateY: 10 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={`${product.category.toLowerCase()} electronics`}
                style={{ transform: 'perspective(600px) rotateY(6deg)' }}
              />
              {extendedProduct.promoTag && <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground animate-bounce">{extendedProduct.promoTag}</Badge>}
              {product.featured && <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground animate-pulse">Featured</Badge>}
            </motion.div>
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
                    <Star key={i} className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-yellow-400 neon-glow' : 'text-muted-foreground'}`} />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">({product.rating})</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
            </div>
            <div className="flex justify-between items-end mt-4">
              <motion.p
                className="text-xl font-bold text-primary"
                whileHover={{ scale: 1.08, color: '#7DF9FF' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {product.price.toLocaleString()} <span className="text-sm font-normal">{product.currency}</span>
              </motion.p>
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.15 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Button variant="outline" size="sm" onClick={handleToggleWishlist}>
                    <Heart className="w-4 h-4 neon-glow" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.15 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Button variant={isProductInCompare ? "secondary" : "outline"} size="sm" onClick={handleToggleCompare}>
                    <Scale className="w-4 h-4 neon-glow" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.15 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Button size="sm" className="bg-primary/80 hover:bg-primary text-primary-foreground neon-glow" onClick={handleAddToCart} disabled={isAdding}>
                    <ShoppingCart className="w-4 h-4 mr-2" /> Cart
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="relative bg-glass rounded-xl shadow-neon card-glow hover:card-glow transition-all duration-300 p-4 flex flex-col gap-2"
      whileHover={{ scale: 1.06, boxShadow: "0 0 40px #7DF9FF, 0 0 12px #9F00FF", rotateY: 10 }}
      whileTap={{ scale: 0.98, rotateY: 0 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <div className="absolute top-2 right-2 flex gap-2">
        {extendedProduct.badges?.map((badge: string) => (
          <motion.span
            key={badge}
            className="badge badge-glow animate-pulse"
            whileHover={{ scale: 1.2, rotate: 8 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {badge}
          </motion.span>
        ))}
        {product.featured && <motion.div whileHover={{ scale: 1.2, rotate: 8 }} transition={{ type: 'spring', stiffness: 300 }}><Badge variant={undefined}>Featured</Badge></motion.div>}
        {isProductInCompare && <motion.div whileHover={{ scale: 1.2, rotate: 8 }} transition={{ type: 'spring', stiffness: 300 }}><Badge variant={undefined}>Compare</Badge></motion.div>}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.img
          src={product.imageUrl}
          alt={product.name}
          className="w-32 h-32 object-contain mb-2 rounded-lg shadow-md group-hover:shadow-neon"
          whileHover={{ scale: 1.12, rotateY: 14, boxShadow: "0 0 32px #7DF9FF" }}
          transition={{ type: "spring", stiffness: 320 }}
          loading="lazy"
          initial={{ filter: 'blur(6px)' }}
          animate={{ filter: 'blur(0px)' }}
        />
        <motion.div
          className="text-lg font-space-mono text-neon-blue mb-1"
          whileHover={{ scale: 1.08, color: '#7DF9FF' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {product.name}
        </motion.div>
        <motion.div
          className="text-xs text-neon-violet mb-1"
          whileHover={{ scale: 1.08, color: '#9F00FF' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {product.brand}
        </motion.div>
        <motion.div
          className="text-sm font-bold text-primary"
          whileHover={{ scale: 1.08, color: '#7DF9FF' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          KES {product.price}
        </motion.div>
      </div>
      <div className="flex gap-2 mt-2">
        <Button size="sm" variant={undefined} onClick={handleAddToCart} disabled={isAdding}>Add to Cart</Button>
        <Button size="sm" variant={isProductInCompare ? undefined : "ghost"} onClick={handleToggleCompare}>
          {isProductInCompare ? "Remove" : "Compare"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowSpecs(!showSpecs)}>
          {showSpecs ? "Hide Specs" : "Show Specs"}
        </Button>
      </div>
      {showSpecs && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mt-4 p-2 bg-slate-900 bg-opacity-80 rounded-lg text-xs text-white"
        >
          <ul>
            {extendedProduct.specs?.map((spec: string, idx: number) => (
              <li key={idx}>{spec}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}
