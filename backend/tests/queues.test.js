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

  describe('GET /api/queues/:businessId', () => {
    it('should return current queue state', async () => {
      pool.query
        .mockResolvedValueOnce([[{ id: 'q-1', business_id: 'b-1', is_paused: 0 }]]) // queue
        .mockResolvedValueOnce([[{ avg_sec: 300 }]]); // avg seconds
        
      const res = await request(app).get('/api/queues/b-1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('avg_service_seconds');
    });
  });

  describe('POST /api/queues/:businessId/join-guest', () => {
    it('should allow guest to join queue', async () => {
      // Mock the sequence of queries in join-guest
      pool.query
        .mockResolvedValueOnce([[{ id: 'b-1', name: 'Test', is_active: 1, service_type: 'queue' }]]) // biz check
        .mockResolvedValueOnce([[{ is_paused: 0 }]]) // queue pause check
        .mockResolvedValueOnce([[{ cnt: 5 }]]) // position check
        .mockResolvedValueOnce([[{ id: 'p-1', name: 'Product', price: 10, cost: 5, duration_minutes: 5, stock: 10, is_available: 1, is_off_sale: 0 }]]) // buildQueueCheckout -> products
        .mockResolvedValueOnce([[]]) // applyQueueDiscount -> discounts
        .mockResolvedValueOnce([{}]) // INSERT INTO users
        .mockResolvedValueOnce([{}]) // INSERT INTO queue_entries
        .mockResolvedValueOnce([{}]) // INSERT INTO queues
        .mockResolvedValueOnce([{}]) // UPDATE products (stock)
        .mockResolvedValueOnce([[{ id: 'e-1', position: 6 }]]) // SELECT * FROM queue_entries (entry check)
        .mockResolvedValueOnce([[{ cnt: 6 }]]) // position check (again)
        .mockResolvedValueOnce([[{ owner_id: 'o-1', name: 'Owner' }]]) // getBusinessOwnerId
        .mockResolvedValueOnce([{}]) // createNotification -> INSERT INTO notifications
        .mockResolvedValueOnce([[{ id: 'q-1' }]]) // broadcastQueueUpdate -> queues
        .mockResolvedValueOnce([[]]) // broadcastQueueUpdate -> entries
        .mockResolvedValueOnce([[{ avg_sec: 300 }]]) // broadcastQueueUpdate -> avg seconds
        .mockResolvedValueOnce([[{ id: 'b-1' }]]); // broadcastQueueUpdate -> businesses
        
      const res = await request(app)
        .post('/api/queues/b-1/join-guest')
        .send({ guest_name: 'Guest User', items: [{ productId: 'p-1', quantity: 1 }] });
        
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('position', 6);
    });
  });
});
