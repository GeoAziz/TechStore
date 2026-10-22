export interface ScopedVendor {
  id: string;
  name: string;
  brand: string;
  email: string;
  catalogCategory: string;
}

export const REAL_VENDORS: readonly ScopedVendor[] = [
  {
    id: 'vendor-apple-ke-01',
    name: 'Apple Official Store',
    brand: 'Apple',
    email: 'apple.vendor@techstore.co.ke',
    catalogCategory: 'Laptops & Phones',
  },
  {
    id: 'vendor-dell-ke-01',
    name: 'Dell Technologies KE',
    brand: 'Dell',
    email: 'dell.vendor@techstore.co.ke',
    catalogCategory: 'Desktops & Monitors',
  },
  {
    id: 'vendor-logitech-ke-01',
    name: 'Logitech East Africa',
    brand: 'Logitech',
    email: 'logitech.vendor@techstore.co.ke',
    catalogCategory: 'Accessories & Peripherals',
  },
  {
    id: 'vendor-samsung-ke-01',
    name: 'Samsung Experience Store',
    brand: 'Samsung',
    email: 'samsung.vendor@techstore.co.ke',
    catalogCategory: 'Displays & Flagship Mobile',
  },
];

export interface ScopedCustomer {
  id: string;
  name: string;
  email: string;
  location: string;
  preferredBrands: string[];
  purchaseProbability: number; // 0 to 1 likelihood of completing a purchase once carted
  cartAbandonProbability: number;
}

export const REAL_CUSTOMERS: readonly ScopedCustomer[] = [
  {
    id: 'client-jane-ke-01',
    name: 'Jane Wanjiku',
    email: 'client@demo.com',
    location: 'Westlands, Nairobi',
    preferredBrands: ['Apple', 'Logitech'],
    purchaseProbability: 0.85,
    cartAbandonProbability: 0.15,
  },
  {
    id: 'client-brian-ke-02',
    name: 'Brian Otieno',
    email: 'brian.otieno@gmail.com',
    location: 'Kilimani, Nairobi',
    preferredBrands: ['Dell'],
    purchaseProbability: 0.70,
    cartAbandonProbability: 0.30,
  },
  {
    id: 'client-sarah-ke-03',
    name: 'Sarah Kimani',
    email: 'sarah.kimani@corporate.co.ke',
    location: 'Upper Hill, Nairobi',
    preferredBrands: ['Logitech', 'Dell'],
    purchaseProbability: 0.60,
    cartAbandonProbability: 0.40,
  },
  {
    id: 'client-hassan-ke-04',
    name: 'Hassan Omar',
    email: 'hassan.omar@mombasa-tech.com',
    location: 'Nyali, Mombasa',
    preferredBrands: ['Samsung'],
    purchaseProbability: 0.75,
    cartAbandonProbability: 0.25,
  },
];

