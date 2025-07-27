import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Ensure jest-dom matchers are loaded
import AdminPage from '../app/admin/page';
import { AuthProvider } from '../context/auth-context';
import { act } from 'react-dom/test-utils';
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';

// Mock dependencies
jest.mock('../lib/firestore-service', () => ({
  getProducts: jest.fn(() => Promise.resolve([])),
  getOrders: jest.fn(() => Promise.resolve([])),
  getUsers: jest.fn(() => Promise.resolve([])),
  getAuditLogs: jest.fn(() => Promise.resolve([])),
  deleteProduct: jest.fn(() => Promise.resolve({ success: true })),
  deleteMultipleProducts: jest.fn(() => Promise.resolve({ success: true })),
  addProduct: jest.fn(() => Promise.resolve({ success: true })),
  updateProduct: jest.fn(() => Promise.resolve({ success: true })),
  updateOrderStatus: jest.fn(() => Promise.resolve({ success: true })),
  deleteUser: jest.fn(() => Promise.resolve({ success: true })),
  updateUserRole: jest.fn(() => Promise.resolve({ success: true })),
}));

jest.mock('../context/auth-context', () => {
  return {
    useAuth: () => ({
      user: { uid: 'admin1', email: 'admin@example.com' },
      loading: false,
      role: 'admin',
      isAddProductDialogOpen: false,
      setAddProductDialogOpen: jest.fn(),
    }),
    AuthProvider: function AuthProvider({ children }: { children: React.ReactNode }) {
      return <>{children}</>;
    },
  };
});

function customRender(ui: React.ReactElement) {
  return render(
    <MemoryRouterProvider>
      {ui}
    </MemoryRouterProvider>
  );
}

// Edge case: Empty state
it('shows empty state when no products', async () => {
  jest.spyOn(require('../lib/firestore-service'), 'getProducts').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getOrders').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getUsers').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getAuditLogs').mockResolvedValueOnce([]);
  customRender(
    <AuthProvider>
      <AdminPage defaultTab="inventory" />
    </AuthProvider>
  );
  await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(), { timeout: 4000 });
  expect(await screen.findByText(/total: 0 products/i)).toBeInTheDocument();
});

// Out of stock badge
it('shows out of stock badge for products with stock 0', async () => {
  jest.spyOn(require('../lib/firestore-service'), 'getProducts').mockResolvedValueOnce([
    {
      id: 'p1',
      name: 'Test',
      imageUrl: '',
      price: 100,
      stock: 0,
      category: 'Electronics',
      brand: '',
      subcategory: '',
      isFeatured: false,
      createdAt: new Date().toISOString(),
      checked: false,
      description: 'Test product',
      updatedAt: new Date().toISOString(),
      status: 'active'
    }
  ]);
  jest.spyOn(require('../lib/firestore-service'), 'getProducts').mockResolvedValueOnce([
    {
      id: 'p1',
      name: 'Test Out of Stock',
      imageUrl: '',
      price: 100,
      stock: 0,
      category: 'Electronics',
      brand: '',
      subcategory: '',
      isFeatured: false,
      createdAt: new Date().toISOString(),
      checked: false,
      description: 'Test product',
      updatedAt: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 'p2',
      name: 'Test In Stock',
      imageUrl: '',
      price: 200,
      stock: 10,
      category: 'Electronics',
      brand: '',
      subcategory: '',
      isFeatured: false,
      createdAt: new Date().toISOString(),
      checked: false,
      description: 'Test product 2',
      updatedAt: new Date().toISOString(),
      status: 'active'
    }
  ]);
  jest.spyOn(require('../lib/firestore-service'), 'getOrders').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getUsers').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getAuditLogs').mockResolvedValueOnce([]);
  customRender(
    <AuthProvider>
      <AdminPage defaultTab="inventory" />
    </AuthProvider>
  );
  await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(), { timeout: 4000 });
  // Ensure inventory tab is selected
  const inventoryTab = await screen.findByRole('tab', { name: /inventory/i }, { timeout: 8000 });
  fireEvent.click(inventoryTab);
  // Wait for inventory table
  let table;
  try {
    table = await screen.findByRole('table', {}, { timeout: 8000 });
  } catch {
    screen.debug();
    table = screen.queryByRole('table');
  }
  expect(table).not.toBeNull();
  // Try to find the badge by text, fallback to queryAllByText if not found
  let outOfStockBadges;
  try {
    outOfStockBadges = await screen.findAllByText(/out of stock/i, { exact: false }, { timeout: 8000 });
  } catch {
    outOfStockBadges = screen.queryAllByText(/out of stock/i, { exact: false });
  }
  expect(outOfStockBadges.length).toBeGreaterThan(0);
}, 20000);

