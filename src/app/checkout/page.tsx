
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Rocket, Loader2, ShieldCheck, X, Lock } from 'lucide-react';
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

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#7DF9FF",
      fontFamily: '"Space Mono", monospace',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#2F4F4F",
      },
    },
    invalid: {
      color: "#FF00A8",
      iconColor: "#FF00A8",
    },
  },
};

function CheckoutForm({ total, cartItems }: { total: number; cartItems: CartItem[] }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  
  const form = useForm<Omit<OrderInput, 'payment'>>({
    resolver: zodResolver(OrderInputSchema.omit({ payment: true })),
    defaultValues: {
      contact: { email: user?.email || '' },
      shipping: { firstName: '', lastName: '', address: '', city: '', state: '', zip: '' },
      cart: [],
      total: 0,
    },
  });

  const { formState: { isSubmitting }, reset } = form;

  useEffect(() => {
    if (cartItems.length > 0) {
      reset({
        contact: { email: user?.email || '' },
        shipping: form.getValues('shipping'),
        cart: cartItems.map(item => ({ id: item.productId, name: item.name, price: item.price })),
        total: total,
      });
    }
  }, [cartItems, user, total, reset, form]);

  const onSubmit = async (data: Omit<OrderInput, 'payment'>) => {
    if (!stripe || !elements || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Payment system is not ready.' });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
       toast({ variant: 'destructive', title: 'Error', description: 'Card details are missing.' });
       return;
    }

    try {
      // 1. Create PaymentIntent on the server
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100) }), // amount in cents
      });
      const { clientSecret } = await res.json();
      
      if(!clientSecret) {
          throw new Error('Could not retrieve payment secret from server.');
      }

      // 2. Confirm the payment on the client
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${data.shipping.firstName} ${data.shipping.lastName}`,
            email: data.contact.email,
            address: {
                line1: data.shipping.address,
                city: data.shipping.city,
                state: data.shipping.state,
                postal_code: data.shipping.zip
            }
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
      
      if (paymentIntent?.status !== 'succeeded') {
        throw new Error('Payment was not successful.');
      }
      
      // 3. Payment successful, now send order to n8n webhook (without sensitive payment data)
      const { paymentMethod } = await stripe.retrievePaymentMethod(
        paymentIntent.payment_method as string
      );
      
      const orderDataForWebhook: OrderInput = {
        ...data,
        payment: {
            cardNumber: `**** **** **** ${paymentMethod?.card?.last4 || ''}`,
            expiryDate: 'N/A',
            cvc: 'N/A'
        }
      };
      
      const webhookResult = await sendOrderToWebhook(orderDataForWebhook);
      
      if (webhookResult.success) {
        // Typically, you would clear the user's cart here.
        toast({ title: "Order Submitted", description: "Your order has been sent for processing." });
        router.push('/order-success');
      } else {
        throw new Error(webhookResult.message || "Failed to send order to fulfillment.");
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  };

  return (
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
                <div className="p-4 rounded-lg border border-primary/30 bg-card/80">
                  <CardElement options={CARD_ELEMENT_OPTIONS} />
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
              {/* Order summary part remains similar */}
              <OrderSummary cartItems={cartItems} total={total} />
              <Button type="submit" size="lg" className="w-full mt-6 group" disabled={isSubmitting || !stripe}>
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Rocket className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12"/>
                )}
                Initiate Purchase Protocol
              </Button>
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span>Payment secured by Stripe</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </FormProvider>
  );
}

function OrderSummary({ cartItems, total }: { cartItems: CartItem[], total: number }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = total - subtotal;
  
  const handleRemoveItem = async (productId: string) => {
    if (!user) return;
    await removeFromCart(user.uid, productId);
    toast({ title: "Item Removed" });
    router.refresh(); // Refresh page to update cart state
  };
  
  return (
    <>
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
        </>
      ) : (
        <p className="text-muted-foreground text-center py-8">Your cart is empty.</p>
      )}
    </>
  )
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);

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

  const shipping = 2500;
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal + shipping;
  
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
      <Elements stripe={stripePromise}>
        <CheckoutForm total={total} cartItems={cartItems} />
      </Elements>
    </div>
  );
}
