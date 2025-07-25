
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import AiEnhancer from './ai-enhancer';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addToCart, toggleWishlist } from '@/lib/firestore-service';
import { useState } from 'react';

const mockReviews = [
  { id: 1, author: "Cyber-Explorer", rating: 5, text: "Incredible performance, the AI co-processor is a game changer. Blazing fast delivery to Neo-Sector 7." },
  { id: 2, author: "Data-Weaver", rating: 4, text: "Solid piece of hardware. Runs complex simulations without breaking a sweat. The chassis could be more durable." },
  { id: 3, author: "Grid-Runner", rating: 5, text: "Exceeded all my expectations. The holographic display is crisp and the neural interface is seamless. A must-have for any serious net-runner." },
];


export default function ProductDetailsClient({ product }: { product: Product }) {
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
  
  const handleBuyNow = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Required", description: "Please log in to buy items." });
        router.push('/login');
        return;
    }
    setIsAdding(true);
    const result = await addToCart(user.uid, product.id);
    if (result.success) {
        router.push('/checkout');
    } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
        setIsAdding(false);
    }
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
           <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
             <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <span>Est. Delivery: 3-5 Working Days</span>
             </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>1-Year Warranty</span>
             </div>
           </div>
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
            <CardContent className="p-4 space-y-4">
               <div className="flex gap-4">
                <Button size="lg" className="flex-1 bg-primary/90 hover:bg-primary text-primary-foreground" onClick={handleAddToCart} disabled={isAdding}>
                  <ShoppingCart className="w-5 h-5 mr-2"/>
                  Add to Cart
                </Button>
                <Button size="icon" variant="outline" className="h-auto px-3" onClick={handleToggleWishlist}>
                  <Heart className="w-6 h-6"/>
                </Button>
              </div>
              <Button size="lg" variant="outline" className="w-full" onClick={handleBuyNow} disabled={isAdding}>
                Buy Now
              </Button>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          <AiEnhancer productDescription={product.description} />
        </div>
      </div>

      <Separator className="my-12" />

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 glow-primary">Customer Reviews</h2>
        <div className="space-y-6">
          {mockReviews.map(review => (
            <Card key={review.id} className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex items-center mb-2">
                        <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                            ))}
                        </div>
                        <p className="ml-4 font-bold text-primary">{review.author}</p>
                    </div>
                    <p className="text-muted-foreground">{review.text}</p>
                </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Product Details from {product.brand}</h2>
        <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
      </div>
    </div>
  );
}