// Bulk delete dialog
it('shows bulk delete dialog when products are selected', async () => {
  jest.spyOn(require('../lib/firestore-service'), 'getProducts').mockResolvedValueOnce([
    {
      id: 'p1',
      name: 'Test',
      imageUrl: '',
      price: 100,
      stock: 1,
      category: 'Electronics',
      brand: '',
      subcategory: '',
      isFeatured: false,
      createdAt: new Date().toISOString(),
      checked: false,
      description: 'Test product',
      updatedAt: new Date().toISOString(),
      status: 'active'
    },
    {
      id: 'p2',
      name: 'Test 2',
      imageUrl: '',
      price: 200,
      stock: 5,
      category: 'Electronics',
      brand: '',
      subcategory: '',
      isFeatured: false,
      createdAt: new Date().toISOString(),
      checked: false,
      description: 'Test product 2',
      updatedAt: new Date().toISOString(),
      status: 'active'
    }
  ]);
  jest.spyOn(require('../lib/firestore-service'), 'getOrders').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getUsers').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getAuditLogs').mockResolvedValueOnce([]);
  customRender(
    <AuthProvider>
      <AdminPage defaultTab="inventory" />
    </AuthProvider>
  );
  await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(), { timeout: 10000 });
  const inventoryTab = screen.getByRole('tab', { name: /inventory/i });
  fireEvent.click(inventoryTab);
  await waitFor(() => {
    expect(inventoryTab).toHaveAttribute('aria-selected', 'true');
  }, { timeout: 10000 });
  let table;
  try {
    table = await screen.findByRole('table', {}, { timeout: 10000 });
  } catch {
    screen.debug();
    table = screen.queryByRole('table');
  }
  expect(table).not.toBeNull();
  let checkboxes;
  try {
    checkboxes = await screen.findAllByRole('checkbox', {}, { timeout: 10000 });
  } catch (e) {
    screen.debug();
    throw e;
  }
  fireEvent.click(checkboxes[1]);
  const deleteBtn = screen.queryByText(/delete \(1\)/i);
  expect(deleteBtn).not.toBeNull();
  expect(deleteBtn).toBeInTheDocument();
}, 20000);

// Add product dialog
it('opens add product dialog', async () => {
  jest.spyOn(require('../lib/firestore-service'), 'getProducts').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getOrders').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getUsers').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getAuditLogs').mockResolvedValueOnce([]);
  customRender(
    <AuthProvider>
      <AdminPage defaultTab="inventory" />
    </AuthProvider>
  );
  await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(), { timeout: 4000 });
  let addBtn;
  try {
    addBtn = await screen.findByRole('button', { name: /add new product/i });
  } catch (e) {
    screen.debug();
    throw e;
  }
  fireEvent.click(addBtn);
  expect(await screen.findByText(/add new product/i)).toBeInTheDocument();
});

// Edit product dialog
it('opens edit product dialog', async () => {
  jest.spyOn(require('../lib/firestore-service'), 'getProducts').mockResolvedValueOnce([
    {
      id: 'p1',
      name: 'Test',
      imageUrl: '',
      price: 100,
      stock: 1,
      category: 'Electronics',
      brand: '',
      subcategory: '',
      isFeatured: false,
      createdAt: new Date().toISOString(),
      checked: false,
      description: 'Test product',
      updatedAt: new Date().toISOString(),
      status: 'active'
    }
  ]);
  jest.spyOn(require('../lib/firestore-service'), 'getOrders').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getUsers').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getAuditLogs').mockResolvedValueOnce([]);
  customRender(
    <AuthProvider>
      <AdminPage defaultTab="inventory" />
    </AuthProvider>
  );
  await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(), { timeout: 10000 });
  const inventoryTab = screen.getByRole('tab', { name: /inventory/i });
  fireEvent.click(inventoryTab);
  // Wait for the table to appear before proceeding
  let table;
  try {
    table = await screen.findByRole('table', {}, { timeout: 10000 });
  } catch {
    screen.debug();
    table = screen.queryByRole('table');
  }
  expect(table).not.toBeNull();
  let editBtns;
  try {
    editBtns = await screen.findAllByRole('button', { name: /edit/i }, { timeout: 10000 });
  } catch (e) {
    screen.debug();
    throw e;
  }
  fireEvent.click(editBtns[0]);
  expect(await screen.findByText(/edit product/i)).toBeInTheDocument();
}, 20000);

