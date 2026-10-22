"use client";

import React from 'react';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Product, Review } from '@/lib/types';
import AiEnhancer from './ai-enhancer';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, Scale, Send, Loader2, Check, Lock, RotateCcw, Award, Zap, Sparkles, HelpCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addToCart, removeFromCart, toggleWishlist, addReview, getReviewsByProductId, getWishlist, isInCart } from '@/lib/firestore-service';
import { useEffect, useState, useRef, useTransition } from 'react';
import { useCompare } from '@/context/compare-context';
import { Textarea } from '../ui/textarea';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ProductCard from '@/components/shop/product-card';
import { tracker } from '@/lib/analytics/tracker';

interface ProductDetailsProps {
  product: Product;
  initialReviews: Review[];
  relatedProducts?: Product[];
}

export default function ProductDetailsClient({ product, initialReviews, relatedProducts = [] }: ProductDetailsProps) {
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

  // Multi-image gallery support with labeled views
  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.imageUrl];

  const galleryLabels = ['Main view', 'Angle view', 'Detail view', 'Package'];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const activeImage = galleryImages[selectedImageIndex] || product.imageUrl;

  // Strikethrough price calculation if discount exists or simulated original price
  const discount = product.discountPercent || (product.promoTag?.includes('%') ? parseInt(product.promoTag) : 0);
  const originalPrice = discount > 0 ? Math.round(product.price / (1 - discount / 100)) : (product.price > 1000 ? Math.round(product.price * 1.25) : null);
  const savingsAmount = originalPrice ? originalPrice - product.price : 0;

  const reviewTextareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (isSubmittingReview && reviewTextareaRef.current) {
      reviewTextareaRef.current.blur();
    }
  }, [isSubmittingReview]);

  useEffect(() => {
    addRecentlyViewed(product.id);
    tracker.track({
      event: 'view_item',
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
  }, [product, addRecentlyViewed]);
  
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

  const handleToggleWishlist = () => {
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

  // Dynamic feature highlights
  const featureHighlights = product.features && product.features.length > 0
    ? product.features
    : [
        {
          title: "Premium Engineering",
          description: `Designed with high-precision acoustic and build materials tailored for ${product.category}.`,
          icon: "award"
        },
        {
          title: "Next-Gen Performance",
          description: `Engineered for ultra-low latency, optimal thermal control, and maximum daily endurance.`,
          icon: "zap"
        },
        {
          title: "Smart Ergonomics",
          description: `Lightweight contour design ensuring effortless comfort and seamless everyday portability.`,
          icon: "sparkles"
        }
      ];

  // Dynamic FAQs
  const faqList = product.faqs && product.faqs.length > 0
    ? product.faqs
    : [
        {
          question: `What is the warranty and return policy on the ${product.name}?`,
          answer: `The ${product.name} includes a comprehensive 1-to-2 year manufacturer warranty along with our 30-day money-back satisfaction guarantee.`
        },
        {
          question: `How fast is delivery and shipping?`,
          answer: `All orders are processed immediately. Standard delivery arrives within 2 to 4 working days, with expedited shipping options available at checkout.`
        },
        {
          question: `What devices and platforms are compatible?`,
          answer: `Fully compatible across modern PC, macOS, iOS, Android, and high-performance gaming/workstation platforms.`
        }
      ];

  // Top reviews highlight cards
  const topReviews = reviews.length > 0 
    ? reviews.slice(0, 3) 
    : [
        { id: 'mock-1', userName: 'Alex R.', rating: 5, text: 'Incredible sound quality and premium build. Exceeded expectations!' },
        { id: 'mock-2', userName: 'Sarah K.', rating: 5, text: 'Best ANC and comfort in this category. Worth every single penny.' },
        { id: 'mock-3', userName: 'David M.', rating: 5, text: 'Battery easily lasts days with heavy daily use. Super fast charging too.' }
      ];

  const avgRatingNumber = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) 
    : (product.averageRating || 4.8);

  const displayReviewCount = reviews.length > 0 ? reviews.length : 1450;

  return (
    <div className="container max-w-6xl py-8 md:py-12 space-y-16" role="main" aria-label="Product Details">
      {/* Top Product Hero Section */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-start" aria-live="polite">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="overflow-hidden glass-panel group relative border border-white/10 rounded-3xl bg-neutral-900/40" tabIndex={0} aria-label={`Image of ${product.name}`}>
              <div className="relative aspect-square w-full flex items-center justify-center p-6 bg-gradient-to-b from-white/[0.04] to-transparent">
                <Image
                  src={activeImage}
                  alt={product.name}
                  width={600}
                  height={600}
                  priority
                  className="w-full h-full object-contain cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                  onClick={() => setZoomed(true)}
                  data-ai-hint={`${product.category.toLowerCase()} ${product.subcategory?.toLowerCase() || ''}`}
                />
              </div>

              {product.stock < 10 && product.stock > 0 && (
                <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 via-amber-500 to-red-500 text-white font-bold shadow-lg text-xs animate-pulse border border-white/20">
                  Only {product.stock} left!
                </div>
              )}
            </Card>

            {/* Thumbnail Strip with Labeled Views */}
            <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`flex flex-col items-center gap-1.5 p-1 rounded-xl transition-all duration-200 focus:outline-none ${
                    selectedImageIndex === idx 
                      ? 'border-2 border-primary ring-2 ring-primary/20 scale-105' 
                      : 'border border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-neutral-900/60 p-1 flex items-center justify-center">
                    <Image 
                      src={img} 
                      alt={`${product.name} view ${idx + 1}`} 
                      fill 
                      sizes="80px"
                      className="object-contain p-1" 
                    />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                    {galleryLabels[idx] || `View ${idx + 1}`}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence>
            {zoomed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setZoomed(false)}>
                <motion.img src={activeImage} alt={product.name} initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }} className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-primary/30 cursor-zoom-out" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Right Column: Title, Pricing, Actions, Trust Badges */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.isFeatured && <Badge className="bg-primary/20 text-primary border border-primary/40 font-bold uppercase tracking-wider text-[11px]">Featured</Badge>}
              <Badge variant="outline" className="text-muted-foreground border-white/10 text-[11px] uppercase tracking-wider">{product.brand}</Badge>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase glow-primary leading-none" tabIndex={0}>
              {product.name}
            </h1>
            <p className="text-base text-muted-foreground font-medium mt-1">
              {product.subcategory || product.category}
            </p>

            {/* Rating row */}
            <div className="flex items-center gap-2 mt-3" aria-label="Product rating">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRatingNumber) ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'}`} />
                ))}
              </div>
              <span className="text-sm font-semibold">{avgRatingNumber.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-sm text-muted-foreground underline underline-offset-4 cursor-pointer">{displayReviewCount.toLocaleString()} Reviews</span>
            </div>
          </div>

          {/* Price & Savings Pill */}
          <div className="pt-2 pb-1 flex flex-col space-y-1">
            {originalPrice && (
              <span className="text-base text-muted-foreground line-through font-medium">
                {originalPrice.toLocaleString()} {product.currency}
              </span>
            )}
            <div className="flex items-center gap-3">
              <p className="text-3xl sm:text-4xl font-extrabold text-white" aria-label="Product price">
                {product.price.toLocaleString()} {product.currency}
              </p>
              {savingsAmount > 0 && (
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-xs px-2.5 py-0.5">
                  Save {savingsAmount.toLocaleString()} {product.currency}
                </Badge>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed" aria-label="Product description">
            {product.description}
          </p>

          {/* Action CTAs & Quick Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <Button 
                size="lg" 
                className={`flex-1 h-12 text-sm sm:text-base font-bold tracking-wide rounded-xl shadow-lg transition-all ${
                  inCart 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-[#ff6900] hover:bg-[#e05d00] text-white shadow-orange-500/20'
                }`} 
                onClick={handleToggleCart} 
                disabled={isPending || product.stock === 0} 
                aria-label="Add to cart"
              >
                {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : (
                  inCart ? <><Check className="w-5 h-5 mr-2"/> IN CART</> : <><ShoppingCart className="w-5 h-5 mr-2"/> ADD TO CART</>
                )}
              </Button>

              <Button 
                size="icon" 
                variant="outline" 
                className="h-12 w-12 rounded-xl border-white/10 hover:border-white/30 bg-neutral-900/60" 
                onClick={handleToggleWishlist} 
                disabled={isPending} 
                aria-label="Toggle wishlist"
              >
                <Heart className={`w-5 h-5 transition-colors ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-neutral-400'}`} />
              </Button>
              <Button 
                size="icon" 
                variant={isProductInCompare ? "secondary" : "outline"} 
                className="h-12 w-12 rounded-xl border-white/10 hover:border-white/30 bg-neutral-900/60" 
                onClick={handleToggleCompare} 
                aria-label="Toggle compare"
              >
                <Scale className="w-5 h-5 text-neutral-400"/>
              </Button>
            </div>

            <Button 
              size="lg" 
              className="w-full h-12 font-bold tracking-wide rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10" 
              onClick={handleBuyNow} 
              disabled={isPending || product.stock === 0} 
              aria-label="Buy now"
            >
              {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "BUY NOW"}
            </Button>

            <p className="text-center text-xs font-semibold text-muted-foreground flex items-center justify-center gap-1.5 pt-1">
              <Truck className="w-3.5 h-3.5 text-primary" /> Free 2-Day Shipping on orders above 5,000 KES
            </p>
          </div>

          {/* 2x2 Trust Badges Grid */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02]">
              <Lock className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-neutral-300">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02]">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-neutral-300">Fast Shipping</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02]">
              <RotateCcw className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-neutral-300">30-Day Money Back</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02]">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-neutral-300">2-Year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="border-white/10" />

      {/* WHY [PRODUCT] Feature Cards */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase" tabIndex={0}>
            WHY {product.name}?
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Engineered with benchmark-grade components for uncompromising quality and longevity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureHighlights.map((feature, idx) => (
            <Card key={idx} className="glass-panel border-white/10 bg-neutral-900/40 rounded-2xl p-6 hover:border-primary/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
                {idx === 0 && <Award className="w-6 h-6" />}
                {idx === 1 && <Zap className="w-6 h-6" />}
                {idx >= 2 && <Sparkles className="w-6 h-6" />}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Technical Specs & AI Enhancer Grid */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div aria-label="Technical Specifications">
          <h2 className="text-xl font-bold mb-4 glow-primary" tabIndex={0}>Technical Specifications</h2>
          <Card className="glass-panel border-white/10 bg-neutral-900/40 rounded-2xl">
            <CardContent className="p-6">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Brand</span> <strong className="text-white">{product.brand}</strong></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Category</span> <strong className="text-white">{product.category}</strong></li>
                {product.subcategory && <li className="flex justify-between border-b border-white/5 pb-2"><span>Sub-Category</span> <strong className="text-white">{product.subcategory}</strong></li>}
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Stock Status</span> <strong className={product.stock > 0 ? "text-emerald-400" : "text-red-400"}>{product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}</strong></li>
                {product.specs && Object.entries(product.specs).map(([k, v]) => (
                  <li key={k} className="flex justify-between border-b border-white/5 pb-2">
                    <span className="capitalize">{k}</span>
                    <strong className="text-white">{v}</strong>
                  </li>
                ))}
              </ul>
              <Separator className="my-4 border-white/10"/>
              <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed" aria-label="Product technical description">
                {product.description}
              </p>
            </CardContent>
          </Card>
        </div>
        <div>
           <AiEnhancer productDescription={product.description} />
        </div>
      </div>

      {/* Customer Reviews Highlight Strip */}
      <div className="space-y-6" aria-label="Customer Reviews Highlights">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight uppercase" tabIndex={0}>Customer Reviews</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-bold text-white">{avgRatingNumber.toFixed(1)}</span> out of 5 ({displayReviewCount.toLocaleString()} total)
          </div>
        </div>

        {/* 3 Review Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topReviews.map((rev) => (
            <Card key={rev.id} className="glass-panel border-white/10 bg-neutral-900/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary/30 to-amber-400/30 border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                  {rev.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">{rev.userName}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-300 italic">"{rev.text}"</p>
            </Card>
          ))}
        </div>

        {/* Write a review interactive card */}
        <Card className="glass-panel border-white/10 bg-neutral-900/30 rounded-2xl p-6 mt-6">
          <CardTitle className="text-lg font-bold mb-4" tabIndex={0}>Leave a Verified Review</CardTitle>
          <form onSubmit={handleReviewSubmit} className="space-y-4" aria-label="Review form">
            <div>
              <label className="mb-2 block text-xs font-medium text-neutral-300" htmlFor="review-rating">Your Rating</label>
              <div className="flex items-center gap-1.5" id="review-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 cursor-pointer transition-colors ${i < newReviewRating ? 'text-amber-400 fill-amber-400' : 'text-neutral-600 hover:text-amber-300'}`}
                    onClick={() => setNewReviewRating(i + 1)}
                    aria-label={`Set rating to ${i + 1}`}
                    tabIndex={0}
                  />
                ))}
              </div>
            </div>
            <Textarea 
              ref={reviewTextareaRef}
              placeholder="Share your experience with this product..."
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              rows={3}
              className="bg-black/30 border-white/10 text-xs text-white"
              aria-label="Review text"
            />
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold" disabled={isSubmittingReview} aria-label="Submit review">
              <Send className="w-3.5 h-3.5 mr-2" />
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </Card>
      </div>

      <Separator className="border-white/10" />

      {/* Frequently Asked Questions */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight uppercase" tabIndex={0}>Frequently Asked Questions</h2>
          <p className="text-xs text-muted-foreground">Everything you need to know about warranty, shipping, and device compatibility.</p>
        </div>

        <Accordion type="single" collapsible className="w-full border-t border-white/10">
          {faqList.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-white/10">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4 text-neutral-200 hover:text-white">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Related Products Strip */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight uppercase" tabIndex={0}>Related Products</h2>
            <span className="text-xs text-muted-foreground">Complementary gear & accessories</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} viewMode="grid" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
