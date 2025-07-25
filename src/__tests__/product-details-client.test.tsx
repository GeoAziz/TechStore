import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductDetailsClient from '../components/product/product-details-client';
import { Product, Review } from '../lib/types';

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
    rating: 4,
    featured: true,
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
