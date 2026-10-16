// Mock the 'firebase-admin' module before any other imports
jest.mock('../firebase-admin', () => ({
  db: require('../__mocks__/firestore-mock').mockDb,
}));
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));
jest.mock('@/lib/firebase', () => ({
  db: require('../__mocks__/firestore-mock').mockDb,
}));

import { getProducts, getOrders, getCompatibilityReport, getCustomizerSuggestions, getReviewsByProductId } from '../firestore-service';
import { mockDb } from '../__mocks__/firestore-mock';

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

  it('should return a valid timestamp for reviews with malformed dates', async () => {
    const reviewQuery = {
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [{ id: 'review-1', data: () => ({ text: 'Good product', timestamp: 'not-a-date' }) }],
      }),
    };
    mockDb.collection.mockReturnValueOnce({
      doc: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue(reviewQuery),
      }),
    });

    const reviews = await getReviewsByProductId('product-1');

    expect(Number.isNaN(new Date(reviews[0].timestamp).getTime())).toBe(false);
  });
});
