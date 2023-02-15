import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';
import { currencyFormatter, MIN_VALUE, MAX_VALUE } from '../utils/currency';

describe('Revenue Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'sjoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/revenues should return all revenues in the database', async () => {
      const response = await request
        .get('/api/v1/revenues')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.revenues.length).toBeGreaterThanOrEqual(5);
    });

    it('GET /api/v1/revenues/14 should fail to return a revenue by not found', async () => {
      const response = await request
        .get('/api/v1/revenues/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma receita foi encontrada com o id 14'
      );
    });

    it('GET /api/v1/revenues/3 should return one revenue by the id', async () => {
      const response = await request
        .get('/api/v1/revenues/3')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.revenue).toBeTruthy();
      expect(response.body.revenue.value).toEqual('2000');
    });

    it('POST /api/v1/revenues should fail to create a new revenue by missing the value', async () => {
      const response = await request
        .post('/api/v1/revenues')
        .send({ description: 'New revenue' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe o valor da receita'
      );
    });

    it('POST /api/v1/revenues should fail to create a new revenue by providing a value too small', async () => {
      const response = await request
        .post('/api/v1/revenues')
        .send({ value: -1, description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor de uma receita precisa ser superior a ${currencyFormatter.format(
          MIN_VALUE
        )}`
      );
    });

    it('POST /api/v1/revenues should fail to create a new revenue by providing a value too large', async () => {
      const response = await request
        .post('/api/v1/revenues')
        .send({ value: 10000000000000000, description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor máximo para uma receita é de R$ ${currencyFormatter.format(
          MAX_VALUE
        )}`
      );
    });

    it('POST /api/v1/revenues should fail to create a new revenue by missing the description', async () => {
      const response = await request
        .post('/api/v1/revenues')
        .send({ value: 200 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe uma descrição para a receita'
      );
    });

    it('POST /api/v1/revenues should successfully create a new revenue', async () => {
      const response = await request
        .post('/api/v1/revenues')
        .send({ value: 2000, description: 'New revenue' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.revenue).toBeTruthy();
      expect(response.body.revenue.value).toEqual('2000');
    });

    it('PATCH /api/v1/revenues/1 should fail to update a revenue by missing a value, description and date', async () => {
      const response = await request
        .patch('/api/v1/revenues/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe um novo valor, descrição ou data para a receita'
      );
    });

    it('PATCH /api/v1/revenues/14 should fail to update a revenue by not found', async () => {
      const response = await request
        .patch('/api/v1/revenues/14')
        .send({ value: 3000 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma receita foi encontrada com o id 14'
      );
    });

    it('PATCH /api/v1/revenues/1 should fail to update a revenue by providing a value too small', async () => {
      const response = await request
        .patch('/api/v1/revenues/1')
        .send({ value: -1 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor de uma receita precisa ser superior a ${currencyFormatter.format(
          MIN_VALUE
        )}`
      );
    });

    it('PATCH /api/v1/revenues/1 should fail to create a new revenue by providing a value too large', async () => {
      const response = await request
        .patch('/api/v1/revenues/1')
        .send({ value: 10000000000000000, description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor máximo para uma receita é de R$ ${currencyFormatter.format(
          MAX_VALUE
        )}`
      );
    });

    it('PATCH /api/v1/revenues/1 should successfully update the value of a revenue created by the user', async () => {
      const response = await request
        .patch('/api/v1/revenues/1')
        .send({ value: 200 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.revenue).toBeTruthy();
      expect(response.body.revenue.value).toEqual('200');
    });

    it('PATCH /api/v1/revenues/1 should successfully update the description of a revenue created by the user', async () => {
      const response = await request
        .patch('/api/v1/revenues/1')
        .send({ description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.revenue).toBeTruthy();
      expect(response.body.revenue.description).toEqual('Description');
    });

    it('PATCH /api/v1/revenues/1 should successfully update the date of a revenue created by the user', async () => {
      const newDate = new Date();
      const response = await request
        .patch('/api/v1/revenues/1')
        .send({ date: newDate })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.revenue).toBeTruthy();
      expect(new Date(response.body.revenue.date)).toEqual(newDate);
    });

    it('PATCH /api/v1/revenues/4 should fail to update the value of a revenue created by another user', async () => {
      const response = await request
        .patch('/api/v1/revenues/4')
        .send({ value: 300 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('DELETE /api/v1/revenues/14 should fail to delete a revenue by not found', async () => {
      const response = await request
        .delete('/api/v1/revenues/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma receita foi encontrada com o id 14'
      );
    });

    it('DELETE /api/v1/revenues/2 should successfully delete a revenue created by the user', async () => {
      const response = await request
        .delete('/api/v1/revenues/2')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.revenue).toBeTruthy();
      expect(response.body.revenue.value).toEqual('400.99');
    });

    it('DELETE /api/v1/revenues/7 should successfully delete a revenue created by another user', async () => {
      const response = await request
        .delete('/api/v1/revenues/7')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.revenue).toBeTruthy();
      expect(response.body.revenue.value).toEqual('6000');
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

    it('GET /api/v1/revenues should return all revenues of the user', async () => {
      const response = await request
        .get('/api/v1/revenues')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.revenues.length).toBeLessThanOrEqual(3);
    });

    it('GET /api/v1/revenues/14 should fail to return a revenue by not found', async () => {
      const response = await request
        .get('/api/v1/revenues/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma receita foi encontrada com o id 14'
      );
    });

    it('GET /api/v1/revenues/1 should fail to return a revenue by forbidden', async () => {
      const response = await request
        .get('/api/v1/revenues/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('GET /api/v1/revenues/3 should return one revenue by the id', async () => {
      const response = await request
        .get('/api/v1/revenues/3')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.revenue).toBeTruthy();
      expect(response.body.revenue.value).toEqual('2000');
    });

    it('POST /api/v1/revenues should fail to create a new revenue by missing the value', async () => {
      const response = await request
        .post('/api/v1/revenues')
        .send({ description: 'New revenue' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe o valor da receita'
      );
    });

    it('POST /api/v1/revenues should fail to create a new revenue by providing a value too small', async () => {
      const response = await request
        .post('/api/v1/revenues')
        .send({ value: -1, description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor de uma receita precisa ser superior a ${currencyFormatter.format(
          MIN_VALUE
        )}`
      );
    });

    it('POST /api/v1/revenues should fail to create a new revenue by providing a value too large', async () => {
      const response = await request
        .post('/api/v1/revenues')
        .send({ value: 10000000000000000, description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor máximo para uma receita é de R$ ${currencyFormatter.format(
          MAX_VALUE
        )}`
      );
    });

    it('POST /api/v1/revenues should fail to create a new revenue by missing the description', async () => {
      const response = await request
        .post('/api/v1/revenues')
        .send({ value: 200 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe uma descrição para a receita'
      );
    });

    it('POST /api/v1/revenues should successfully create a new revenue', async () => {
      const response = await request
        .post('/api/v1/revenues')
        .send({ value: 2000, description: 'New revenue' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.revenue).toBeTruthy();
      expect(response.body.revenue.value).toEqual('2000');
    });

    it('PATCH /api/v1/revenues/4 should fail to update a revenue by missing a value, description and date', async () => {
      const response = await request
        .patch('/api/v1/revenues/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe um novo valor, descrição ou data para a receita'
      );
    });

    it('PATCH /api/v1/revenues/14 should fail to update a revenue by not found', async () => {
      const response = await request
        .patch('/api/v1/revenues/14')
        .send({ value: 3000 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma receita foi encontrada com o id 14'
      );
    });

    it('PATCH /api/v1/revenues/4 should fail to update a revenue by providing a value too small', async () => {
      const response = await request
        .patch('/api/v1/revenues/4')
        .send({ value: -1 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor de uma receita precisa ser superior a ${currencyFormatter.format(
          MIN_VALUE
        )}`
      );
    });

    it('PATCH /api/v1/revenues/4 should fail to create a new revenue by providing a value too large', async () => {
      const response = await request
        .patch('/api/v1/revenues/4')
        .send({ value: 10000000000000000, description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor máximo para uma receita é de R$ ${currencyFormatter.format(
          MAX_VALUE
        )}`
      );
    });

    it('PATCH /api/v1/revenues/4 should successfully update the value of a revenue created by the user', async () => {
      const response = await request
        .patch('/api/v1/revenues/4')
        .send({ value: 1500 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.revenue).toBeTruthy();
      expect(response.body.revenue.value).toEqual('1500');
    });

    it('PATCH /api/v1/revenues/4 should successfully update the description of a revenue created by the user', async () => {
      const response = await request
        .patch('/api/v1/revenues/4')
        .send({ description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.revenue).toBeTruthy();
      expect(response.body.revenue.description).toEqual('Description');
    });

    it('PATCH /api/v1/revenues/4 should successfully update the date of a revenue created by the user', async () => {
      const newDate = new Date();
      const response = await request
        .patch('/api/v1/revenues/4')
        .send({ date: newDate })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.revenue).toBeTruthy();
      expect(new Date(response.body.revenue.date)).toEqual(newDate);
    });

    it('PATCH /api/v1/revenues/6 should fail to update the value of a revenue created by another user', async () => {
      const response = await request
        .patch('/api/v1/revenues/6')
        .send({ value: 300 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('DELETE /api/v1/revenues/14 should fail to delete a revenue by not found', async () => {
      const response = await request
        .delete('/api/v1/revenues/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma receita foi encontrada com o id 14'
      );
    });

    it('DELETE /api/v1/revenues/5 should successfully delete a revenue created by the user', async () => {
      const response = await request
        .delete('/api/v1/revenues/5')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.revenue).toBeTruthy();
      expect(response.body.revenue.value).toEqual('20');
    });

    it('DELETE /api/v1/revenues/6 should fail to delete a revenue created by another user', async () => {
      const response = await request
        .delete('/api/v1/revenues/6')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.revenue).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/revenues should fail to return any revenues by unauthorized', async () => {
      const response = await request.get('/api/v1/revenues');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.revenues).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('GET /api/v1/revenues/14 should fail to return a revenue by unauthorized', async () => {
      const response = await request.get('/api/v1/revenues/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.revenues).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('POST /api/v1/revenues should fail to create a new revenue by unauthorized', async () => {
      const response = await request.post('/api/v1/revenues');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.revenues).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('PATCH /api/v1/revenues/1 should fail to update a revenue by unauthorized', async () => {
      const response = await request.patch('/api/v1/revenues/1');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.revenues).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('DELETE /api/v1/revenues/14 should fail to delete a revenue by unauthorized', async () => {
      const response = await request.delete('/api/v1/revenues/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.revenues).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });
  });
});
