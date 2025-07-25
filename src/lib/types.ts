
export type ProductCategory = 'Laptops' | 'Desktops' | 'Monitors' | 'Keyboards' | 'Mice' | 'Headphones' | 'Webcams' | 'Storage Drives' | 'Graphic Cards' | 'Processors' | 'RAM Modules' | 'Motherboards' | 'Power Supplies' | 'Coolers/Fans';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory?: string; // e.g., 'Gaming', 'Ultrabook'
  brand: string;
  price: number;
  currency: 'KES';
  stock: number;
  description: string;
  imageUrl: string;
  featured: boolean;
  rating: number;
  promoTag?: string; // e.g., '10% OFF', 'New Arrival'
}

export interface Order {
  id: string;
  productName: string;
  status: 'Delivered' | 'Processing' | 'Failed';
  timestamp: string;
  total: number;
  user: string;
}

export type UserRole = 'admin' | 'vendor' | 'client';

export interface CartItem {
  productId: string;
  quantity: number;
  // Denormalized product data for easier display in the cart
  name: string;
  price: number;
  imageUrl: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  timestamp: string; // ISO string date format
}
