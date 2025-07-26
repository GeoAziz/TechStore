
import type { Product, Order, ProductCategory } from './types';

// This file can be used for fallback data or component testing,
// but the main application should now fetch from firestore-service.ts

export const products: Product[] = [
  {
    id: 'hp-pavilion-15',
    name: 'HP Pavilion 15 i5 11th Gen',
    category: 'Laptops',
    subcategory: 'Business',
    brand: 'HP',
    price: 74999,
    currency: 'KES',
    stock: 12,
    description: 'Powerful laptop with 11th Gen Intel Core i5, 8GB RAM, 512GB SSD for work and entertainment.',
    imageUrl: 'https://placehold.co/600x600.png',
    isFeatured: true,
    averageRating: 4.6,
    promoTag: 'Top Rated',
    createdAt: new Date(),
  },
  {
    id: 'mx-master-3s',
    name: 'Logitech MX Master 3S Wireless Mouse',
    category: 'Mice',
    brand: 'Logitech',
    price: 12800,
    currency: 'KES',
    stock: 25,
    description: 'Advanced wireless mouse with ergonomic design, quiet clicks, and 8K DPI sensor for precision.',
    imageUrl: 'https://placehold.co/600x600.png',
    isFeatured: true,
    averageRating: 4.9,
    createdAt: new Date(),
  },
];


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
