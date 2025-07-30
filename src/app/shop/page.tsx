
import { getProducts } from '@/lib/firestore-service';
import ShopClient from '@/components/shop/shop-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default async function ShopPage({ searchParams }: { searchParams: { category?: string, search?: string, sort?: string, subcategory?: string } }) {
  // Fetching all products on the server component side
  const allProducts = await getProducts();
  const resolvedSearchParams = searchParams;

  return (
    <Suspense fallback={
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <ShopClient products={allProducts} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
