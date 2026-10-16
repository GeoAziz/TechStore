
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

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productPromise = getProductById(id);
  const reviewsPromise = getReviewsByProductId(id);
  
  const [product, reviews] = await Promise.all([productPromise, reviewsPromise]);


  if (!product) {
    notFound();
  }

  // Pass all product fields cleanly
  const productData: Product = {
    ...product,
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand,
    price: product.price,
    currency: product.currency,
    stock: product.stock,
    description: product.description,
    imageUrl: product.imageUrl,
    isFeatured: product.isFeatured,
    averageRating: product.averageRating,
    subcategory: product.subcategory,
    promoTag: product.promoTag,
    createdAt: product.createdAt,
    discountPercent: product.discountPercent,
    specs: product.specs,
    color: product.color,
    images: product.images,
    features: product.features,
    faqs: product.faqs,
    warranty: product.warranty,
    shippingTime: product.shippingTime,
  };

  // Fetch related products from same category or brand
  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 4);

  return (
    <ProductDetailsClient 
      product={productData} 
      initialReviews={reviews as Review[]} 
      relatedProducts={relatedProducts}
    />
  );
}
