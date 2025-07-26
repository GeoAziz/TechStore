import { getProducts, getOrders, getCompatibilityReport, getCustomizerSuggestions } from '../firestore-service';

describe('firestore-service', () => {
  it('should fetch products', async () => {
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