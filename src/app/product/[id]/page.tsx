
import { getProductById, getProducts } from '@/lib/firestore-service';
import { notFound } from 'next/navigation';
import ProductDetailsClient from '@/components/product/product-details-client';
import type { Product } from '@/lib/types';

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  // The component expects a Product type, but Firestore might return a DocumentData.
  // We cast it here after checking for existence.
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
  };


  return <ProductDetailsClient product={productData} />;
}
