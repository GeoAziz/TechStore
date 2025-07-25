import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm border-accent/20 text-center p-8 md:p-12 card-glow">
        <CardContent>
          <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6 animate-pulse glow-accent" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent">
            Transmission Complete
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
            Your order has been received and is under processing by the Zizo_Logs AI Control Center.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/dashboard">View Orders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
