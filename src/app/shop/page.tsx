
import { getProducts } from '@/lib/firestore-service';
import ShopClient from '@/components/shop/shop-client';

export default async function ShopPage({ searchParams }: { searchParams: { category?: string, search?: string, sort?: string } }) {
  const allProducts = await getProducts();
  
  return <ShopClient products={allProducts} searchParams={searchParams} />;
}
