import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';

describe('NotFound Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  it('GET /api/v1/somepath should return an error 404', async () => {
    const response = await request.get('/api/v1/somepath');
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
});
