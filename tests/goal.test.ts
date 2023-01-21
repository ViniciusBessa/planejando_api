import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';

describe('Goal Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'sjoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/goals should return all goals in the database', async () => {
      const response = await request
        .get('/api/v1/goals')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.goals.length).toBeGreaterThanOrEqual(4);
    });

    it('GET /api/v1/goals/14 should fail to return a goal by not found', async () => {
      const response = await request
        .get('/api/v1/goals/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma meta foi encontrada com o id 14'
      );
    });

    it('GET /api/v1/goals/3 should return one goal by the id', async () => {
      const response = await request
        .get('/api/v1/goals/3')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.goal).toBeTruthy();
      expect(response.body.goal.value).toEqual('2000');
    });

    it('POST /api/v1/goals should fail to create a new goal by missing the value', async () => {
      const response = await request
        .post('/api/v1/goals')
        .send({ categoryId: 5 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual('Por favor, informe o limite da meta');
    });

    it('POST /api/v1/goals should fail to create a new goal by missing the category id', async () => {
      const response = await request
        .post('/api/v1/goals')
        .send({ value: 2000 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe a categoria da meta'
      );
    });

    it('POST /api/v1/goals should fail to create a new goal by providing an invalid category id', async () => {
      const response = await request
        .post('/api/v1/goals')
        .send({ value: 2000, categoryId: 20 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma categoria foi encontrada com o id 20'
      );
    });

    it('POST /api/v1/goals should fail to create a new goal by already having a goal in the category', async () => {
      const response = await request
        .post('/api/v1/goals')
        .send({ value: 2000, categoryId: 1 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você só pode ter uma meta por categoria'
      );
    });

    it('POST /api/v1/goals should successfully create a new goal', async () => {
      const response = await request
        .post('/api/v1/goals')
        .send({ value: 2000, categoryId: 5 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.goal).toBeTruthy();
      expect(response.body.goal.value).toEqual('2000');
      expect(response.body.goal.category.title).toEqual('Investimentos');
    });

    it('PATCH /api/v1/goals/1 should fail to update a goal by missing a value and category id', async () => {
      const response = await request
        .patch('/api/v1/goals/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe um novo limite ou categoria para a meta'
      );
    });

    it('PATCH /api/v1/goals/14 should fail to update a goal by not found', async () => {
      const response = await request
        .patch('/api/v1/goals/14')
        .send({ value: 3000 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma meta foi encontrada com o id 14'
      );
    });

    it('PATCH /api/v1/goals/1 should successfully update the value of a goal created by the user', async () => {
      const response = await request
        .patch('/api/v1/goals/1')
        .send({ value: 200 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.goal).toBeTruthy();
      expect(response.body.goal.value).toEqual('200');
    });

    it('PATCH /api/v1/goals/1 should successfully update the category id of a goal created by the user', async () => {
      const response = await request
        .patch('/api/v1/goals/1')
        .send({ categoryId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.goal).toBeTruthy();
      expect(response.body.goal.category.title).toEqual('Educação');
    });

    it('PATCH /api/v1/goals/4 should fail to update the value of a goal created by another user', async () => {
      const response = await request
        .patch('/api/v1/goals/4')
        .send({ value: 300 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('DELETE /api/v1/goals/14 should fail to delete a goal by not found', async () => {
      const response = await request
        .delete('/api/v1/goals/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma meta foi encontrada com o id 14'
      );
    });

    it('DELETE /api/v1/goals/2 should successfully delete a goal created by the user', async () => {
      const response = await request
        .delete('/api/v1/goals/2')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.goal).toBeTruthy();
      expect(response.body.goal.value).toEqual('400.99');
    });

    it('DELETE /api/v1/goals/7 should successfully delete a goal created by another user', async () => {
      const response = await request
        .delete('/api/v1/goals/7')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.goal).toBeTruthy();
      expect(response.body.goal.value).toEqual('6000');
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

    it('GET /api/v1/goals should return all goals of the user', async () => {
      const response = await request
        .get('/api/v1/goals')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.goals.length).toBeLessThanOrEqual(3);
    });

    it('GET /api/v1/goals/14 should fail to return a goal by not found', async () => {
      const response = await request
        .get('/api/v1/goals/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma meta foi encontrada com o id 14'
      );
    });

    it('GET /api/v1/goals/1 should fail to return a goal by forbidden', async () => {
      const response = await request
        .get('/api/v1/goals/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('GET /api/v1/goals/3 should return one goal by the id', async () => {
      const response = await request
        .get('/api/v1/goals/3')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.goal).toBeTruthy();
      expect(response.body.goal.value).toEqual('2000');
    });

    it('POST /api/v1/goals should fail to create a new goal by missing the value', async () => {
      const response = await request
        .post('/api/v1/goals')
        .send({ categoryId: 5 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual('Por favor, informe o limite da meta');
    });

    it('POST /api/v1/goals should fail to create a new goal by missing the category id', async () => {
      const response = await request
        .post('/api/v1/goals')
        .send({ value: 2000 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe a categoria da meta'
      );
    });

    it('POST /api/v1/goals should fail to create a new goal by providing an invalid category id', async () => {
      const response = await request
        .post('/api/v1/goals')
        .send({ value: 2000, categoryId: 20 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma categoria foi encontrada com o id 20'
      );
    });

    it('POST /api/v1/goals should fail to create a new goal by already having a goal in the category', async () => {
      const response = await request
        .post('/api/v1/goals')
        .send({ value: 2000, categoryId: 1 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você só pode ter uma meta por categoria'
      );
    });

    it('POST /api/v1/goals should successfully create a new goal', async () => {
      const response = await request
        .post('/api/v1/goals')
        .send({ value: 2000, categoryId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.goal).toBeTruthy();
      expect(response.body.goal.value).toEqual('2000');
      expect(response.body.goal.category.title).toEqual('Educação');
    });

    it('PATCH /api/v1/goals/1 should fail to update a goal by missing a value and category id', async () => {
      const response = await request
        .patch('/api/v1/goals/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe um novo limite ou categoria para a meta'
      );
    });

    it('PATCH /api/v1/goals/14 should fail to update a goal by not found', async () => {
      const response = await request
        .patch('/api/v1/goals/14')
        .send({ value: 3000 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma meta foi encontrada com o id 14'
      );
    });

    it('PATCH /api/v1/goals/4 should successfully update the value of a goal created by the user', async () => {
      const response = await request
        .patch('/api/v1/goals/4')
        .send({ value: 200 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.goal).toBeTruthy();
      expect(response.body.goal.value).toEqual('200');
    });

    it('PATCH /api/v1/goals/4 should fail to update the category id of a goal by not found', async () => {
      const response = await request
        .patch('/api/v1/goals/4')
        .send({ categoryId: 14 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma categoria foi encontrada com o id 14'
      );
    });

    it('PATCH /api/v1/goals/4 should successfully update the category id of a goal created by the user', async () => {
      const response = await request
        .patch('/api/v1/goals/4')
        .send({ categoryId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.goal).toBeTruthy();
      expect(response.body.goal.category.title).toEqual('Educação');
    });

    it('PATCH /api/v1/goals/1 should fail to update the value of a goal created by another user', async () => {
      const response = await request
        .patch('/api/v1/goals/1')
        .send({ value: 300 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('DELETE /api/v1/goals/14 should fail to delete a goal by not found', async () => {
      const response = await request
        .delete('/api/v1/goals/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma meta foi encontrada com o id 14'
      );
    });

    it('DELETE /api/v1/goals/5 should successfully delete a goal created by the user', async () => {
      const response = await request
        .delete('/api/v1/goals/5')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.goal).toBeTruthy();
      expect(response.body.goal.value).toEqual('20');
    });

    it('DELETE /api/v1/goals/6 should fail to delete a goal created by another user', async () => {
      const response = await request
        .delete('/api/v1/goals/6')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.goal).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/goals should fail to return any goals by unauthorized', async () => {
      const response = await request.get('/api/v1/goals');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.goals).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('GET /api/v1/goals/14 should fail to return a goal by unauthorized', async () => {
      const response = await request.get('/api/v1/goals/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.goals).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('POST /api/v1/goals should fail to create a new goal by unauthorized', async () => {
      const response = await request.post('/api/v1/goals');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.goals).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('PATCH /api/v1/goals/1 should fail to update a goal by unauthorized', async () => {
      const response = await request.patch('/api/v1/goals/1');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.goals).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('DELETE /api/v1/goals/14 should fail to delete a goal by unauthorized', async () => {
      const response = await request.delete('/api/v1/goals/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.goals).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });
  });
});
