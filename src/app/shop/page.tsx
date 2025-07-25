
import { getProducts } from '@/lib/firestore-service';
import ShopClient from '@/components/shop/shop-client';
import { Suspense } from 'react';

export default async function ShopPage({ searchParams }: { searchParams: { category?: string, search?: string, sort?: string, subcategory?: string } }) {
  const allProducts = await getProducts();
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopClient products={allProducts} searchParams={searchParams} />
    </Suspense>
  );
}
