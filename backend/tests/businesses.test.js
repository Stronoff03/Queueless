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

describe('Business Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/businesses', () => {
    it('should return a list of active businesses', async () => {
      const mockBusinesses = [{ id: 'b-1', name: 'Test Business' }];
      pool.query.mockResolvedValue([mockBusinesses]);
      const res = await request(app).get('/api/businesses');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockBusinesses);
    });

    it('should filter businesses by search term', async () => {
      pool.query.mockResolvedValue([[]]);
      const res = await request(app).get('/api/businesses?search=Test');
      expect(res.statusCode).toEqual(200);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('LIKE'), expect.any(Array));
    });

    it('should filter businesses by category', async () => {
      pool.query.mockResolvedValue([[]]);
      const res = await request(app).get('/api/businesses?category=restaurant');
      expect(res.statusCode).toEqual(200);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('category ='), expect.any(Array));
    });
  });

  describe('GET /api/businesses/:id', () => {
    it('should return a single business by id', async () => {
      pool.query.mockResolvedValue([[{ id: 'b-1', name: 'Test' }]]);
      const res = await request(app).get('/api/businesses/b-1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', 'b-1');
    });

    it('should return 404 if business not found', async () => {
      pool.query.mockResolvedValue([[]]);
      const res = await request(app).get('/api/businesses/notfound');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /api/businesses/owner', () => {
    it('should allow business owner to update details', async () => {
      jwt.verify.mockReturnValue({ id: 'owner-1', role: 'businessOwner' });
      pool.query
        // 1st query: check if owner owns the business
        .mockResolvedValueOnce([[{ id: 'b-1' }]])
        // 2nd query: update the business
        .mockResolvedValueOnce([{}])
        // 3rd query: fetch updated
        .mockResolvedValueOnce([[{ id: 'b-1', name: 'Updated' }]]);

      const res = await request(app)
        .put('/api/businesses/owner')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated', description: 'Desc' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Updated');
    });

    it('should return 404 if user has no business', async () => {
      jwt.verify.mockReturnValue({ id: 'owner-1', role: 'businessOwner' });
      pool.query.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .put('/api/businesses/owner')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated' });
      
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('GET /api/businesses/owner/stats', () => {
    it('should return business statistics', async () => {
      jwt.verify.mockReturnValue({ id: 'owner-1', role: 'businessOwner' });
      // Mock get business
      pool.query.mockResolvedValueOnce([[{ id: 'b-1' }]]);
      // Mock stats queries (total entries, waiting, served)
      pool.query.mockResolvedValueOnce([[{ count: 10 }]]);
      pool.query.mockResolvedValueOnce([[{ count: 2 }]]);
      pool.query.mockResolvedValueOnce([[{ count: 8 }]]);
      
      const res = await request(app)
        .get('/api/businesses/owner/stats')
        .set('Authorization', 'Bearer token');

      expect(res.statusCode).toEqual(200);
      expect(res.body.stats).toHaveProperty('totalEntries', 10);
    });
  });
});
