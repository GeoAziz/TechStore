import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import AdminPage from './page';
import { AuthProvider } from '@/context/auth-context';
import { useAuth } from '@/context/auth-context';
import React from 'react';
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';

// Mock Firebase to prevent real initialization during tests
jest.mock('@/lib/firebase', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(),
  })),
  getFirestore: jest.fn(() => ({})),
  getAnalytics: jest.fn(() => ({})),
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
  isSupported: jest.fn(() => Promise.resolve(false)),
}));

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  onopen = jest.fn();
  onmessage = jest.fn();
  onerror = jest.fn();
  close = jest.fn();
}
global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

// Mock the firestore service to return mock data
jest.mock('@/lib/firestore-service', () => ({
  getProducts: jest.fn(() => Promise.resolve([
    { id: '1', name: 'Test Product 1', price: 100, stock: 0, category: 'Laptops', imageUrl: '', createdAt: new Date().toISOString() },
    { id: '2', name: 'In Stock Product', price: 200, stock: 5, category: 'Laptops', imageUrl: '', createdAt: new Date().toISOString() }
  ])),
  getOrders: jest.fn(() => Promise.resolve([
    { id: '1', total: 100, timestamp: new Date().toISOString(), status: 'Processing', user: 'test@test.com', productName: 'Test Product 1' }
  ])),
  getUsers: jest.fn(() => Promise.resolve([
    { uid: '1', email: 'test@test.com', role: 'admin', createdAt: new Date().toISOString() }
  ])),
  getAuditLogs: jest.fn(() => Promise.resolve([])),
  addProduct: jest.fn(() => Promise.resolve({ success: true })),
  updateProduct: jest.fn(() => Promise.resolve({ success: true })),
  deleteProduct: jest.fn(() => Promise.resolve({ success: true })),
  deleteMultipleProducts: jest.fn(() => Promise.resolve({ success: true })),
  updateOrderStatus: jest.fn(() => Promise.resolve({ success: true })),
  updateUserRole: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock the auth context
jest.mock('@/context/auth-context', () => ({
  ...jest.requireActual('@/context/auth-context'),
  useAuth: () => ({
    user: { uid: '1', email: 'test@test.com', role: 'admin' },
    loading: false,
    role: 'admin',
    handleLogout: jest.fn(),
    isSidebarOpen: true,
    setSidebarOpen: jest.fn(),
    updateUserProfile: jest.fn(),
    isAddProductDialogOpen: false,
    setAddProductDialogOpen: jest.fn(),
    handleAddProductClick: jest.fn(),
  }),
}));

// Main describe block
function renderWithAppRouter(ui: React.ReactElement) {
  return render(
    <MemoryRouterProvider>
      {ui}
    </MemoryRouterProvider>
  );
}

describe('AdminPage', () => {
  beforeEach(() => {
    jest.spyOn(require('@/context/auth-context'), 'useAuth').mockImplementation(() => ({
      user: { uid: 'admin-user', email: 'admin@zizo.net' },
      role: 'admin',
      loading: false,
      isAddProductDialogOpen: false,
      setAddProductDialogOpen: jest.fn(),
    }));
  });

  it('renders the admin dashboard title', async () => {
    renderWithAppRouter(
      <AuthProvider>
        <AdminPage />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('renders the stats cards', async () => {
    renderWithAppRouter(
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
    renderWithAppRouter(
      <AuthProvider>
        <AdminPage defaultTab="inventory" />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.queryByText(/loader-circle/i)).not.toBeInTheDocument();
    });
    const inventoryTab = screen.getByRole('tab', { name: /inventory/i });
    fireEvent.click(inventoryTab);
    screen.debug();
    const inventoryTable = await screen.findByRole('table', {}, { timeout: 4000 });
    expect(inventoryTable).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /manage products/i }, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/test\s*product\s*1/i, { exact: false })
    ).toBeInTheDocument();
  });

  it('shows empty state when no products', async () => {
    const { getProducts } = require('@/lib/firestore-service');
    getProducts.mockResolvedValueOnce([]);
    renderWithAppRouter(
      <AuthProvider>
        <AdminPage defaultTab="inventory" />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument();
      expect(screen.getByText(/start by adding a new product/i)).toBeInTheDocument();
    });
  });

  it('shows out of stock badge for products with stock 0', async () => {
    const { getProducts } = require('@/lib/firestore-service');
    getProducts.mockResolvedValueOnce([
      {
        id: '2',
        name: 'Out of Stock Product',
        price: 100,
        stock: 0,
        category: 'Laptops',
        imageUrl: '',
        createdAt: new Date().toISOString(),
        checked: false,
        description: 'Test product',
        updatedAt: new Date().toISOString(),
        status: 'active'
      }
    ]);
    renderWithAppRouter(
      <AuthProvider>
        <AdminPage defaultTab="inventory" />
      </AuthProvider>
    );
    const outOfStockBadges = await screen.findAllByText(/out of stock/i, {}, { timeout: 10000 });
    expect(outOfStockBadges.length).toBeGreaterThan(0);
  });

  it('opens and closes add product dialog', async () => {
    renderWithAppRouter(
      <AuthProvider>
        <AdminPage defaultTab="inventory" />
      </AuthProvider>
    );
    const addButton = screen.getByRole('button', { name: /add new product/i });
    fireEvent.click(addButton);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows error when API fails', async () => {
    const { addProduct } = require('@/lib/firestore-service');
    addProduct.mockRejectedValueOnce(new Error('API error'));
    renderWithAppRouter(
      <AuthProvider>
        <AdminPage defaultTab="inventory" />
      </AuthProvider>
    );
    const addButton = screen.getByRole('button', { name: /add new product/i });
    fireEvent.click(addButton);
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it('handles WebSocket error gracefully', async () => {
    const originalWebSocket = global.WebSocket;
    class MockWebSocket {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSING = 2;
      static CLOSED = 3;
      addEventListener = jest.fn();
      close = jest.fn();
      send = jest.fn();
      onerror = jest.fn((err: any) => { throw new Error('WebSocket error'); });
    }
    global.WebSocket = function () {
      return new MockWebSocket();
    } as unknown as typeof WebSocket;
    renderWithAppRouter(
      <AuthProvider>
        <AdminPage />
      </AuthProvider>
    );
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    global.WebSocket = originalWebSocket;
  });

  it('is accessible via keyboard navigation', async () => {
    renderWithAppRouter(
      <AuthProvider>
        <AdminPage />
      </AuthProvider>
    );
    const tab = screen.getByRole('tab', { name: /inventory/i });
    tab.focus();
    expect(tab).toHaveFocus();
    fireEvent.keyDown(tab, { key: 'Enter', code: 'Enter' });
    expect(await screen.findByRole('heading', { name: /manage products/i })).toBeInTheDocument();
  });

  it('shows correct UI for non-admin users', async () => {
    jest.spyOn(require('@/context/auth-context'), 'useAuth').mockImplementation(() => ({
      user: { uid: 'client-user', email: 'client@zizo.net' },
      role: 'client',
      loading: false,
    }));
    renderWithAppRouter(
      <AuthProvider>
        <AdminPage />
      </AuthProvider>
    );
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
  });

  it('handles large product names and prices', async () => {
    const { getProducts } = require('@/lib/firestore-service');
    getProducts.mockResolvedValueOnce([
      { id: '3', name: 'Super Ultra Mega Long Product Name That Exceeds Normal Length', price: 99999999, stock: 10, category: 'Laptops', createdAt: new Date().toISOString() }
    ]);
    renderWithAppRouter(
      <AuthProvider>
        <AdminPage defaultTab="inventory" />
      </AuthProvider>
    );
    expect(await screen.findByText(/super ultra mega long product name/i)).toBeInTheDocument();
    expect(await screen.findByText(/99,999,999/i)).toBeInTheDocument();
  });
});
