export type ProductCategory = 'Laptops' | 'Desktops' | 'Monitors' | 'Keyboards' | 'Mice' | 'Headphones' | 'Webcams' | 'Storage Drives' | 'Graphic Cards' | 'Processors' | 'RAM Modules' | 'Motherboards' | 'Power Supplies' | 'Coolers/Fans' | 'Phones' | 'Accessories' | 'Networking' | 'Smart Tech';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory?: string;
  brand: string;
  price: number; // KES
  currency: 'KES';
  discountPercent?: number;
  stock: number;
  description: string;
  imageUrl: string;
  tags?: string[];
  specs?: { [key: string]: string };
  color?: string;
  
  // Flags & Metrics
  isFeatured?: boolean;
  
  // Timestamps (as ISO strings)
  createdAt: string | any;
  updatedAt?: string | any;

  // Metrics for "Trending"
  views?: number;
  cartCount?: number;
  ordersCount?: number;

  // Reviews
  averageRating?: number;
  reviewsCount?: number;
  
  // Additional Info
  warranty?: string;
  shippingTime?: string;
  vendor?: string;
  
  // AI Hint for images
  dataAiHint?: string;
  promoTag?: string; // e.g., '10% OFF', 'New Arrival'
}


export type OrderStatus = 'Delivered' | 'Processing' | 'Failed' | 'Cancelled';

export interface Order {
  id: string;
  productName: string;
  status: OrderStatus;
  timestamp: string; // ISO string date format
  total: number;
  user: string;
}

<<<<<<< HEAD
export type UserRole = 'admin' | 'vendor' | 'client' | 'vip' | 'premium' | 'inactive';
=======
export type UserRole = 'admin' | 'vendor' | 'client' | 'product_manager' | 'support';
>>>>>>> b339c1cc4be16dac35b99fa70396f72f85b0c0c7

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    role: UserRole;
    address?: string;
    photoURL?: string;
<<<<<<< HEAD
    segment?: 'VIP' | 'New' | 'Inactive' | 'Regular';
    flagged?: boolean;
    failedLoginAttempts?: number;
    vendorUpgradeRequested?: boolean;
=======
    createdAt?: string | any;
>>>>>>> b339c1cc4be16dac35b99fa70396f72f85b0c0c7
}

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

<<<<<<< HEAD
export interface CustomerAuditLogEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  customer: string;
  details: string;
=======
export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetId: string;
  targetType: 'product' | 'user' | 'order';
  timestamp: string;
  details: Record<string, any>;
>>>>>>> b339c1cc4be16dac35b99fa70396f72f85b0c0c7
}
