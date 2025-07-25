
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Product, Review } from '@/lib/types';
import AiEnhancer from './ai-enhancer';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, CheckCircle, Scale, Send } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addToCart, toggleWishlist, addReview, getReviewsByProductId } from '@/lib/firestore-service';
import { useEffect, useState, useRef } from 'react';
import { useCompare } from '@/context/compare-context';
import { Textarea } from '../ui/textarea';

export default function ProductDetailsClient({ product, initialReviews }: { product: Product, initialReviews: Review[] }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const { compareItems, addToCompare, removeFromCompare } = useCompare();
  const [reviews, setReviews] = useState(initialReviews);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Accessibility: Focus management for review form
  const reviewTextareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (isSubmittingReview && reviewTextareaRef.current) {
      reviewTextareaRef.current.blur();
    }
  }, [isSubmittingReview]);

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
        // Optimistically update UI, or refetch
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
          <Card className="overflow-hidden glass-panel" tabIndex={0} aria-label={`Image of ${product.name}`}>
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
          
          {product.stock < 10 && (
            <p className="text-accent font-bold mb-4">Only {product.stock} left in stock!</p>
          )}

          <Card className="glass-panel mb-6" aria-label="Product actions">
            <CardContent className="p-4 space-y-4">
               <div className="flex gap-4">
                <Button size="lg" className="flex-1 bg-primary/90 hover:bg-primary text-primary-foreground" onClick={handleAddToCart} disabled={isAdding} aria-label="Add to cart">
                  <ShoppingCart className="w-5 h-5 mr-2"/>
                  Add to Cart
                </Button>
                <Button size="icon" variant="outline" className="h-auto px-3" onClick={handleToggleWishlist} aria-label="Toggle wishlist">
                  <Heart className="w-6 h-6"/>
                </Button>
                 <Button size="icon" variant={isProductInCompare ? "secondary" : "outline"} className="h-auto px-3" onClick={handleToggleCompare} aria-label="Toggle compare">
                  <Scale className="w-6 h-6"/>
                </Button>
              </div>
              <Button size="lg" variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground" onClick={handleBuyNow} disabled={isAdding} aria-label="Buy now">
                Buy Now
              </Button>
            </CardContent>
          </Card>

          <Separator className="my-6" />

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

      <div className="mt-12" aria-label="Technical Specifications">
        <h2 className="text-2xl font-bold mb-4 glow-primary" tabIndex={0}>Technical Specifications</h2>
        <Card className="glass-panel">
          <CardContent className="p-6">
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex justify-between"><span>Brand:</span> <strong>{product.brand}</strong></li>
              <li className="flex justify-between"><span>Category:</span> <strong>{product.category}</strong></li>
              {product.subcategory && <li className="flex justify-between"><span>Sub-Category:</span> <strong>{product.subcategory}</strong></li>}
              <li className="flex justify-between"><span>In Stock:</span> <strong className="text-primary">{product.stock > 0 ? 'Yes' : 'No'}</strong></li>
            </ul>
             <Separator className="my-4"/>
            <p className="whitespace-pre-line" aria-label="Product technical description">{product.description}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
