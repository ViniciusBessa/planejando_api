import { StatusCodes } from 'http-status-codes';
import supertest, { SuperTest, Test } from 'supertest';
import app from '../app';

describe('Revenue Endpoints', () => {
  const request: SuperTest<Test> = supertest(app);

  describe('Logged in as Admin', () => {
    let token: string;
    let resetToken: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'richard@gmail.com', password: 'rastrid' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/users should return all users in the database', async () => {
      const response = await request
        .get('/api/v1/users')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.users.length).toBeGreaterThanOrEqual(5);
    });

    it('GET /api/v1/users/1 should return an user entry', async () => {
      const response = await request
        .get('/api/v1/users/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user.name).toEqual('Syntyche Joann');
      expect(response.body.user.email).toEqual('syntyche@gmail.com');
      expect(response.body.user.password).toBeFalsy();
    });

    it('PATCH /api/v1/users/account/name should fail to update the name by missing the new name', async () => {
      const response = await request
        .patch('/api/v1/users/account/name')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe o novo nome');
    });

    it('PATCH /api/v1/users/account/name should fail to update the name by invalid name', async () => {
      const response = await request
        .patch('/api/v1/users/account/name')
        .send({ newName: 'Name' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(
        'O nome deve conter de 8 a 40 caracteres'
      );
    });

    it('PATCH /api/v1/users/account/name should fail to update the name by already in use', async () => {
      const response = await request
        .patch('/api/v1/users/account/name')
        .send({ newName: 'Taqqiq Berlin' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('O nome Taqqiq Berlin já está em uso');
    });

    it('PATCH /api/v1/users/account/name should successfully update the name', async () => {
      const response = await request
        .patch('/api/v1/users/account/name')
        .send({ newName: 'A new name' })
        .set({ Authorization: token });
      token = 'Bearer ' + response.body.token;
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user.name).toEqual('A new name');
    });

    it('PATCH /api/v1/users/account/email should fail to update the name by missing the new email', async () => {
      const response = await request
        .patch('/api/v1/users/account/email')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe o novo e-mail');
    });

    it('PATCH /api/v1/users/account/email should fail to update the email by invalid email', async () => {
      const response = await request
        .patch('/api/v1/users/account/email')
        .send({ newEmail: 'email@' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('O e-mail email@ está incorreto');
    });

    it('PATCH /api/v1/users/account/email should fail to update the email by already in use', async () => {
      const response = await request
        .patch('/api/v1/users/account/email')
        .send({ newEmail: 'syntyche@gmail.com' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(
        'O e-mail syntyche@gmail.com já está em uso'
      );
    });

    it('PATCH /api/v1/users/account/email should successfully update the email', async () => {
      const response = await request
        .patch('/api/v1/users/account/email')
        .send({ newEmail: 'myNewEmail@gmail.com' })
        .set({ Authorization: token });
      token = 'Bearer ' + response.body.token;
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user.email).toEqual('myNewEmail@gmail.com');
    });

    it('PATCH /api/v1/users/account/password should fail to update the password by missing the new password', async () => {
      const response = await request
        .patch('/api/v1/users/account/password')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe a nova senha');
    });

    it('PATCH /api/v1/users/account/password should successfully update the password', async () => {
      const response = await request
        .patch('/api/v1/users/account/password')
        .send({ newPassword: 'newPassword' })
        .set({ Authorization: token });
      token = 'Bearer ' + response.body.token;
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
    });

    it('POST /api/v1/users/resetpassword should fail to create a reset token by missing the email', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.resetToken).toBeFalsy();
      expect(response.body.err).toEqual('Por favor, informe o seu e-mail');
    });

    it('POST /api/v1/users/resetpassword should fail to create a reset token by invalid email', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword')
        .send({ email: 'email@' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.resetToken).toBeFalsy();
      expect(response.body.err).toEqual('O e-mail email@ está incorreto');
    });

    it('POST /api/v1/users/resetpassword should fail to create a reset token by email not linked to any user', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword')
        .send({ email: 'some@gmail.com' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.resetToken).toBeFalsy();
      expect(response.body.err).toEqual(
        'Não foi encontrado nenhum usuário com o e-mail some@gmail.com'
      );
    });

    it('POST /api/v1/users/resetpassword should successfully create a reset token', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword')
        .send({ email: 'myNewEmail@gmail.com' })
        .set({ Authorization: token });
      resetToken = response.body.resetToken;
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.resetToken).toBeTruthy();
    });

    it('POST /api/v1/users/resetpassword/check should fail to verify a token by not passing any data', async () => {
      const response = await request.post('/api/v1/users/resetpassword/check');
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.valid).toBeUndefined();
      expect(response.body.err).toEqual('Por favor, informe o token');
    });

    it('POST /api/v1/users/resetpassword/check should successfully verify that a token is invalid', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword/check')
        .send({ token: 'someToken' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.valid).toBeFalsy();
    });

    it('POST /api/v1/users/resetpassword/check should successfully verify that a token is valid', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword/check')
        .send({ token: resetToken })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.valid).toBeTruthy();
    });

    it('PATCH /api/v1/users/resetpassword should fail to reset the password by not providing the token', async () => {
      const response = await request
        .patch('/api/v1/users/resetpassword')
        .send({ newPassword: 'newPassword' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe o token');
    });

    it('PATCH /api/v1/users/resetpassword should fail to reset the password by not providing the new password', async () => {
      const response = await request
        .patch('/api/v1/users/resetpassword')
        .send({ token: resetToken })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe a nova senha');
    });

    it('PATCH /api/v1/users/resetpassword should fail to reset the password by providing a token not in the database', async () => {
      const response = await request
        .patch('/api/v1/users/resetpassword')
        .send({ token: 'someToken', newPassword: 'newPassword' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual('O token someToken não foi encontrado');
    });

    it('PATCH /api/v1/users/resetpassword should successfully reset the password', async () => {
      const response = await request
        .patch('/api/v1/users/resetpassword')
        .send({ token: resetToken, newPassword: 'EPre#R+kara)(J' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
      expect(response.body.token).toBeTruthy();
    });

    it("DELETE /api/v1/users/6 should successfully delete another user's account", async () => {
      const response = await request
        .delete('/api/v1/users/6')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
    });

    it("DELETE /api/v1/users/account should fail to delete the user's own account by missing the password", async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe a sua senha');
    });

    it("DELETE /api/v1/users/account should fail to delete the user's own account by wrong password", async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .send({ password: 'rastrid' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('A senha está incorreta');
    });

    it("DELETE /api/v1/users/account should successfully delete the user's own account", async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .send({ password: 'EPre#R+kara)(J' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
    });
  });

  describe('Logged in as User', () => {
    let token: string;
    let resetToken: string;

    beforeAll(async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'john@gmail.com', password: 'jastrid' });

      token = 'Bearer ' + response.body.token;
    });

    it('GET /api/v1/users should fail to return the users by forbidden', async () => {
      const response = await request
        .get('/api/v1/users')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.users).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('GET /api/v1/users/1 should fail to return any data by forbidden', async () => {
      const response = await request
        .get('/api/v1/users/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.user).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it('PATCH /api/v1/users/account/name should fail to update the name by missing the new name', async () => {
      const response = await request
        .patch('/api/v1/users/account/name')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe o novo nome');
    });

    it('PATCH /api/v1/users/account/name should fail to update the name by invalid name', async () => {
      const response = await request
        .patch('/api/v1/users/account/name')
        .send({ newName: 'Name' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(
        'O nome deve conter de 8 a 40 caracteres'
      );
    });

    it('PATCH /api/v1/users/account/name should fail to update the name by already in use', async () => {
      const response = await request
        .patch('/api/v1/users/account/name')
        .send({ newName: 'Taqqiq Berlin' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('O nome Taqqiq Berlin já está em uso');
    });

    it('PATCH /api/v1/users/account/name should successfully update the name', async () => {
      const response = await request
        .patch('/api/v1/users/account/name')
        .send({ newName: 'Another name' })
        .set({ Authorization: token });
      token = 'Bearer ' + response.body.token;
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user.name).toEqual('Another name');
    });

    it('PATCH /api/v1/users/account/email should fail to update the name by missing the new email', async () => {
      const response = await request
        .patch('/api/v1/users/account/email')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe o novo e-mail');
    });

    it('PATCH /api/v1/users/account/email should fail to update the email by invalid email', async () => {
      const response = await request
        .patch('/api/v1/users/account/email')
        .send({ newEmail: 'email@' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('O e-mail email@ está incorreto');
    });

    it('PATCH /api/v1/users/account/email should fail to update the email by already in use', async () => {
      const response = await request
        .patch('/api/v1/users/account/email')
        .send({ newEmail: 'syntyche@gmail.com' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual(
        'O e-mail syntyche@gmail.com já está em uso'
      );
    });

    it('PATCH /api/v1/users/account/email should successfully update the email', async () => {
      const response = await request
        .patch('/api/v1/users/account/email')
        .send({ newEmail: 'myEmail@gmail.com' })
        .set({ Authorization: token });
      token = 'Bearer ' + response.body.token;
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user.email).toEqual('myEmail@gmail.com');
    });

    it('PATCH /api/v1/users/account/password should fail to update the password by missing the new password', async () => {
      const response = await request
        .patch('/api/v1/users/account/password')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe a nova senha');
    });

    it('PATCH /api/v1/users/account/password should successfully update the password', async () => {
      const response = await request
        .patch('/api/v1/users/account/password')
        .send({ newPassword: 'newPassword' })
        .set({ Authorization: token });
      token = 'Bearer ' + response.body.token;
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
    });

    it('POST /api/v1/users/resetpassword should fail to create a reset token by missing the email', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.resetToken).toBeFalsy();
      expect(response.body.err).toEqual('Por favor, informe o seu e-mail');
    });

    it('POST /api/v1/users/resetpassword should fail to create a reset token by invalid email', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword')
        .send({ email: 'email@' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.resetToken).toBeFalsy();
      expect(response.body.err).toEqual('O e-mail email@ está incorreto');
    });

    it('POST /api/v1/users/resetpassword should fail to create a reset token by email not linked to any user', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword')
        .send({ email: 'some@gmail.com' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.resetToken).toBeFalsy();
      expect(response.body.err).toEqual(
        'Não foi encontrado nenhum usuário com o e-mail some@gmail.com'
      );
    });

    it('POST /api/v1/users/resetpassword should successfully create a reset token', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword')
        .send({ email: 'myEmail@gmail.com' })
        .set({ Authorization: token });
      resetToken = response.body.resetToken;
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.resetToken).toBeTruthy();
    });

    it('POST /api/v1/users/resetpassword/check should fail to verify a token by not passing any data', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword/check')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.valid).toBeUndefined();
      expect(response.body.err).toEqual('Por favor, informe o token');
    });

    it('POST /api/v1/users/resetpassword/check should successfully verify that a token is invalid', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword/check')
        .send({ token: 'someToken' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.valid).toBeFalsy();
    });

    it('POST /api/v1/users/resetpassword/check should successfully verify that a token is valid', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword/check')
        .send({ token: resetToken })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.valid).toBeTruthy();
    });

    it('PATCH /api/v1/users/resetpassword should fail to reset the password by not providing the token', async () => {
      const response = await request
        .patch('/api/v1/users/resetpassword')
        .send({ newPassword: 'newPassword' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe o token');
    });

    it('PATCH /api/v1/users/resetpassword should fail to reset the password by not providing the new password', async () => {
      const response = await request
        .patch('/api/v1/users/resetpassword')
        .send({ token: resetToken })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe a nova senha');
    });

    it('PATCH /api/v1/users/resetpassword should fail to reset the password by providing a token not in the database', async () => {
      const response = await request
        .patch('/api/v1/users/resetpassword')
        .send({ token: 'someToken', newPassword: 'newPassword' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual('O token someToken não foi encontrado');
    });

    it('PATCH /api/v1/users/resetpassword should successfully reset the password', async () => {
      const response = await request
        .patch('/api/v1/users/resetpassword')
        .send({ token: resetToken, newPassword: 'myNewPassword' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
      expect(response.body.token).toBeTruthy();
    });

    it("DELETE /api/v1/users/1 should fail to delete another user's account by forbidden", async () => {
      const response = await request
        .delete('/api/v1/users/1')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.FORBIDDEN);
      expect(response.body.user).toBeFalsy();
      expect(response.body.err).toEqual(
        'Você não tem permissão para acessar esse conteúdo'
      );
    });

    it("DELETE /api/v1/users/account should fail to delete the user's own account by missing the password", async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe a sua senha');
    });

    it("DELETE /api/v1/users/account should fail to delete the user's own account by wrong password", async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .send({ password: 'jastrid' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('A senha está incorreta');
    });

    it("DELETE /api/v1/users/account should successfully delete the user's own account", async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .send({ password: 'myNewPassword' })
        .set({ Authorization: token });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
    });
  });

  describe('Logged out', () => {
    let resetToken: string;

    it('GET /api/v1/users should fail to return the users by unauthorized', async () => {
      const response = await request.get('/api/v1/users');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.users).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('GET /api/v1/users/1 should fail to return any data by unauthorized', async () => {
      const response = await request.get('/api/v1/users');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.user).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('PATCH /api/v1/users/account/name should fail to update the name by missing the new name', async () => {
      const response = await request.patch('/api/v1/users/account/name');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('PATCH /api/v1/users/account/email should fail to update the name by missing the new email', async () => {
      const response = await request.patch('/api/v1/users/account/email');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('PATCH /api/v1/users/account/password should fail to update the password by missing the new password', async () => {
      const response = await request.patch('/api/v1/users/account/password');
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.user).toBeFalsy();
      expect(response.body.token).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });

    it('POST /api/v1/users/resetpassword should fail to create a reset token by missing the email', async () => {
      const response = await request.post('/api/v1/users/resetpassword');
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.resetToken).toBeFalsy();
      expect(response.body.err).toEqual('Por favor, informe o seu e-mail');
    });

    it('POST /api/v1/users/resetpassword should fail to create a reset token by invalid email', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword')
        .send({ email: 'email@' });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.resetToken).toBeFalsy();
      expect(response.body.err).toEqual('O e-mail email@ está incorreto');
    });

    it('POST /api/v1/users/resetpassword should fail to create a reset token by email not linked to any user', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword')
        .send({ email: 'some@gmail.com' });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.resetToken).toBeFalsy();
      expect(response.body.err).toEqual(
        'Não foi encontrado nenhum usuário com o e-mail some@gmail.com'
      );
    });

    it('POST /api/v1/users/resetpassword should successfully create a reset token', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword')
        .send({ email: 'james@gmail.com' });
      resetToken = response.body.resetToken;
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(response.body.resetToken).toBeTruthy();
    });

    it('POST /api/v1/users/resetpassword/check should fail to verify a token by not passing any data', async () => {
      const response = await request.post('/api/v1/users/resetpassword/check');
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.valid).toBeUndefined();
      expect(response.body.err).toEqual('Por favor, informe o token');
    });

    it('POST /api/v1/users/resetpassword/check should successfully verify that a token is invalid', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword/check')
        .send({ token: 'someToken' });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.valid).toBeFalsy();
    });

    it('POST /api/v1/users/resetpassword/check should successfully verify that a token is valid', async () => {
      const response = await request
        .post('/api/v1/users/resetpassword/check')
        .send({ token: resetToken });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.valid).toBeTruthy();
    });

    it('PATCH /api/v1/users/resetpassword should fail to reset the password by not providing the token', async () => {
      const response = await request
        .patch('/api/v1/users/resetpassword')
        .send({ newPassword: 'newPassword' });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe o token');
    });

    it('PATCH /api/v1/users/resetpassword should fail to reset the password by not providing the new password', async () => {
      const response = await request
        .patch('/api/v1/users/resetpassword')
        .send({ token: resetToken });
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body.err).toEqual('Por favor, informe a nova senha');
    });

    it('PATCH /api/v1/users/resetpassword should fail to reset the password by providing a token not in the database', async () => {
      const response = await request
        .patch('/api/v1/users/resetpassword')
        .send({ token: 'someToken', newPassword: 'newPassword' });
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body.err).toEqual('O token someToken não foi encontrado');
    });

    it('PATCH /api/v1/users/resetpassword should successfully reset the password', async () => {
      const response = await request
        .patch('/api/v1/users/resetpassword')
        .send({ token: resetToken, newPassword: 'theNewPassword' });
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.body.user).toBeTruthy();
      expect(response.body.token).toBeTruthy();
    });

    it('DELETE /api/v1/users/account should fail to delete any account by unauthorized', async () => {
      const response = await request
        .delete('/api/v1/users/account')
        .send({ password: 'newPassword' });
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(response.body.user).toBeFalsy();
      expect(response.body.err).toEqual(
        'É necessário estar logado para acessar esse conteúdo'
      );
    });
  });
});
