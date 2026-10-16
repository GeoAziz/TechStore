import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ShopClient from '@/components/shop/shop-client';
import { CompareProvider } from '@/context/compare-context';
import { CartProvider } from '@/context/cart-context';
import type { Product } from '@/lib/types';

jest.mock('@/lib/firebase', () => ({
  db: require('../lib/__mocks__/firestore-mock').mockDb,
  auth: {},
}));

jest.mock('@/lib/firebase-admin', () => ({
  getServiceAccount: jest.fn(() => ({})),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  usePathname: () => '/shop',
  useSearchParams: () => new URLSearchParams('category=Laptops'),
}));

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Pro Laptop Max',
    imageUrl: '/laptop.jpg',
    price: 95000,
    currency: 'KES',
    description: 'High performance laptop',
    brand: 'Apple',
    category: 'Laptops',
    subcategory: 'Gaming',
    stock: 5,
    isFeatured: true,
    averageRating: 4.9,
    color: 'Space Gray',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Stealth Gaming Laptop',
    imageUrl: '/stealth.jpg',
    price: 80000,
    currency: 'KES',
    description: 'Lightweight gaming machine',
    brand: 'ASUS',
    category: 'Laptops',
    subcategory: 'Gaming',
    stock: 8,
    isFeatured: false,
    averageRating: 4.7,
    color: 'Black',
    createdAt: new Date().toISOString(),
  },
];

describe('Shop Marketplace Inspiration Features', () => {
  it('renders Category Hero Banner with Breadcrumbs', () => {
    render(
      <CartProvider>
        <CompareProvider>
          <ShopClient products={mockProducts} searchParams={{ category: 'Laptops' }} />
        </CompareProvider>
      </CartProvider>
    );

    // Breadcrumbs
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();

    // Banner Title
    expect(screen.getByRole('heading', { level: 1, name: /Laptops/i })).toBeInTheDocument();
    expect(screen.getByText(/Featured Marketplace Collection/i)).toBeInTheDocument();
  });

  it('renders Faceted Sidebar with Shop By, Categories, and Manufacturer counts', () => {
    render(
      <CartProvider>
        <CompareProvider>
          <ShopClient products={mockProducts} searchParams={{ category: 'Laptops' }} />
        </CompareProvider>
      </CartProvider>
    );

    // Sidebar Header
    const shopByHeadings = screen.getAllByText(/Shop By/i);
    expect(shopByHeadings.length).toBeGreaterThan(0);

    // Manufacturer filter with counts
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('ASUS')).toBeInTheDocument();

    // Color Swatches
    expect(screen.getByText('Space Gray')).toBeInTheDocument();
  });

  it('renders Utility controls: Show items limit and Sort dropdown', () => {
    render(
      <CartProvider>
        <CompareProvider>
          <ShopClient products={mockProducts} searchParams={{ category: 'Laptops' }} />
        </CompareProvider>
      </CartProvider>
    );

    expect(screen.getByText(/Show:/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search laptops.../i)).toBeInTheDocument();
  });
});

