
"use client";

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Product, Review } from '@/lib/types';
import AiEnhancer from './ai-enhancer';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, CheckCircle, Scale, Send, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addToCart, removeFromCart, toggleWishlist, addReview, getReviewsByProductId, getWishlist, isInCart } from '@/lib/firestore-service';
import { useEffect, useState, useRef, useTransition } from 'react';
import { useCompare } from '@/context/compare-context';
import { Textarea } from '../ui/textarea';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';

export default function ProductDetailsClient({ product, initialReviews }: { product: Product, initialReviews: Review[] }) {
  const [zoomed, setZoomed] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { compareItems, addToCompare, removeFromCompare } = useCompare();
  const [reviews, setReviews] = useState(initialReviews);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [inCart, setInCart] = useState(false);
  const { addRecentlyViewed } = useRecentlyViewed();

  const reviewTextareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (isSubmittingReview && reviewTextareaRef.current) {
      reviewTextareaRef.current.blur();
    }
  }, [isSubmittingReview]);

  useEffect(() => {
    addRecentlyViewed(product.id);
  }, [product.id, addRecentlyViewed]);
  
  useEffect(() => {
    if (user) {
      const checkStatus = async () => {
        const [wishlist, cartStatus] = await Promise.all([
          getWishlist(user.uid),
          isInCart(user.uid, product.id)
        ]);
        setIsInWishlist(wishlist.includes(product.id));
        setInCart(cartStatus);
      };
      checkStatus();
    }
  }, [user, product.id]);

  const isProductInCompare = compareItems.some(item => item.id === product.id);

  const handleToggleCompare = () => {
    if (isProductInCompare) {
      removeFromCompare(product.id);
      toast({ title: 'Removed from Compare', description: `${product.name} has been removed from the comparison list.` });
    } else {
      addToCompare(product);
      toast({ title: 'Added to Compare', description: `${product.name} has been added to the comparison list.` });
    }
  };

  const handleToggleCart = () => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please log in to manage your cart." });
      router.push('/login');
      return;
    }
    startTransition(async () => {
      const result = inCart 
        ? await removeFromCart(user.uid, product.id)
        : await addToCart(user.uid, product.id);
        
      if (result.success) {
        setInCart(!inCart);
        toast({ title: "Success", description: result.message });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    });
  };
  
  const handleBuyNow = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Required", description: "Please log in to buy items." });
        router.push('/login');
        return;
    }
    startTransition(async () => {
      if (!inCart) {
        const result = await addToCart(user.uid, product.id);
        if (result.success) {
          router.push('/checkout');
        } else {
          toast({ variant: "destructive", title: "Error", description: result.message });
        }
      } else {
        router.push('/checkout');
      }
    });
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please log in to manage your wishlist." });
      router.push('/login');
      return;
    }
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
       toast({ variant: "destructive", title: "Authentication Required", description: "You must be logged in to post a review." });
       return;
    }
    if (newReviewRating === 0 || !newReviewText.trim()) {
       toast({ variant: "destructive", title: "Incomplete Review", description: "Please provide a rating and a comment." });
       return;
    }
    
    setIsSubmittingReview(true);
    try {
      const reviewData = {
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        rating: newReviewRating,
        text: newReviewText,
      };
      const result = await addReview(product.id, reviewData);
      if (result.success) {
        const updatedReviews = await getReviewsByProductId(product.id);
        setReviews(updatedReviews as Review[]);
        setNewReviewText('');
        setNewReviewRating(0);
        toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
       toast({ variant: "destructive", title: "Submission Failed", description: error instanceof Error ? error.message : "An unknown error occurred." });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="container py-12" role="main" aria-label="Product Details">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12" aria-live="polite">
        <div>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card className="overflow-hidden glass-panel group relative" tabIndex={0} aria-label={`Image of ${product.name}`}> 
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-auto object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                onClick={() => setZoomed(true)}
                data-ai-hint={`${product.category.toLowerCase()} ${product.subcategory?.toLowerCase() || ''}`}
              />
              {product.stock < 10 && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
                  className="absolute top-4 left-4 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 via-yellow-500 to-red-500 text-white font-bold shadow-lg text-lg animate-pulse border-2 border-accent">
                  <span>Only {product.stock} left!</span>
                </motion.div>
              )}
            </Card>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <span>Est. Delivery: 3-5 Working Days</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>1-Year Warranty</span>
              </motion.div>
            </div>
          </motion.div>
          <AnimatePresence>
            {zoomed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setZoomed(false)}>
                <motion.img src={product.imageUrl} alt={product.name} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="max-w-3xl max-h-[80vh] rounded-xl shadow-2xl border-4 border-accent cursor-zoom-out" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div>
          {product.featured && <Badge className="mb-2 bg-accent text-accent-foreground">Featured</Badge>}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-2 glow-primary" tabIndex={0}>{product.name}</h1>
          <div className="flex items-center gap-2 mb-4" aria-label="Product rating">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
              ))}
            </div>
            <span className="text-muted-foreground">({product.rating} stars / {reviews.length} reviews)</span>
          </div>

          <p className="text-3xl font-bold text-primary mb-4" aria-label="Product price">{product.price.toLocaleString()} {product.currency}</p>
          <p className="text-muted-foreground mb-6" aria-label="Product description">{product.description}</p>
          
          {product.stock < 10 && product.stock > 0 && (
            <p className="text-accent font-bold mb-4">Only {product.stock} left in stock!</p>
          )}

          {product.stock === 0 && (
            <p className="text-red-500 font-bold mb-4">Out of Stock</p>
          )}

          <Card className="glass-panel mb-6" aria-label="Product actions">
            <CardContent className="p-4 space-y-4">
               <div className="flex gap-4">
                <Button size="lg" className={`flex-1 transition-colors ${inCart ? 'bg-green-600 hover:bg-green-700' : 'bg-primary/90 hover:bg-primary'} text-primary-foreground`} onClick={handleToggleCart} disabled={isPending || product.stock === 0} aria-label="Add to cart">
                  {isPending ? <Loader2 className="animate-spin" /> : (
                    inCart ? <><Check className="w-5 h-5 mr-2"/> In Cart</> : <><ShoppingCart className="w-5 h-5 mr-2"/> Add to Cart</>
                  )}
                </Button>
                <Button size="icon" variant="outline" className="h-auto px-3" onClick={handleToggleWishlist} disabled={isPending} aria-label="Toggle wishlist">
                   <Heart className={`w-6 h-6 transition-colors ${isInWishlist ? 'text-red-500 fill-red-500' : ''}`} />
                </Button>
                 <Button size="icon" variant={isProductInCompare ? "secondary" : "outline"} className="h-auto px-3" onClick={handleToggleCompare} aria-label="Toggle compare">
                  <Scale className="w-6 h-6"/>
                </Button>
              </div>
              <Button size="lg" variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground" onClick={handleBuyNow} disabled={isPending || product.stock === 0} aria-label="Buy now">
                {isPending ? <Loader2 className="animate-spin" /> : "Buy Now"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />
        
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div aria-label="Technical Specifications">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h2 className="text-2xl font-bold mb-4 glow-primary" tabIndex={0}>Technical Specifications</h2>
            <Card className="glass-panel">
              <CardContent className="p-6">
                <motion.ul initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }} className="space-y-2 text-muted-foreground">
                  <motion.li variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="flex justify-between"><span>Brand:</span> <strong>{product.brand}</strong></motion.li>
                  <motion.li variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="flex justify-between"><span>Category:</span> <strong>{product.category}</strong></motion.li>
                  {product.subcategory && <motion.li variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="flex justify-between"><span>Sub-Category:</span> <strong>{product.subcategory}</strong></motion.li>}
                  <motion.li variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="flex justify-between"><span>In Stock:</span> <strong className="text-primary">{product.stock > 0 ? 'Yes' : 'No'}</strong></motion.li>
                </motion.ul>
                <Separator className="my-4"/>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="whitespace-pre-line" aria-label="Product technical description">{product.description}</motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <div>
           <AiEnhancer productDescription={product.description} />
        </div>
      </div>

      <Separator className="my-12" />

      <div className="mt-12" aria-label="Customer Reviews">
        <h2 className="text-2xl font-bold mb-6 glow-primary" tabIndex={0}>Customer Reviews & Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6" aria-live="polite">
                {reviews.length > 0 ? reviews.map(review => (
                    <Card key={review.id} className="glass-panel">
                        <CardContent className="p-6">
                            <div className="flex items-center mb-2">
                                <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                    ))}
                                </div>
                                <p className="ml-4 font-bold text-primary">{review.userName}</p>
                                <p className="ml-auto text-xs text-muted-foreground">{new Date(review.timestamp).toLocaleDateString()}</p>
                            </div>
                            <p className="text-muted-foreground">{review.text}</p>
                        </CardContent>
                    </Card>
                )) : (
                    <p className="text-muted-foreground">No reviews yet. Be the first to write one!</p>
                )}
            </div>
            <div>
                <Card className="glass-panel sticky top-24" aria-label="Write a review">
                    <CardHeader>
                        <CardTitle tabIndex={0}>Write a Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleReviewSubmit} className="space-y-4" aria-label="Review form">
                             <div>
                                <label className="mb-2 block font-medium" htmlFor="review-rating">Your Rating</label>
                                <div className="flex items-center gap-1" id="review-rating">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={`w-6 h-6 cursor-pointer transition-colors ${i < newReviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-300'}`}
                                        onClick={() => setNewReviewRating(i + 1)}
                                        aria-label={`Set rating to ${i + 1}`}
                                        tabIndex={0}
                                    />
                                ))}
                                </div>
                             </div>
                            <Textarea 
                                ref={reviewTextareaRef}
                                placeholder="Share your thoughts on this product..."
                                value={newReviewText}
                                onChange={(e) => setNewReviewText(e.target.value)}
                                rows={4}
                                aria-label="Review text"
                            />
                            <Button type="submit" className="w-full" disabled={isSubmittingReview} aria-label="Submit review">
                                <Send className="w-4 h-4 mr-2" />
                                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
