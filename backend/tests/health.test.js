const request = require('supertest');
const { app } = require('../server');
// Mock the db testConnection since we don't want it to run during supertest
jest.mock('../db', () => ({
  pool: {
    query: jest.fn(),
    getConnection: jest.fn(),
  },
  testConnection: jest.fn(),
}));

describe('Health Endpoint', () => {
  it('should return 200 and ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
