import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';

describe('Auth Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as User', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'taqqiq@gmail.com', password: 'tberlin' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/auth/user should successfully return the user info', async () => {
      const response = await request
        .get('/api/v1/auth/user')
        .set({ Authorization: token });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
      expect(response.body.token).toBeTruthy();
      expect(response.body.err).toBeFalsy();
    });
  });

  describe('Logged out', () => {
    it('POST /api/v1/auth/register should fail to create an account by missing the name', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        email: 'test@gmail.com',
        password: 'Test',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(
        'O nome deve conter de 8 a 40 caracteres'
      );
    });

    it('POST /api/v1/auth/register should fail to create an account by invalid name', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        name: 'test',
        email: 'test@gmail.com',
        password: 'Test',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(
        'O nome deve conter de 8 a 40 caracteres'
      );
    });

    it('POST /api/v1/auth/register should fail to create an account by name in use', async () => {
      const name = 'Syntyche Joann';

      const response = await request.post('/api/v1/auth/register').send({
        name,
        email: 'test@gmail.com',
        password: 'Test',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(`O nome ${name} já está em uso`);
    });

    it('POST /api/v1/auth/register should fail to create an account by missing the email', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        name: 'testingUser',
        password: 'Test',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual('O e-mail undefined está incorreto');
    });

    it('POST /api/v1/auth/register should fail to create an account by invalid email', async () => {
      const email = 'test@';

      const response = await request.post('/api/v1/auth/register').send({
        name: 'testingUser',
        email,
        password: 'Test',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(`O e-mail ${email} está incorreto`);
    });

    it('POST /api/v1/auth/register should fail to create an account by email in use', async () => {
      const email = 'syntyche@gmail.com';

      const response = await request.post('/api/v1/auth/register').send({
        name: 'testingUser',
        email,
        password: 'Test',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(`O e-mail ${email} já está em uso`);
    });

    it('POST /api/v1/auth/register should fail to create an account by missing the password', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        name: 'testingUser',
        email: 'test@gmail.com',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual('Por favor, informe uma senha');
    });

    it('POST /api/v1/auth/register should successfully create an account', async () => {
      const response = await request.post('/api/v1/auth/register').send({
        name: 'testingUser',
        email: 'test@gmail.com',
        password: 'Test',
      });

      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.user).toBeTruthy();
      expect(response.body.token).toBeTruthy();
      expect(response.body.err).toBeFalsy();
    });

    it('POST /api/v1/auth/login should fail to login by user not found', async () => {
      const email = 'test2@gmail.com';

      const response = await request.post('/api/v1/auth/login').send({
        email,
        password: 'testPassword',
      });

      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(
        `Nenhum usuário foi encontrado com o e-mail ${email}`
      );
    });

    it('POST /api/v1/auth/login should fail to login by not providing an email', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        password: 'password',
      });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual('Por favor, informe o seu e-mail');
    });

    it('POST /api/v1/auth/login should fail to login by providing an invalid email', async () => {
      const email = 'invalidEmail@';
      const response = await request.post('/api/v1/auth/login').send({
        email,
        password: 'password',
      });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(`O e-mail ${email} está incorreto`);
    });

    it('POST /api/v1/auth/login should fail to login by not providing a password', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'test2@gmail.com',
      });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual('Por favor, informe a sua senha');
    });

    it('POST /api/v1/auth/login should fail to login by incorrect password', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'taqqiq@gmail.com',
        password: 'wrongPassword',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual('A senha está incorreta');
    });

    it('POST /api/v1/auth/login should successfully log in the user', async () => {
      const response = await request.post('/api/v1/auth/login').send({
        email: 'taqqiq@gmail.com',
        password: 'tberlin',
      });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
      expect(response.body.token).toBeTruthy();
      expect(response.body.err).toBeFalsy();
    });

    it('GET /api/v1/auth/user should fail to return the user info by unauthorized', async () => {
      const response = await request.get('/api/v1/auth/user');

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });
  });
});
