import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';
import { currencyFormatter, MIN_VALUE, MAX_VALUE } from '../utils/currency';

describe('Expense Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'syntyche@gmail.com', password: 'sjoann' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/expenses should return all expenses in the database', async () => {
      const response = await request
        .get('/api/v1/expenses')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expenses.length).toBeGreaterThanOrEqual(4);
    });

    it('GET /api/v1/expenses/14 should fail to return an expense by not found', async () => {
      const response = await request
        .get('/api/v1/expenses/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma despesa foi encontrada com o id 14'
      );
    });

    it('GET /api/v1/expenses/3 should return one expense by the id', async () => {
      const response = await request
        .get('/api/v1/expenses/3')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.value).toEqual('2000');
    });

    it('POST /api/v1/expenses should fail to create a new expense by providing a value too small', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({ value: -1, description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor de uma despesa precisa ser superior a ${currencyFormatter.format(
          MIN_VALUE
        )}`
      );
    });

    it('POST /api/v1/expenses should fail to create a new expense by providing a value too large', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({ value: 10000000000000000, description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor máximo para uma despesa é de R$ ${currencyFormatter.format(
          MAX_VALUE
        )}`
      );
    });

    it('POST /api/v1/expenses should fail to create a new expense by missing the value', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({ description: 'New expense', categoryId: 5 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe o valor e a descrição da despesa'
      );
    });

    it('POST /api/v1/expenses should fail to create a new expense by missing the description', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({ value: 2000, categoryId: 5 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe o valor e a descrição da despesa'
      );
    });

    it('POST /api/v1/expenses should fail to create a new expense by missing the category id', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({ value: 2000, description: 'New expense' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe a categoria da despesa'
      );
    });

    it('POST /api/v1/expenses should fail to create a new expense by providing an invalid category id', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({ value: 2000, description: 'New expense', categoryId: 20 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma categoria foi encontrada com o id 20'
      );
    });

    it('POST /api/v1/expenses should successfully create a new expense', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({
          value: 2000,
          description: 'New expense',
          isEssential: true,
          categoryId: 5,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.value).toEqual('2000');
      expect(response.body.expense.isEssential).toEqual(true);
    });

    it('PATCH /api/v1/expenses/1 should fail to update an expense by missing a value, category id, type, description and date', async () => {
      const response = await request
        .patch('/api/v1/expenses/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe um novo valor, tipo, categoria, descrição ou data para a despesa'
      );
    });

    it('PATCH /api/v1/expenses/14 should fail to update an expense by not found', async () => {
      const response = await request
        .patch('/api/v1/expenses/14')
        .send({ value: 3000 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma despesa foi encontrada com o id 14'
      );
    });

    it('PATCH /api/v1/expenses/4 should fail to update the category id of a expense by not found', async () => {
      const response = await request
        .patch('/api/v1/expenses/4')
        .send({ categoryId: 14 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma categoria foi encontrada com o id 14'
      );
    });

    it('PATCH /api/v1/expenses/1 should fail to update a expense by providing a value too small', async () => {
      const response = await request
        .patch('/api/v1/expenses/1')
        .send({ value: -1 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor de uma despesa precisa ser superior a ${currencyFormatter.format(
          MIN_VALUE
        )}`
      );
    });

    it('PATCH /api/v1/expenses/1 should fail to create a new expense by providing a value too large', async () => {
      const response = await request
        .patch('/api/v1/expenses/1')
        .send({ value: 10000000000000000, description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor máximo para uma despesa é de R$ ${currencyFormatter.format(
          MAX_VALUE
        )}`
      );
    });

    it('PATCH /api/v1/expenses/1 should successfully update the value of an expense created by the user', async () => {
      const response = await request
        .patch('/api/v1/expenses/1')
        .send({ value: 200 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.value).toEqual('200');
    });

    it('PATCH /api/v1/expenses/2 should successfully update the category id of an expense created by the user', async () => {
      const response = await request
        .patch('/api/v1/expenses/2')
        .send({ categoryId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.category.title).toEqual('Educação');
    });

    it('PATCH /api/v1/expenses/2 should successfully update the type of an expense created by the user', async () => {
      const response = await request
        .patch('/api/v1/expenses/2')
        .send({ isEssential: true })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.isEssential).toEqual(true);
    });

    it('PATCH /api/v1/expenses/2 should successfully update the description of an expense created by the user', async () => {
      const response = await request
        .patch('/api/v1/expenses/2')
        .send({ description: 'New description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.description).toEqual('New description');
    });

    it('PATCH /api/v1/expenses/2 should successfully update the date of an expense created by the user', async () => {
      const newDate = new Date();
      const response = await request
        .patch('/api/v1/expenses/2')
        .send({ date: newDate })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(new Date(response.body.expense.date)).toEqual(newDate);
    });

    it('PATCH /api/v1/expenses/4 should fail to update the value of an expense created by another user', async () => {
      const response = await request
        .patch('/api/v1/expenses/4')
        .send({ value: 300 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('DELETE /api/v1/expenses/14 should fail to delete an expense by not found', async () => {
      const response = await request
        .delete('/api/v1/expenses/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma despesa foi encontrada com o id 14'
      );
    });

    it('DELETE /api/v1/expenses/2 should successfully delete an expense created by the user', async () => {
      const response = await request
        .delete('/api/v1/expenses/2')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.value).toEqual('400.99');
    });

    it('DELETE /api/v1/expenses/7 should successfully delete an expense created by another user', async () => {
      const response = await request
        .delete('/api/v1/expenses/7')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.value).toEqual('6000');
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

    it('GET /api/v1/expenses should return all expenses of the user', async () => {
      const response = await request
        .get('/api/v1/expenses')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expenses.length).toBeLessThanOrEqual(3);
    });

    it('GET /api/v1/expenses/14 should fail to return an expense by not found', async () => {
      const response = await request
        .get('/api/v1/expenses/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma despesa foi encontrada com o id 14'
      );
    });

    it('GET /api/v1/expenses/1 should fail to return an expense by forbidden', async () => {
      const response = await request
        .get('/api/v1/expenses/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('GET /api/v1/expenses/3 should return one expense by the id', async () => {
      const response = await request
        .get('/api/v1/expenses/3')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.value).toEqual('2000');
    });

    it('POST /api/v1/expenses should fail to create a new expense by providing a value too small', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({ value: -1, description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor de uma despesa precisa ser superior a ${currencyFormatter.format(
          MIN_VALUE
        )}`
      );
    });

    it('POST /api/v1/expenses should fail to create a new expense by providing a value too large', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({ value: 10000000000000000, description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor máximo para uma despesa é de R$ ${currencyFormatter.format(
          MAX_VALUE
        )}`
      );
    });

    it('POST /api/v1/expenses should fail to create a new expense by missing the value', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({ description: 'New expense', categoryId: 5 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe o valor e a descrição da despesa'
      );
    });

    it('POST /api/v1/expenses should fail to create a new expense by missing the description', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({ value: 2000, categoryId: 5 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe o valor e a descrição da despesa'
      );
    });

    it('POST /api/v1/expenses should fail to create a new expense by missing the category id', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({ value: 2000, description: 'New expense' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe a categoria da despesa'
      );
    });

    it('POST /api/v1/expenses should fail to create a new expense by providing an invalid category id', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({ value: 2000, description: 'New expense', categoryId: 20 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma categoria foi encontrada com o id 20'
      );
    });

    it('POST /api/v1/expenses should successfully create a new expense', async () => {
      const response = await request
        .post('/api/v1/expenses')
        .send({
          value: 2000,
          description: 'New expense',
          categoryId: 5,
        })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.value).toEqual('2000');
      expect(response.body.expense.isEssential).toEqual(false);
    });

    it('PATCH /api/v1/expenses/1 should fail to update an expense by missing a value, category id, description, type and date', async () => {
      const response = await request
        .patch('/api/v1/expenses/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Por favor, informe um novo valor, tipo, categoria, descrição ou data para a despesa'
      );
    });

    it('PATCH /api/v1/expenses/14 should fail to update an expense by not found', async () => {
      const response = await request
        .patch('/api/v1/expenses/14')
        .send({ value: 3000 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma despesa foi encontrada com o id 14'
      );
    });

    it('PATCH /api/v1/expenses/4 should fail to update the category id of a expense by not found', async () => {
      const response = await request
        .patch('/api/v1/expenses/4')
        .send({ categoryId: 14 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma categoria foi encontrada com o id 14'
      );
    });

    it('PATCH /api/v1/expenses/4 should fail to update a expense by providing a value too small', async () => {
      const response = await request
        .patch('/api/v1/expenses/4')
        .send({ value: -1 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor de uma despesa precisa ser superior a ${currencyFormatter.format(
          MIN_VALUE
        )}`
      );
    });

    it('PATCH /api/v1/expenses/4 should fail to create a new expense by providing a value too large', async () => {
      const response = await request
        .patch('/api/v1/expenses/4')
        .send({ value: 10000000000000000, description: 'Description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        `O valor máximo para uma despesa é de R$ ${currencyFormatter.format(
          MAX_VALUE
        )}`
      );
    });

    it('PATCH /api/v1/expenses/4 should successfully update the value of an expense created by the user', async () => {
      const response = await request
        .patch('/api/v1/expenses/4')
        .send({ value: 600 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.value).toEqual('600');
    });

    it('PATCH /api/v1/expenses/4 should successfully update the category id of an expense created by the user', async () => {
      const response = await request
        .patch('/api/v1/expenses/4')
        .send({ categoryId: 2 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.category.title).toEqual('Educação');
    });

    it('PATCH /api/v1/expenses/4 should successfully update the type of an expense created by the user', async () => {
      const response = await request
        .patch('/api/v1/expenses/4')
        .send({ isEssential: true })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.isEssential).toEqual(true);
    });

    it('PATCH /api/v1/expenses/4 should successfully update the description of an expense created by the user', async () => {
      const response = await request
        .patch('/api/v1/expenses/4')
        .send({ description: 'New description' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.description).toEqual('New description');
    });

    it('PATCH /api/v1/expenses/4 should successfully update the date of an expense created by the user', async () => {
      const newDate = new Date();
      const response = await request
        .patch('/api/v1/expenses/4')
        .send({ date: newDate })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(new Date(response.body.expense.date)).toEqual(newDate);
    });

    it('PATCH /api/v1/expenses/1 should fail to update the value of an expense created by another user', async () => {
      const response = await request
        .patch('/api/v1/expenses/1')
        .send({ value: 300 })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('DELETE /api/v1/expenses/14 should fail to delete an expense by not found', async () => {
      const response = await request
        .delete('/api/v1/expenses/14')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Nenhuma despesa foi encontrada com o id 14'
      );
    });

    it('DELETE /api/v1/expenses/5 should successfully delete an expense created by the user', async () => {
      const response = await request
        .delete('/api/v1/expenses/5')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.expense).toBeTruthy();
      expect(response.body.expense.value).toEqual('20');
    });

    it('DELETE /api/v1/expenses/6 should fail to delete an expense created by another user by forbidden', async () => {
      const response = await request
        .delete('/api/v1/expenses/6')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.expense).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });
  });

  describe('Logged out', () => {
    it('GET /api/v1/expenses should fail to return any expenses by unauthorized', async () => {
      const response = await request.get('/api/v1/expenses');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.expenses).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('GET /api/v1/expenses/14 should fail to return an expense by unauthorized', async () => {
      const response = await request.get('/api/v1/expenses/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.expenses).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('POST /api/v1/expenses should fail to create a new revexpense by unauthorized', async () => {
      const response = await request.post('/api/v1/expenses');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.expenses).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('PATCH /api/v1/expenses/1 should fail to update an expense by unauthorized', async () => {
      const response = await request.patch('/api/v1/expenses/1');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.expenses).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('DELETE /api/v1/expenses/14 should fail to delete an expense by unauthorized', async () => {
      const response = await request.delete('/api/v1/expenses/14');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.expenses).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });
  });
});
