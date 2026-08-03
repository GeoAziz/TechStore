"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ShoppingCart, Heart, Star, Scale, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addToCart, removeFromCart, toggleWishlist, getWishlist } from '@/lib/firestore-service';
import { useState, useEffect, useTransition } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useCompare } from '@/context/compare-context';
import { useCart } from '@/context/cart-context';

function use3DTilt(max = 18) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [0, 1], [max, -max]);
  const rotateY = useTransform(x, [0, 1], [-max, max]);
  return { x, y, rotateX, rotateY };
}

type CardProps = {
  product: Product;
  inCart: boolean;
  isInWishlist: boolean;
  isProductInCompare: boolean;
  isPending: boolean;
  showLowStock: boolean;
  showTrending: boolean;
  handleToggleCart: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleToggleWishlist: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleToggleCompare: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

function ProductCardGrid(props: CardProps) {
  const { x, y, rotateX, rotateY } = use3DTilt();
  const { product } = props;

  return (
    <motion.div
      whileHover={{ scale: 1.06, boxShadow: '0 0 24px hsl(var(--primary) / 0.5)' }}
      style={{ perspective: 900 }}
      className="relative"
      onMouseMove={e => {
        const card = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - card.left) / card.width);
        y.set((e.clientY - card.top) / card.height);
      }}
      onMouseLeave={() => { x.set(0.5); y.set(0.5); }}
    >
      <motion.div style={{ rotateX, rotateY }} className="h-full">
        <Card className="glass-panel overflow-hidden group card-glow h-full flex flex-col border border-cyan-400/20 shadow-[0_0_24px_#00fff733] transition-all font-[Orbitron,Space Grotesk,monospace]">
          <Link href={`/product/${product.id}`} className="block">
            <div className="relative">
              <Image src={product.imageUrl} alt={product.name} width={400} height={300} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={`${product.category.toLowerCase()} device`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 opacity-30 group-hover:opacity-60 transition-opacity"></div>
              {props.showTrending && (
                <motion.div className="absolute top-2 left-2" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Badge className="bg-cyan-400/90 text-black animate-pulse shadow-[0_0_8px_#00fff7]">{product.promoTag || 'Trending'}</Badge>
                </motion.div>
              )}
              {props.showLowStock && !props.showTrending && (
                <motion.div className="absolute top-2 right-2" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}>
                  <Badge className="bg-pink-600/90 text-white animate-pulse shadow-[0_0_8px_#ff00c8]">Low Stock</Badge>
                </motion.div>
              )}
              {product.stock === 0 && (
                <motion.div className="absolute top-2 right-2" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}>
                  <Badge variant="destructive" className="bg-red-700/90 text-white shadow-[0_0_8px_#ff0000]">Out of Stock</Badge>
                </motion.div>
              )}
            </div>
          </Link>
          <CardContent className="p-4 flex flex-col flex-grow">
            <div className='flex-grow'>
              <p className="text-xs text-muted-foreground">{product.category}</p>
              <h3 className="text-base font-bold group-hover:text-primary transition-colors font-headline">
                <Link href={`/product/${product.id}`}>{product.name}</Link>
              </h3>
              <div className="flex items-center gap-1 my-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${product.averageRating && i < product.averageRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                ))}
                <span className="text-xs text-muted-foreground ml-1">({product.averageRating})</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <p className="text-lg font-bold text-primary">{product.price.toLocaleString()} {product.currency}</p>
              <Button variant="ghost" size="icon" onClick={props.handleToggleCart} disabled={props.isPending || product.stock === 0} className="w-9 h-9" aria-label={props.inCart ? 'Remove from cart' : 'Add to cart'}>
                {props.isPending ? <Loader2 className="animate-spin" /> : props.inCart ? <Check className="text-green-500" /> : <ShoppingCart className="w-5 h-5" />}
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant={props.isProductInCompare ? "secondary" : "outline"} size="sm" className="w-full" onClick={props.handleToggleCompare}>
                <Scale className="w-4 h-4 mr-2" /> {props.isProductInCompare ? 'Comparing' : 'Compare'}
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={props.handleToggleWishlist} disabled={props.isPending}>
                <Heart className={`w-4 h-4 mr-2 transition-all ${props.isInWishlist ? 'text-red-500 fill-red-500' : ''}`} /> Wishlist
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function ProductCardList(props: CardProps) {
  const { product } = props;

  return (
    <motion.div whileHover={{ scale: 1.02, boxShadow: '0 0 32px #00fff733' }} transition={{ type: 'spring', stiffness: 180 }} className="h-full">
      <Card className="glass-panel overflow-hidden group card-glow flex flex-col sm:flex-row h-full border border-cyan-400/20 shadow-[0_0_24px_#00fff733]">
        <Link href={`/product/${product.id}`} className="block sm:w-1/3 relative">
          <Image src={product.imageUrl} alt={product.name} width={400} height={400} className="w-full h-48 sm:h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={`${product.category.toLowerCase()} electronics`} />
          {props.showTrending && (
            <motion.div className="absolute top-2 left-2" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Badge className="bg-cyan-400/90 text-black animate-pulse shadow-[0_0_8px_#00fff7]">Trending</Badge>
            </motion.div>
          )}
          {props.showLowStock && (
            <motion.div className="absolute top-2 right-2" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}>
              <Badge className="bg-pink-600/90 text-white animate-pulse shadow-[0_0_8px_#ff00c8]">Low Stock</Badge>
            </motion.div>
          )}
        </Link>
        <CardContent className="p-4 flex flex-col flex-grow sm:w-2/3">
          <div className='flex-grow'>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${product.averageRating && i < product.averageRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
              ))}
              <span className="text-muted-foreground text-sm">({product.averageRating})</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
          </div>
          <div className="flex justify-between items-end mt-4">
            <p className="text-xl font-bold text-primary">
              {product.price.toLocaleString()} <span className="text-sm font-normal">{product.currency}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="w-8 h-8" onClick={props.handleToggleWishlist} title="Add to Wishlist">
                <Heart className={`w-4 h-4 transition-all ${props.isInWishlist ? 'text-red-500 fill-red-500' : ''}`} />
              </Button>
              <Button variant={props.isProductInCompare ? "secondary" : "outline"} size="icon" className="w-8 h-8" onClick={props.handleToggleCompare} title="Compare">
                <Scale className="w-4 h-4" />
              </Button>
              <Button size="sm" className={`min-w-[90px] ${props.inCart ? 'bg-green-600 hover:bg-green-700' : 'bg-primary/80 hover:bg-primary'} text-primary-foreground`} onClick={props.handleToggleCart} disabled={props.isPending}>
                {props.isPending ? <Loader2 className="animate-spin" /> : props.inCart ? <><Check className="mr-2"/> In Cart</> : <><ShoppingCart className="w-4 h-4 mr-2" /> Cart</>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ProductCard({ product, viewMode = 'grid' }: { product: Product, viewMode?: 'grid' | 'list' }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { compareItems, addToCompare, removeFromCompare } = useCompare();
  const { cartItems } = useCart();

  const inCart = cartItems.some(item => item.productId === product.id);

  useEffect(() => {
    if (user) {
      getWishlist(user.uid).then(ids => setIsInWishlist(ids.includes(product.id))).catch(() => {});
    }
  }, [user, product.id]);

  const isProductInCompare = compareItems.some(item => item.id === product.id);

  const handleToggleCompare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProductInCompare) {
      removeFromCompare(product.id);
      toast({ title: 'Removed from Compare' });
    } else {
      addToCompare(product);
      toast({ title: 'Added to Compare' });
    }
  };

  const handleToggleCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push('/login'); return; }
    startTransition(async () => {
      const result = inCart
        ? await removeFromCart(user.uid, product.id)
        : await addToCart(user.uid, product.id);
      if (!result.success) {
        toast({ variant: 'destructive', title: "Error", description: result.message });
      } else {
        toast({ title: inCart ? "Removed from cart" : "Added to cart" });
      }
    });
  };

  const handleToggleWishlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push('/login'); return; }
    startTransition(async () => {
      const result = await toggleWishlist(user.uid, product.id);
      if (result.success) {
        setIsInWishlist(prev => !prev);
        toast({ title: "Wishlist Updated", description: result.message });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    });
  };

  const showLowStock = product.stock > 0 && product.stock < 8;
  const showTrending = product.promoTag?.toLowerCase().includes('trend') || (product.averageRating && product.averageRating >= 4.7);

  const sharedProps: CardProps = {
    product, inCart, isInWishlist, isProductInCompare, isPending,
    showLowStock, showTrending: !!showTrending,
    handleToggleCart, handleToggleWishlist, handleToggleCompare,
  };

  if (viewMode === 'list') {
    return <ProductCardList {...sharedProps} />;
  }

  return <ProductCardGrid {...sharedProps} />;
}
