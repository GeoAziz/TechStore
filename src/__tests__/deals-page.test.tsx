import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import DealsPage from '@/app/deals/page';

jest.mock('@/lib/firestore-service', () => ({
  getDeals: jest.fn().mockResolvedValue([
    { id: 'p1', name: 'Gaming Mouse', category: 'Accessories', price: 2500, currency: 'KES', stock: 12, description: 'Test product', imageUrl: '/test.jpg', averageRating: 4.8, promoTag: 'Trending' },
    { id: 'p2', name: 'Mechanical Keyboard', category: 'Accessories', price: 3200, currency: 'KES', stock: 5, description: 'Test product', imageUrl: '/test.jpg', averageRating: 4.9, promoTag: 'Hot deal' },
  ]),
}));

jest.mock('@/components/shop/product-card', () => ({
  __esModule: true,
  default: ({ product }: { product: { name: string } }) => <div>{product.name}</div>,
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('DealsPage', () => {
  it('renders the deals heading and product cards without crashing', async () => {
    const page = await DealsPage();
    render(page);

    expect(screen.getByText('Hot Deals')).toBeInTheDocument();
    expect(screen.getByText('Gaming Mouse')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });
});
