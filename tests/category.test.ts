import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';

describe('Category Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'sjoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/categories should return all categories in the database', async () => {
      const response = await request
        .get('/api/v1/categories')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.categories.length).toBeGreaterThanOrEqual(3);
    });

    it('GET /api/v1/categories/14 should fail to return a category by not found', async () => {
      const response = await request
        .get('/api/v1/categories/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma categoria foi encontrada com o id 14'
      );
    });

    it('GET /api/v1/categories/1 should return one category by the id', async () => {
      const response = await request
        .get('/api/v1/categories/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.category).toBeTruthy();
      expect(response.body.category.title).toEqual('Alimentação');
    });

    it('POST /api/v1/categories should fail to create a new category by missing the title', async () => {
      const response = await request
        .post('/api/v1/categories')
        .send({ description: 'A new category' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe o título da categoria'
      );
    });

    it('POST /api/v1/categories should fail to create a new category by missing the description', async () => {
      const response = await request
        .post('/api/v1/categories')
        .send({ title: 'New category' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe a descrição da categoria'
      );
    });

    it('POST /api/v1/categories should successfully create a new category', async () => {
      const response = await request
        .post('/api/v1/categories')
        .send({ title: 'New category', description: 'A new category' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.category).toBeTruthy();
      expect(response.body.category.title).toEqual('New category');
    });

    it('PATCH/api/v1/categories/14 should fail to update a category by not found', async () => {
      const response = await request
        .patch('/api/v1/categories/14')
        .send({ title: 'New title', description: 'A new description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma categoria foi encontrada com o id 14'
      );
    });

    it('PATCH/api/v1/categories/14 should fail to update a category by not passing any data', async () => {
      const response = await request
        .patch('/api/v1/categories/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe um novo título ou descrição para a categoria'
      );
    });

    it('PATCH/api/v1/categories/3 should successfully update the title of a category', async () => {
      const response = await request
        .patch('/api/v1/categories/3')
        .send({ title: 'New title' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.category).toBeTruthy();
      expect(response.body.category.title).toEqual('New title');
    });

    it('PATCH/api/v1/categories/3 should successfully update the description of a category', async () => {
      const response = await request
        .patch('/api/v1/categories/3')
        .send({ description: 'A new description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.category).toBeTruthy();
      expect(response.body.category.description).toEqual('A new description');
    });

    it('DELETE/api/v1/categories/14 should fail to delete a category by not found', async () => {
      const response = await request
        .delete('/api/v1/categories/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma categoria foi encontrada com o id 14'
      );
    });

    it('DELETE/api/v1/categories/4 should successfully delete a category', async () => {
      const response = await request
        .delete('/api/v1/categories/4')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.category).toBeTruthy();
      expect(response.body.category.title).toEqual('Energia elétrica');
    });
  });

  describe('Logged in as User', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'taqqiq@gmail.com', password: 'tberlin' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/categories should return all categories in the database', async () => {
      const response = await request
        .get('/api/v1/categories')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.categories.length).toBeGreaterThanOrEqual(3);
    });

    it('GET /api/v1/categories/14 should fail to return a category by not found', async () => {
      const response = await request
        .get('/api/v1/categories/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma categoria foi encontrada com o id 14'
      );
    });

    it('GET /api/v1/categories/1 should return one category by the id', async () => {
      const response = await request
        .get('/api/v1/categories/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.category).toBeTruthy();
      expect(response.body.category.title).toEqual('Alimentação');
    });

    it('POST /api/v1/categories should fail to create a new category by being forbidden', async () => {
      const response = await request
        .post('/api/v1/categories')
        .send({ title: 'Another category', description: 'Another category' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('PATCH/api/v1/categories/3 should fail to update the title of a category by being forbidden', async () => {
      const response = await request
        .patch('/api/v1/categories/3')
        .send({ title: 'New title' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('PATCH/api/v1/categories/3 should fail to update the description of a category by being forbidden', async () => {
      const response = await request
        .patch('/api/v1/categories/3')
        .send({ description: 'A new description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('DELETE/api/v1/categories/4 should fail to delete a category by being forbidden', async () => {
      const response = await request
        .delete('/api/v1/categories/4')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/categories should return all categories in the database', async () => {
      const response = await request.get('/api/v1/categories');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.categories.length).toBeGreaterThanOrEqual(3);
    });

    it('GET /api/v1/categories/14 should fail to return a category by not found', async () => {
      const response = await request.get('/api/v1/categories/14');
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma categoria foi encontrada com o id 14'
      );
    });

    it('GET /api/v1/categories/1 should return one category by the id', async () => {
      const response = await request.get('/api/v1/categories/1');
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.category).toBeTruthy();
      expect(response.body.category.title).toEqual('Alimentação');
    });

    it('POST /api/v1/categories should fail to create a new category by being unauthorized', async () => {
      const response = await request
        .post('/api/v1/categories')
        .send({ title: 'Another category', description: 'Another category' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('PATCH/api/v1/categories/3 should fail to update the title of a category by being unauthorized', async () => {
      const response = await request
        .patch('/api/v1/categories/3')
        .send({ title: 'New title' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('PATCH/api/v1/categories/3 should fail to update the description of a category by being unauthorized', async () => {
      const response = await request
        .patch('/api/v1/categories/3')
        .send({ description: 'A new description' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('DELETE/api/v1/categories/4 should fail to delete a category by being unauthorized', async () => {
      const response = await request.delete('/api/v1/categories/4');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.category).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });
  });
});
