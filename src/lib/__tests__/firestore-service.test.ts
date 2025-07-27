// Mock the 'firebase-admin' module before any other imports
jest.mock('../firebase-admin', () => ({
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
    // Add any other Firestore methods you use in the service file
  },
}));
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));
jest.mock('@/lib/firebase', () => ({
  db: require('../__mocks__/firestore-mock').mockDb,
}));

import { getProducts, getOrders, getCompatibilityReport, getCustomizerSuggestions } from '../firestore-service';

describe('firestore-service', () => {
  it('should fetch products', async () => {
    // Since we mocked db, the implementation will "run" but return empty arrays.
    // This is expected for this level of unit test.
    const products = await getProducts();
    expect(Array.isArray(products)).toBe(true);
  });

  it('should fetch orders', async () => {
    const orders = await getOrders();
    expect(Array.isArray(orders)).toBe(true);
  });

  it('should get compatibility report (mock)', async () => {
    const result = await getCompatibilityReport(['prod1', 'prod2']);
    expect(result).toBeDefined();
  });

  it('should get customizer suggestions (mock)', async () => {
    const result = await getCustomizerSuggestions('gaming pc');
    expect(result).toBeDefined();
  });
});