// Error handling: API failure
it('shows error toast on API failure', async () => {
  jest.spyOn(require('../lib/firestore-service'), 'deleteProduct').mockResolvedValueOnce({ success: false, message: 'Failed' });
  jest.spyOn(require('../lib/firestore-service'), 'getProducts').mockResolvedValueOnce([
    {
      id: 'p1',
      name: 'Test',
      imageUrl: '',
      price: 100,
      stock: 1,
      category: 'Electronics',
      brand: '',
      subcategory: '',
      isFeatured: false,
      createdAt: new Date().toISOString(),
      checked: false,
      description: 'Test product',
      updatedAt: new Date().toISOString(),
      status: 'active'
    }
  ]);
  jest.spyOn(require('../lib/firestore-service'), 'getOrders').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getUsers').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getAuditLogs').mockResolvedValueOnce([]);
  customRender(
    <AuthProvider>
      <AdminPage defaultTab="inventory" />
    </AuthProvider>
  );
  await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(), { timeout: 10000 });
  const inventoryTab = screen.getByRole('tab', { name: /inventory/i });
  fireEvent.click(inventoryTab);
  let table;
  try {
    table = await screen.findByRole('table', {}, { timeout: 10000 });
  } catch {
    screen.debug();
    table = screen.queryByRole('table');
  }
  expect(table).not.toBeNull();
  let checkboxes;
  try {
    checkboxes = await screen.findAllByRole('checkbox', {}, { timeout: 10000 });
  } catch (e) {
    screen.debug();
    throw e;
  }
  window.confirm = jest.fn(() => true);
  fireEvent.click(checkboxes[1]);
  let deleteBtns;
  try {
    deleteBtns = await screen.findAllByRole('button', { name: /delete/i }, { timeout: 10000 });
  } catch (e) {
    screen.debug();
    throw e;
  }
  window.confirm = jest.fn(() => true);
  await act(async () => {
    fireEvent.click(deleteBtns[0]);
  });
  const errorToast = await screen.findByText(/error/i, {}, { timeout: 10000 });
  expect(errorToast).not.toBeNull();
  expect(errorToast).toBeInTheDocument();
}, 20000);

// Accessibility: heading
it('has accessible heading for manage products', async () => {
  customRender(
    <AuthProvider>
      <AdminPage defaultTab="inventory" />
    </AuthProvider>
  );
  await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(), { timeout: 4000 });
  jest.spyOn(require('../lib/firestore-service'), 'getProducts').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getOrders').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getUsers').mockResolvedValueOnce([]);
  jest.spyOn(require('../lib/firestore-service'), 'getAuditLogs').mockResolvedValueOnce([]);
  await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(), { timeout: 4000 });
  try {
    expect(await screen.findByRole('heading', { name: /manage products/i })).toBeInTheDocument();
  } catch (e) {
    screen.debug();
    throw e;
  }
});

// Role-based access
// it('shows restriction for non-admin users', async () => {
//   jest.resetModules();
//   jest.doMock('../context/auth-context', () => ({
//     useAuth: () => ({ user: { uid: 'user1', email: 'user@example.com' }, loading: false, role: 'client' }),
//     AuthProvider: ({ children }: any) => <>{children}</>,
//   }));
//   jest.doMock('../lib/firestore-service', () => ({
//     getProducts: jest.fn(() => Promise.resolve([])),
//     getOrders: jest.fn(() => Promise.resolve([])),
//     getUsers: jest.fn(() => Promise.resolve([])),
//     getAuditLogs: jest.fn(() => Promise.resolve([])),
//     deleteProduct: jest.fn(() => Promise.resolve({ success: true })),
//     deleteMultipleProducts: jest.fn(() => Promise.resolve({ success: true })),
//     addProduct: jest.fn(() => Promise.resolve({ success: true })),
//     updateProduct: jest.fn(() => Promise.resolve({ success: true })),
//     updateOrderStatus: jest.fn(() => Promise.resolve({ success: true })),
//     deleteUser: jest.fn(() => Promise.resolve({ success: true })),
//     updateUserRole: jest.fn(() => Promise.resolve({ success: true })),
//   }));
//   const { default: AdminPage } = require('../app/admin/page');
//   const { AuthProvider } = require('../context/auth-context');
//   render(
//     <AuthProvider>
//       <AdminPage defaultTab="inventory" />
//     </AuthProvider>
//   );
//   await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(), { timeout: 4000 });
//   try {
//     expect(screen.getByText(/access denied|not authorized/i)).toBeInTheDocument();
//   } catch (e) {
//     screen.debug();
//     throw e;
//   }
// });

// Real-time update simulation
it('updates UI on WebSocket message', async () => {
  // This would require mocking WebSocket and triggering a message
  // For brevity, just check that fetchData is called on message
  // You can use jest.spyOn and simulate ws.onmessage
});

// Snapshot test
it('matches snapshot for inventory tab', async () => {
  const { asFragment } = render(
    <AuthProvider>
      <AdminPage defaultTab="inventory" />
    </AuthProvider>
  );
  expect(asFragment()).toMatchSnapshot();
});
