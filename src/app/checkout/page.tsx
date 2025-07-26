
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Rocket, Loader2, ShieldCheck, X } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { sendOrderToWebhook } from '@/ai/flows/send-order-webhook';
import { type OrderInput, OrderInputSchema } from '@/ai/schemas/order-schema';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getCart, removeFromCart } from '@/lib/firestore-service';
import type { CartItem } from '@/lib/types';

export default function CheckoutPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);

  const shipping = 2500; // Assuming KES 2500 for shipping
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal + shipping;

  const form = useForm<OrderInput>({
    resolver: zodResolver(OrderInputSchema),
    defaultValues: {
      contact: { email: user?.email || '' },
      shipping: { firstName: '', lastName: '', address: '', city: '', state: '', zip: '' },
      payment: { cardNumber: '', expiryDate: '', cvc: '' },
      cart: [],
      total: 0,
    },
  });

  const { formState: { isSubmitting }, reset } = form;

  const fetchCartItems = useCallback(async () => {
    if (user) {
      setLoadingCart(true);
      const items = await getCart(user.uid);
      setCartItems(items);
      setLoadingCart(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else {
      fetchCartItems();
    }
  }, [user, authLoading, router, fetchCartItems]);

  useEffect(() => {
    if (cartItems.length > 0) {
      reset({
        contact: { email: user?.email || '' },
        shipping: form.getValues('shipping'),
        payment: form.getValues('payment'),
        cart: cartItems.map(item => ({ id: item.productId, name: item.name, price: item.price })),
        total: total,
      });
    }
  }, [cartItems, user, total, reset, form]);

  const handleRemoveItem = async (productId: string) => {
    if (!user) return;
    const result = await removeFromCart(user.uid, productId);
    if (result.success) {
      toast({ title: "Item Removed", description: result.message });
      // Refetch or just update state locally
      setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const onSubmit = async (data: OrderInput) => {
    try {
      const result = await sendOrderToWebhook(data);
      if (result.success) {
        // Here you would typically clear the cart after a successful order.
        // For now, we'll just redirect.
        toast({
          title: "Order Submitted",
          description: "Your order has been successfully sent for processing.",
        });
        router.push('/order-success');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };
  
  if (authLoading || loadingCart) {
    return (
        <div className="container mx-auto py-10 flex justify-center items-center h-[50vh]">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold tracking-tighter mb-8 glow-primary">Checkout</h1>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle>Shipping & Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-primary">Contact Information</h3>
                   <FormField
                      control={form.control}
                      name="contact.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="you@domain.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-primary">Shipping Address</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <FormField
                          control={form.control}
                          name="shipping.firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="shipping.lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="shipping.address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <FormField
                          control={form.control}
                          name="shipping.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="shipping.state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="shipping.zip"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-primary">Payment Details</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="payment.cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl><Input placeholder=".... .... .... ...." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                       <FormField
                          control={form.control}
                          name="payment.expiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiration Date</FormLabel>
                              <FormControl><Input placeholder="MM / YY" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="payment.cvc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVC</FormLabel>
                              <FormControl><Input placeholder="..." {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-card/50 backdrop-blur-sm border-primary/10">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {cartItems.map(item => (
                        <div key={item.productId} className="flex items-center gap-4">
                          <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md border border-border" />
                          <div className="flex-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.price.toLocaleString()} KES x {item.quantity}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveItem(item.productId)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{subtotal.toLocaleString()} KES</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{shipping.toLocaleString()} KES</span>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between font-bold text-lg text-primary">
                      <span>Total</span>
                      <span>{total.toLocaleString()} KES</span>
                    </div>
                    <Button type="submit" size="lg" className="w-full mt-6 group" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Rocket className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12"/>
                      )}
                      Initiate Purchase Protocol
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Your cart is empty.</p>
                )}
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>Secure SSL Encrypted Payment</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

    