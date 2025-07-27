export const mockCollection = (docs = []) => {
  const chain = {
    orderBy: jest.fn().mockImplementation(() => chain),
    get: jest.fn().mockResolvedValue({ docs }),
  };
  return chain;
};

export const mockDb = {
  collection: jest.fn().mockImplementation((name, docs = []) => mockCollection(docs)),
};