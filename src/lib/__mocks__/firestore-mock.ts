
const defaultProducts = [
  { id: '1', data: () => ({ name: 'Test Product 1', price: 100, stock: 10, category: 'Laptops', createdAt: new Date().toISOString() }) },
];
const defaultOrders = [
  { id: '1', data: () => ({ total: 100, timestamp: new Date().toISOString() }) },
];

type ProductDoc = { id: string; data: () => { name: string; price: number; stock: number; category: string; createdAt: string } };
type OrderDoc = { id: string; data: () => { total: number; timestamp: string } };

export const mockCollection = (
  docs: Array<ProductDoc | OrderDoc> = [],
  name = ''
) => {
  let _docs = docs;
  if (name === 'products' && docs.length === 0) _docs = defaultProducts;
  if (name === 'orders' && docs.length === 0) _docs = defaultOrders;
  const chain = {
    orderBy: jest.fn().mockImplementation(() => chain),
    get: jest.fn().mockResolvedValue({ docs: _docs }),
    where: jest.fn().mockImplementation(() => chain),
    limit: jest.fn().mockImplementation(() => chain),
    doc: jest.fn().mockReturnThis(),
  };
  return chain;
};

export const mockDb = {
  collection: jest.fn().mockImplementation((name, docs = []) => mockCollection(docs, name)),
};