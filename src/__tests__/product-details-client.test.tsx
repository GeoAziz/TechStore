import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ProductDetailsClient from '../components/product/product-details-client';
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
  const product: Product = {
    id: '1',
    name: 'Test Product',
    imageUrl: '/test.jpg',
    price: 1000,
    currency: 'KES',
    description: 'A test product',
    brand: 'TestBrand',
    category: 'Laptops',
    subcategory: 'Gaming',
    stock: 5,
    isFeatured: true,
    createdAt: new Date().toISOString(), // or new Date(), depending on your Product type
  };
  const reviews: Review[] = [];

  it('renders product details', () => {
    render(<ProductDetailsClient product={product} initialReviews={reviews} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByLabelText('Product price')).toHaveTextContent('1,000 KES');
  });

  it('shows review form', () => {
    render(<ProductDetailsClient product={product} initialReviews={reviews} />);
    expect(screen.getByLabelText('Review form')).toBeInTheDocument();
  });
});
