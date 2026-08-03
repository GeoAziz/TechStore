
import type { Product, Order, ProductCategory } from './types';
import seedProducts from './seed-database';

// This file can be used for fallback data or component testing,
// but the main application should now fetch from firestore-service.ts

// Convert seed products to mock products with IDs
export const products: Product[] = seedProducts.map((p, idx) => ({
  id: `product-${idx + 1}`,
  ...p,
  createdAt: p.createdAt || new Date(),
})) as Product[];


export const orders: Order[] = [
  {
    id: 'ZOV-84920',
    productName: 'HP Pavilion 15 i5 11th Gen',
    status: 'Processing',
    timestamp: '2024-07-28 14:30:15',
    total: 74999,
    user: 'client@zizo.net'
  },
];

export const categoryData: { name: ProductCategory; href: string; subcategories?: string[] }[] = [
    { name: 'Laptops', href: '/shop?category=Laptops', subcategories: ['Gaming', 'Ultrabooks', 'Business', 'Budget'] },
    { name: 'Desktops', href: '/shop?category=Desktops' },
    { name: 'Monitors', href: '/shop?category=Monitors' },
    { name: 'Keyboards', href: '/shop?category=Keyboards' },
    { name: 'Mice', href: '/shop?category=Mice' },
    { name: 'Headphones', href: '/shop?category=Headphones' },
    { name: 'Webcams', href: '/shop?category=Webcams' },
    { name: 'Storage Drives', href: '/shop?category=Storage Drives', subcategories: ['Internal', 'External'] },
    { name: 'Graphic Cards', href: '/shop?category=Graphic Cards' },
    { name: 'Processors', href: '/shop?category=Processors' },
    { name: 'RAM Modules', href: '/shop?category=RAM Modules' },
    { name: 'Motherboards', href: '/shop?category=Motherboards' },
    { name: 'Power Supplies', href: '/shop?category=Power Supplies' },
    { name: 'Coolers/Fans', href: '/shop?category=Coolers/Fans' },
];

export const categories = categoryData.map(c => ({ name: c.name, href: c.href }));
