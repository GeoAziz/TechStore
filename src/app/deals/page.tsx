
import { getProducts } from '@/lib/firestore-service';
import ProductCard from '@/components/shop/product-card';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Percent } from 'lucide-react';

export default async function DealsPage() {
  const allProducts = await getProducts();
  const dealProducts = allProducts.filter(p => p.featured);

  return (
    <div className="container py-12">
       <div className="text-center mb-12">
        <Badge variant="outline" className="text-lg py-2 px-4 border-accent text-accent mb-4">
            <Percent className="w-5 h-5 mr-2"/>
            Exclusive Offers
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 glow-primary">Hot Deals</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
            Check out our featured products and special offers. These are the best deals in the OrderVerse right now!
        </p>
      </div>

      {dealProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {dealProducts.map((product) => (
                <ProductCard key={product.id} product={product as Product} />
            ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <h2 className="text-2xl font-bold">No Deals Available</h2>
            <p className="text-muted-foreground mt-2">Please check back later for special offers.</p>
        </div>
      )}
    </div>
  );
}
