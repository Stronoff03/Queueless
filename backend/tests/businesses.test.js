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
    jest.resetAllMocks();
  });

  describe('GET /api/businesses', () => {
    it('should return a list of active businesses', async () => {
      const mockBusinesses = [{ id: 'b-1', name: 'Test Business' }];
      pool.query.mockResolvedValue([mockBusinesses]);
      const res = await request(app).get('/api/businesses');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockBusinesses);
    });
  });

  describe('GET /api/businesses/:id', () => {
    it('should return a single business by id', async () => {
      pool.query.mockResolvedValue([[{ id: 'b-1', name: 'Test' }]]);
      const res = await request(app).get('/api/businesses/b-1');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', 'b-1');
    });
  });

  describe('PUT /api/businesses/:id', () => {
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
        .put('/api/businesses/b-1')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated', description: 'Desc' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Updated');
    });
  });
});

describe('Guest Web Pages (server.js)', () => {
  it('should return HTML for guest page when valid business ID is provided', async () => {
    pool.query
      .mockResolvedValueOnce([[{ name: 'Test', category: 'restaurant', address: '', service_type: 'queue' }]]) // business check
      .mockResolvedValueOnce([[]]); // queue state
      
    const res = await request(app).get('/join/b-1');
    expect(res.statusCode).toEqual(302);
    expect(res.header.location).toMatch(/\/q\/b-1|\/a\/b-1/);
  });

  it('should return 404 HTML if business not found', async () => {
    pool.query.mockResolvedValueOnce([[]]); // empty business
    const res = await request(app).get('/join/b-1');
    expect(res.statusCode).toEqual(404);
    expect(res.text).toContain('Business not found');
  });

  it('should return 200 for queue page /q/:id', async () => {
    pool.query
      .mockResolvedValueOnce([[{ name: 'Test', address: '' }]]) // biz
      .mockResolvedValueOnce([[{ cnt: 5 }]]) // waitCount
      .mockResolvedValueOnce([[{ is_paused: 0 }]]) // qRow
      .mockResolvedValueOnce([[{ id: 'p-1', name: 'Product', description: 'Desc', price: 10, stock: 5 }]]); // products
      
    const res = await request(app).get('/q/b-1');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Test');
    expect(res.text).toContain('Product');
  });

  it('should return 200 for appointment page /a/:id', async () => {
    pool.query
      .mockResolvedValueOnce([[{ name: 'Test', address: '' }]]) // biz
      .mockResolvedValueOnce([[{ id: 's-1', name: 'Service', description: 'Desc', price: 50 }]]); // services
      
    const res = await request(app).get('/a/b-1');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Test');
    expect(res.text).toContain('Service');
  });
});
