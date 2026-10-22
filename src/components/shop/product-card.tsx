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
import { tracker } from '@/lib/analytics/tracker';

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
  const { x, y, rotateX, rotateY } = use3DTilt(10);
  const { product } = props;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={{ perspective: 900 }}
      className="relative h-full"
      onMouseMove={e => {
        const card = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - card.left) / card.width);
        y.set((e.clientY - card.top) / card.height);
      }}
      onMouseLeave={() => { x.set(0.5); y.set(0.5); }}
    >
      <motion.div style={{ rotateX, rotateY }} className="h-full">
        <Card className="overflow-hidden group h-full flex flex-col bg-card border border-border hover:border-lime-400/40 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 backdrop-blur-md">
          <Link href={`/product/${product.id}`} className="block relative overflow-hidden">
            <div className="relative w-full h-48 bg-muted/40 dark:bg-black/40 flex items-center justify-center p-3">
              <Image 
                src={product.imageUrl} 
                alt={product.name} 
                width={400} 
                height={300} 
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" 
                data-ai-hint={`${product.category.toLowerCase()} device`} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60"></div>
              {props.showTrending && (
                <div className="absolute top-2.5 left-2.5">
                  <Badge className="bg-[#bef264] text-black font-extrabold text-[10px] tracking-wider uppercase shadow-[0_0_10px_rgba(190,242,100,0.4)]">
                    {product.promoTag || 'Trending'}
                  </Badge>
                </div>
              )}
              {props.showLowStock && !props.showTrending && (
                <div className="absolute top-2.5 right-2.5">
                  <Badge className="bg-amber-500/90 text-black font-bold text-[10px]">Low Stock</Badge>
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute top-2.5 right-2.5">
                  <Badge variant="destructive" className="bg-red-600/90 text-white font-bold text-[10px]">Out of Stock</Badge>
                </div>
              )}
            </div>
          </Link>
          <CardContent className="p-4 flex flex-col flex-grow justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{product.category}</p>
              <h3 className="text-sm font-bold text-foreground group-hover:text-lime-600 dark:group-hover:text-lime-300 transition-colors line-clamp-1 mt-0.5">
                <Link href={`/product/${product.id}`}>{product.name}</Link>
              </h3>
              <div className="flex items-center gap-1 my-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${product.averageRating && i < product.averageRating ? 'text-[#bef264] fill-[#bef264]' : 'text-muted-foreground/30'}`} />
                ))}
                <span className="text-[11px] text-muted-foreground ml-1">({product.averageRating || '5.0'})</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border mt-2">
              <div className="flex justify-between items-center mb-2.5">
                <div>
                  <span className="text-xs text-muted-foreground font-mono">KES </span>
                  <span className="text-base font-extrabold text-lime-600 dark:text-[#bef264] font-mono">
                    {product.price.toLocaleString()}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={props.handleToggleCart} 
                  disabled={props.isPending || product.stock === 0} 
                  className="w-8 h-8 rounded-full bg-secondary/80 hover:bg-[#bef264] hover:text-black border border-border transition-colors" 
                  aria-label={props.inCart ? 'Remove from cart' : 'Add to cart'}
                >
                  {props.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : props.inCart ? <Check className="w-3.5 h-3.5 text-lime-500" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant={props.isProductInCompare ? "secondary" : "outline"} 
                  size="sm" 
                  className="w-full h-7 text-xs rounded-lg border-border hover:border-lime-400/40" 
                  onClick={props.handleToggleCompare}
                >
                  <Scale className="w-3 h-3 mr-1" /> {props.isProductInCompare ? 'Comparing' : 'Compare'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-7 text-xs rounded-lg border-border hover:border-lime-400/40" 
                  onClick={props.handleToggleWishlist} 
                  disabled={props.isPending}
                >
                  <Heart className={`w-3 h-3 mr-1 transition-all ${props.isInWishlist ? 'text-pink-500 fill-pink-500' : ''}`} /> Saved
                </Button>
              </div>
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
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="h-full">
      <Card className="overflow-hidden group flex flex-col sm:flex-row h-full bg-card border border-border hover:border-lime-400/40 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <Link href={`/product/${product.id}`} className="block sm:w-1/3 relative bg-muted/40 dark:bg-black/40 p-4 flex items-center justify-center">
          <Image src={product.imageUrl} alt={product.name} width={400} height={400} className="w-full h-44 object-contain transition-transform duration-300 group-hover:scale-105" data-ai-hint={`${product.category.toLowerCase()} electronics`} />
          {props.showTrending && (
            <div className="absolute top-2.5 left-2.5">
              <Badge className="bg-[#bef264] text-black font-extrabold text-[10px] uppercase shadow-[0_0_10px_rgba(190,242,100,0.4)]">Trending</Badge>
            </div>
          )}
          {props.showLowStock && (
            <div className="absolute top-2.5 right-2.5">
              <Badge className="bg-amber-500/90 text-black font-bold text-[10px]">Low Stock</Badge>
            </div>
          )}
        </Link>
        <CardContent className="p-4 sm:p-6 flex flex-col flex-grow sm:w-2/3 justify-between">
          <div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${product.averageRating && i < product.averageRating ? 'text-[#bef264] fill-[#bef264]' : 'text-muted-foreground/30'}`} />
              ))}
              <span className="text-muted-foreground text-xs ml-1">({product.averageRating || '5.0'})</span>
            </div>
            <h3 className="text-base font-bold text-foreground group-hover:text-lime-600 dark:group-hover:text-lime-300 transition-colors mt-1">
              <Link href={`/product/${product.id}`}>{product.name}</Link>
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
          </div>
          <div className="flex justify-between items-end mt-4 pt-3 border-t border-border">
            <div>
              <span className="text-xs text-muted-foreground font-mono">KES </span>
              <span className="text-xl font-extrabold text-lime-600 dark:text-[#bef264] font-mono">
                {product.price.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="w-8 h-8 rounded-full border-border" onClick={props.handleToggleWishlist} title="Add to Wishlist">
                <Heart className={`w-3.5 h-3.5 transition-all ${props.isInWishlist ? 'text-pink-500 fill-pink-500' : ''}`} />
              </Button>
              <Button variant={props.isProductInCompare ? "secondary" : "outline"} size="icon" className="w-8 h-8 rounded-full border-border" onClick={props.handleToggleCompare} title="Compare">
                <Scale className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" className={`h-8 rounded-full px-4 text-xs font-bold ${props.inCart ? 'bg-lime-500 text-black' : 'bg-[#bef264] hover:bg-lime-300 text-black'}`} onClick={props.handleToggleCart} disabled={props.isPending}>
                {props.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : props.inCart ? <><Check className="mr-1 w-3.5 h-3.5"/> In Cart</> : <><ShoppingCart className="w-3.5 h-3.5 mr-1" /> Add to Cart</>}
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
        if (!inCart) {
          tracker.track({
            event: 'add_to_cart',
            currency: (product.currency as any) || 'KES',
            value: product.price,
            items: [
              {
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                quantity: 1,
                item_category: product.category,
                item_brand: product.brand,
              },
            ],
          });
        } else {
          tracker.track({
            event: 'remove_from_cart',
            currency: (product.currency as any) || 'KES',
            value: product.price,
            items: [
              {
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                quantity: 1,
                item_category: product.category,
                item_brand: product.brand,
              },
            ],
          });
        }
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
