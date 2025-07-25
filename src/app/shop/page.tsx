
import { getProducts } from '@/lib/firestore-service';
import ShopClient from '@/components/shop/shop-client';
import { Suspense } from 'react';

export default async function ShopPage({ searchParams }: { searchParams: { category?: string, search?: string, sort?: string, subcategory?: string, page?: string } }) {
  const allProducts = await getProducts();
  // Use searchParams directly as it is a plain object
  const resolvedSearchParams = searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 12;
  const paginatedProducts = allProducts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopClient products={paginatedProducts} searchParams={resolvedSearchParams} />
      {/* Pagination controls */}
      <div className="flex justify-center mt-8">
        {Array.from({ length: Math.ceil(allProducts.length / pageSize) }, (_, i) => (
          <form key={i} method="GET" action="/shop" className="inline">
            <input type="hidden" name="page" value={i + 1} />
            <button
              type="submit"
              className={`mx-1 px-3 py-1 rounded ${page === i + 1 ? 'bg-accent text-white' : 'bg-card text-accent'}`}
            >
              {i + 1}
            </button>
          </form>
        ))}
      </div>
    </Suspense>
  );
}
