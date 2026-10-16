
import { getProducts } from '@/lib/firestore-service';
import CustomizerClient from '@/components/customizer/customizer-client';

export default async function CustomizerPage() {
  const products = await getProducts();
  return <CustomizerClient products={products} />;
}

