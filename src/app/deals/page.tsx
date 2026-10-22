
import { getDeals } from '@/lib/firestore-service';
import ProductCard from '@/components/shop/product-card';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import CopyButton from '@/components/ui/copy-button';

export default async function DealsPage() {
  let dealProducts: Product[] = [];
  try {
    dealProducts = await getDeals();
  } catch (err) {
    console.error('Failed to fetch deals:', err);
    dealProducts = [];
  }

  return (
    <div className="container py-12">
       <div className="text-center mb-12">
        <Badge variant="outline" className="text-lg py-2 px-4 border-accent text-accent mb-4">
            <Sparkles className="w-5 h-5 mr-2"/>
            Exclusive Offers
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 glow-primary">Hot Deals</h1>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Check out our featured products and special offers. These are the best deals in the OrderVerse right now!
        </p>
        <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-600 dark:text-lime-400 text-xs">
          <span>Use code <strong className="font-mono text-sm tracking-wider text-foreground">CYBER10</strong> for 10% off at checkout</span>
          <CopyButton value="CYBER10" label="Copy coupon code" successText="Code Copied!" />
        </div>
      </div>

      {dealProducts.length > 0 ? (
        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
        >
            {dealProducts.map((product) => (
                <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <ProductCard product={product as Product} />
                </motion.div>
            ))}
        </motion.div>
      ) : (
        <div className="text-center py-16">
            <h2 className="text-2xl font-bold">No Deals Available</h2>
            <p className="text-muted-foreground mt-2">Please check back later for special offers.</p>
        </div>
      )}
    </div>
  );
}
