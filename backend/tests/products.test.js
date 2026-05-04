const request = require('supertest');
const { app } = require('../server');
const { pool } = require('../db');
const jwt = require('jsonwebtoken');

jest.mock('../db', () => ({
  pool: {
    query: jest.fn(),
    getConnection: jest.fn()
  },
  testConnection: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

describe('Product Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products/business/:businessId', () => {
    it('should return products for a business', async () => {
      const mockProducts = [{ id: 'p-1', name: 'Product 1' }];
      pool.query.mockResolvedValueOnce([mockProducts]);
      
      const res = await request(app).get('/api/products/business/b-1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockProducts);
    });
  });

  describe('POST /api/products', () => {
    it('should allow business owner to create product', async () => {
      jwt.verify.mockReturnValue({ id: 'owner-1', role: 'businessOwner' });
      pool.query
        .mockResolvedValueOnce([[{ id: 'b-1' }]]) // ownership check
        .mockResolvedValueOnce([{}]) // insert
        .mockResolvedValueOnce([[{ id: 'p-1', name: 'New' }]]); // fetch
        
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer token')
        .send({ business_id: 'b-1', name: 'New', price: 10 });
        
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('name', 'New');
    });
  });
});
