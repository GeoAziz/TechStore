import '@testing-library/jest-dom';
import React from 'react';

jest.mock('@/lib/firebase', () => ({
  auth: { onAuthStateChanged: jest.fn(), signOut: jest.fn() },
  db: {},
  default: {},
}));

jest.mock('@/lib/firebase-admin', () => ({
  auth: { verifyIdToken: jest.fn() },
  db: { collection: jest.fn() },
}));

jest.mock('@/lib/firestore-service', () => ({
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  toggleWishlist: jest.fn(),
  getWishlist: jest.fn().mockResolvedValue([]),
  isInCart: jest.fn().mockResolvedValue(false),
  getProducts: jest.fn().mockResolvedValue([]),
  getTrendingProducts: jest.fn().mockResolvedValue([]),
  getNewArrivals: jest.fn().mockResolvedValue([]),
  getDeals: jest.fn().mockResolvedValue([]),
  getFeaturedProducts: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: null, loading: false }),
  AuthProvider: ({ children }: any) => children,
}));

jest.mock('@/context/compare-context', () => ({
  useCompare: () => ({ compareItems: [], addToCompare: jest.fn(), removeFromCompare: jest.fn() }),
  CompareProvider: ({ children }: any) => children,
}));

jest.mock('@/context/cart-context', () => ({
  useCart: () => ({ cartItems: [], cartCount: 0 }),
  CartProvider: ({ children }: any) => children,
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('@/components/shop/recently-viewed-products', () => {
  return function MockRecentlyViewed() {
    return <div data-testid="recently-viewed">Recently Viewed</div>;
  };
});

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ScrollBar: () => null,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    section: ({ children, ...props }: any) => React.createElement('section', props, children),
    h1: ({ children, ...props }: any) => React.createElement('h1', props, children),
    p: ({ children, ...props }: any) => React.createElement('p', props, children),
  },
}));

const mockProduct = (id: string, name: string) => ({
  id, name, category: 'Laptops' as const, brand: 'Test', price: 5000,
  currency: 'KES' as const, stock: 10, description: 'Test', imageUrl: '/test.jpg',
  createdAt: '2024-01-01',
});

import { render, screen } from '@testing-library/react';
import HomeClient from '@/components/home-client';

describe('HomeClient', () => {
  const products = [mockProduct('p1', 'Gaming Mouse'), mockProduct('p2', 'Keyboard')];

  it('renders hero section', () => {
    render(<HomeClient trendingProducts={[]} newArrivals={[]} topDeals={[]} />);
    expect(screen.getByText(/Upgrade Your/i)).toBeInTheDocument();
    expect(screen.getByText(/Everyday Tech\./i)).toBeInTheDocument();
  });

  it('renders section headings', () => {
    render(<HomeClient trendingProducts={[]} newArrivals={[]} topDeals={[]} />);
    expect(screen.getByText(/Shop By Category/i)).toBeInTheDocument();
  });

  it('renders categories', () => {
    render(<HomeClient trendingProducts={[]} newArrivals={[]} topDeals={[]} />);
    expect(screen.getByText('Smartphones')).toBeInTheDocument();
    expect(screen.getByText('Laptops')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
  });

  it('renders recently viewed', () => {
    render(<HomeClient trendingProducts={[]} newArrivals={[]} topDeals={[]} />);
    expect(screen.getByTestId('recently-viewed')).toBeInTheDocument();
  });
});
