
import { getProductById, getProducts, getReviewsByProductId } from '@/lib/firestore-service';
import { notFound } from 'next/navigation';
import ProductDetailsClient from '@/components/product/product-details-client';
import type { Product, Review } from '@/lib/types';

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const productPromise = getProductById(params.id);
  const reviewsPromise = getReviewsByProductId(params.id);
  
  const [product, reviews] = await Promise.all([productPromise, reviewsPromise]);


  if (!product) {
    notFound();
  }

  // Ensure all fields are present, providing defaults for optional ones
  const productData: Product = {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand,
    price: product.price,
    currency: product.currency,
    stock: product.stock,
    description: product.description,
    imageUrl: product.imageUrl,
    featured: product.featured,
    rating: product.rating,
    subcategory: product.subcategory,
    promoTag: product.promoTag,
  };

  return <ProductDetailsClient product={productData} initialReviews={reviews as Review[]} />;
}
