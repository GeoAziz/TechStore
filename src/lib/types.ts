
export interface Product {
  id: string;
  name: string;
  category: 'Laptops' | 'Desktops' | 'Monitors' | 'Keyboards' | 'Mice' | 'Headphones' | 'Webcams' | 'Storage Drives' | 'Graphic Cards' | 'Processors' | 'RAM Modules' | 'Motherboards' | 'Power Supplies' | 'Coolers/Fans';
  brand: string;
  price: number;
  currency: 'KES';
  stock: number;
  description: string;
  imageUrl: string;
  featured: boolean;
  rating: number;
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
