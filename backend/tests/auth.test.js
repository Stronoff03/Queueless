const request = require('supertest');
const { app } = require('../server');
const { pool } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../db', () => ({
  pool: {
    query: jest.fn(),
    getConnection: jest.fn()
  },
  testConnection: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if email or password is missing', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.statusCode).toEqual(400);
    });

    it('should return 404 if user not found', async () => {
      pool.query.mockResolvedValue([[]]);
      const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'password' });
      expect(res.statusCode).toEqual(404);
    });

    it('should return 200 and token on success', async () => {
      const mockUser = { id: '1', email: 'test@test.com', password: 'hashedpassword', role: 'customer' };
      pool.query.mockResolvedValue([[mockUser]]);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'password' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token', 'mockToken');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if missing fields', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.statusCode).toEqual(400);
    });

    it('should register successfully', async () => {
      pool.query.mockResolvedValue([[]]); // email not existing
      bcrypt.hash.mockResolvedValue('hashedpassword');
      jwt.sign.mockReturnValue('mockToken');

      const res = await request(app).post('/api/auth/register').send({
        name: 'John',
        email: 'john@test.com',
        password: 'password',
        role: 'customer'
      });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token', 'mockToken');
    });
  });
});
