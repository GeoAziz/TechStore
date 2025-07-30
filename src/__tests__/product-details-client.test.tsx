import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ProductDetailsClient from '../components/product/product-details-client';
import { CompareProvider } from '../context/compare-context';
import { Product, Review } from '../lib/types';

jest.mock('@/lib/firebase', () => ({
  db: require('../lib/__mocks__/firestore-mock').mockDb,
  auth: {},
}));

jest.mock('@/lib/firebase-admin', () => ({
  getServiceAccount: jest.fn(() => ({})),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn(), forward: jest.fn(), reload: jest.fn(), events: { on: jest.fn(), off: jest.fn() } }),
  usePathname: () => '/',
}));

describe('ProductDetailsClient', () => {
  const product = {
    id: '1',
    name: 'Test Product',
    imageUrl: '/test.jpg',
    price: 1000,
    currency: "KES" as const,
    description: 'A test product',
    brand: 'TestBrand',
    category: 'Laptops' as Product['category'],
    subcategory: 'Gaming',
    stock: 5,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  };
  const reviews: Review[] = [];

  it('renders product details', () => {
    render(
      <CompareProvider>
        <ProductDetailsClient product={product} initialReviews={reviews} />
      </CompareProvider>
    );
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByLabelText('Product price')).toHaveTextContent('1,000 KES');
  });

  it('shows review form', () => {
    render(
      <CompareProvider>
        <ProductDetailsClient product={product} initialReviews={reviews} />
      </CompareProvider>
    );
    expect(screen.getByLabelText('Review form')).toBeInTheDocument();
  });
});
