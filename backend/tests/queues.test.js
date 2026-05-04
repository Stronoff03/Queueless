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

describe('Queue Routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/queues/business/:businessId', () => {
    it('should return current queue state', async () => {
      pool.query
        .mockResolvedValueOnce([[{ id: 'q-1', business_id: 'b-1', is_paused: 0 }]]) // queue
        .mockResolvedValueOnce([[{ id: 'e-1', guest_name: 'John' }]]) // active entries
        .mockResolvedValueOnce([[{ id: 'e-2', guest_name: 'Jane' }]]); // next entries
        
      const res = await request(app).get('/api/queues/business/b-1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('activeEntries');
    });
  });

  describe('POST /api/queues/:businessId/join-guest', () => {
    it('should allow guest to join queue', async () => {
      pool.query
        .mockResolvedValueOnce([[{ is_active: 1, service_type: 'queue' }]]) // business check
        .mockResolvedValueOnce([[{ is_paused: 0 }]]) // queue check
        .mockResolvedValueOnce([[{ cnt: 5 }]]) // position check
        .mockResolvedValueOnce([{ insertId: 10 }]) // insert entry
        .mockResolvedValueOnce([[{ id: 'p-1', price: 10 }]]) // products check
        .mockResolvedValueOnce([{}]); // insert items
        
      const res = await request(app)
        .post('/api/queues/b-1/join-guest')
        .send({ guest_name: 'Guest User', items: [{ productId: 'p-1', quantity: 1 }] });
        
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('position', 6);
    });
  });
});
