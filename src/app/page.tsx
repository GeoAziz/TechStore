
import { getCachedTrendingProducts, getCachedNewArrivals, getCachedDeals } from '@/lib/firestore-service';
import HomeClient from '@/components/home-client';
import type { Product } from '@/lib/types';

export default async function Home() {
  let trendingProducts: Product[] = [];
  let newArrivals: Product[] = [];
  let topDeals: Product[] = [];

  try {
    [trendingProducts, newArrivals, topDeals] = await Promise.all([
      getCachedTrendingProducts().catch((): Product[] => []),
      getCachedNewArrivals().catch((): Product[] => []),
      getCachedDeals().catch((): Product[] => []),
    ]);
  } catch {
    // Sections will render empty with error states in client component
  }

  return (
    <HomeClient
      trendingProducts={trendingProducts}
      newArrivals={newArrivals}
      topDeals={topDeals}
    />
  );
}
