import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import AdminPage from './page';
import { AuthProvider } from '@/context/auth-context';
import { useAuth } from '@/context/auth-context';
import React from 'react';

// Mock the firestore service to return mock data
jest.mock('@/lib/firestore-service', () => ({
  getProducts: jest.fn(() => Promise.resolve([
    { id: '1', name: 'Test Product 1', price: 100, stock: 10, category: 'Laptops' }
  ])),
  getOrders: jest.fn(() => Promise.resolve([
    { id: '1', total: 100 }
  ])),
  getUsers: jest.fn(() => Promise.resolve([
    { uid: '1', email: 'test@test.com', role: 'client' }
  ])),
  getAuditLogs: jest.fn(() => Promise.resolve([])),
  addProduct: jest.fn(() => Promise.resolve({ success: true })),
  updateProduct: jest.fn(() => Promise.resolve({ success: true })),
  deleteProduct: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock the auth context
jest.mock('@/context/auth-context', () => ({
  ...jest.requireActual('@/context/auth-context'),
  useAuth: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/admin',
}));

jest.mock('@/lib/firebase', () => ({
  db: require('../../lib/__mocks__/firestore-mock').mockDb,
  auth: {}, // add more mocks if needed
}));

describe('AdminPage', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'admin-user', email: 'admin@zizo.net' },
      role: 'admin',
      loading: false,
      isAddProductDialogOpen: false,
      setAddProductDialogOpen: jest.fn(),
    });
  });

  it('renders the admin dashboard title', async () => {
    render(
      <AuthProvider>
        <AdminPage />
      </AuthProvider>
    );
    await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('renders the stats cards', async () => {
    render(
        <AuthProvider>
          <AdminPage />
        </AuthProvider>
      );
    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });
  });

  it('renders the product management table', async () => {
    render(
        <AuthProvider>
          <AdminPage />
        </AuthProvider>
      );
    await waitFor(() => {
        expect(screen.getByText('Manage Products')).toBeInTheDocument();
        // Check for a product from our mock data
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });
  });

});
