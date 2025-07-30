
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { getWishlist, getProductsByIds, toggleWishlist } from '@/lib/firestore-service';
import type { Product } from '@/lib/types';
import { Loader2, HeartCrack, View } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ProductCard from '@/components/shop/product-card';
import { useToast } from '@/hooks/use-toast';

export default function WishlistPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
                return;
            }

            const fetchWishlistData = async () => {
                setLoading(true);
                try {
                    const wishlistIds = await getWishlist(user.uid);
                    if (wishlistIds.length > 0) {
                        const wishlistProducts = await getProductsByIds(wishlistIds);
                        setWishlist(wishlistProducts);
                    } else {
                        setWishlist([]);
                    }
                } catch (error) {
                    console.error("Failed to fetch wishlist data:", error);
                    toast({ variant: "destructive", title: "Error", description: "Could not load your wishlist." });
                }
                setLoading(false);
            };

            fetchWishlistData();
        }
    }, [user, authLoading, router, toast]);

    const handleRemoveFromWishlist = async (productId: string) => {
        if (!user) return;
        const result = await toggleWishlist(user.uid, productId);
        if (result.success) {
            setWishlist(prev => prev.filter(item => item.id !== productId));
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    };

    if (authLoading || loading) {
        return (
            <div className="container mx-auto py-10 flex justify-center items-center h-[50vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 glow-primary">My Wishlist</h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Products you've saved for later. Keep track of your favorite tech from the OrderVerse.
                </p>
            </div>

            {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {wishlist.map((product) => (
                        <ProductCard key={product.id} product={product as Product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <HeartCrack className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold">Your Wishlist is Empty</h2>
                    <p className="text-muted-foreground mt-2 mb-6">You haven't added any products yet. Start exploring!</p>
                    <Button asChild>
                        <Link href="/shop">
                            <View className="mr-2" /> Start Shopping
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
