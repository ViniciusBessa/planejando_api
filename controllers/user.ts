import { PrismaClient, Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors';
import asyncWrapper from '../middlewares/async-wrapper';
import { comparePassword, generatePassword } from '../utils/bcrypt';
import { EMAIL_REGEX } from '../utils/email-regex';
import { createToken, getUserPayload } from '../utils/jwt';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const getAllUsers = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        password: false,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(StatusCodes.OK).json({ users });
  }
);

const getSpecificUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const user = await prisma.user.findFirst({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        password: false,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(StatusCodes.OK).json({ user });
  }
);

const updateName = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { newName } = req.body;

    // Validating the name
    if (!newName) {
      throw new BadRequestError('Por favor, informe o novo nome');
    } else if (newName.length > 40 || newName.length < 8) {
      throw new BadRequestError('O nome deve conter de 8 a 40 caracteres');
    }

    // Checking if the name is already in use
    const nameInUse = await prisma.user.findFirst({
      where: { name: newName },
    });

    if (nameInUse) {
      throw new BadRequestError(`O nome ${newName} já está em uso`);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: newName },
    });

    // Getting the user payload and generating a new token for authentication
    const userPayload = await getUserPayload(updatedUser);
    const newToken = await createToken(userPayload);

    return res
      .status(StatusCodes.OK)
      .json({ user: userPayload, token: newToken });
  }
);

const updateEmail = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { newEmail } = req.body;

    if (!newEmail) {
      throw new BadRequestError('Por favor, informe o novo e-mail');
    } else if (!EMAIL_REGEX.test(newEmail)) {
      throw new BadRequestError(`O e-mail ${newEmail} está incorreto`);
    }

    // Checking if the email is already in use
    const emailInUse = await prisma.user.findFirst({
      where: { email: newEmail },
    });

    if (emailInUse) {
      throw new BadRequestError(`O e-mail ${newEmail} já está em uso`);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail },
    });

    // Getting the user payload and generating a new token for authentication
    const userPayload = await getUserPayload(updatedUser);
    const newToken = await createToken(userPayload);

    return res
      .status(StatusCodes.OK)
      .json({ user: userPayload, token: newToken });
  }
);

const updatePassword = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { newPassword } = req.body;

    if (!newPassword) {
      throw new BadRequestError('Por favor, informe a nova senha');
    }

    // Hashing the new password and updating the database
    const hashedPassword = await generatePassword(newPassword);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Getting the user payload and generating a new token for authentication
    const userPayload = await getUserPayload(updatedUser);
    const newToken = await createToken(userPayload);

    return res
      .status(StatusCodes.OK)
      .json({ user: userPayload, token: newToken });
  }
);

const deleteAccount = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await prisma.user.findFirst({
      where: { id: Number(userId) },
    });

    if (!user) {
      throw new NotFoundError(
        `Nenhum usuário foi encontrado com o id ${userId}`
      );
    }

    await prisma.user.delete({
      where: { id: Number(userId) },
    });

    const userPayload = await getUserPayload(user);
    return res.status(StatusCodes.OK).json({ user: userPayload });
  }
);

const deleteOwnAccount = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { password } = req.body;

    if (!password) {
      throw new BadRequestError('Por favor, informe a sua senha');
    }

    const userAccount = await prisma.user.findFirst({ where: { id: user.id } });

    if (!userAccount) {
      throw new NotFoundError(
        `Nenhuma conta foi encontrada com o id ${user.id}`
      );
    }

    // Comparing the password submitted by the user to the one in the database
    const passwordMatches = await comparePassword(
      password,
      userAccount.password
    );

    if (!passwordMatches) {
      throw new BadRequestError('A senha está incorreta');
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    const userPayload = await getUserPayload(user);
    return res.status(StatusCodes.OK).json({ user: userPayload });
  }
);

const generatePasswordResetToken = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError('Por favor, informe o seu e-mail');
    } else if (!EMAIL_REGEX.test(email)) {
      throw new BadRequestError(`O e-mail ${email} está incorreto`);
    }

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError(
        `Não foi encontrado nenhum usuário com o e-mail ${email}`
      );
    }

    const resetToken = await prisma.passwordResetToken.create({
      data: { user: { connect: { id: user.id } } },
    });

    if (process.env.NODE_ENV !== 'production') {
      return res
        .status(StatusCodes.CREATED)
        .json({ resetToken: resetToken.id });
    }

    // Sending the email to confirm the password reset
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: 'Recuperação de senha',
      text: `Seu token: ${resetToken.id}`,
      html: `
      <p>Olá ${user.name},</p>
      <p>Nós recebemos um pedido para redefinir a senha da sua conta, 
      caso não tenha sido você, apenas ignore esse e-mail, do contrário clique no botão abaixo:
      </p>
      <a style="
         border-radius: 12px;
         background-color: #282A35;
         color: white;
         padding: 8px 12px;
         text-decoration: none" 
       href=${process.env.FRONTEND}?token=${resetToken.id}
       >Redefinir senha</a>
      <p>Ou copie e cole o seguinte URL no seu navegador:</p>
      <a href=${process.env.FRONTEND}?token=${resetToken.id}>${process.env.FRONTEND}?token=${resetToken.id}</a>
      `,
    });
    return res.status(StatusCodes.CREATED).json();
  }
);

const checkPasswordResetToken = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;

    if (!token) {
      throw new BadRequestError('Por favor, informe o token');
    }

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { id: token as string },
    });

    return res.status(StatusCodes.OK).json({ valid: !!resetToken });
  }
);

const resetPassword = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, newPassword } = req.body;

    if (!token) {
      throw new BadRequestError('Por favor, informe o token');
    } else if (!newPassword) {
      throw new BadRequestError('Por favor, informe a nova senha');
    }

    // Checking if the token is valid
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { id: token as string },
    });

    if (!resetToken) {
      throw new NotFoundError(`O token ${token} não foi encontrado`);
    }

    // Hashing the password and updating the user's data
    const hashedPassword = await generatePassword(newPassword);
    const user = await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    const userPayload = await getUserPayload(user);
    const authToken = await createToken(userPayload);
    return res
      .status(StatusCodes.OK)
      .json({ user: userPayload, token: authToken });
  }
);

export {
  getAllUsers,
  getSpecificUser,
  updateName,
  updateEmail,
  updatePassword,
  deleteAccount,
  deleteOwnAccount,
  generatePasswordResetToken,
  checkPasswordResetToken,
  resetPassword,
};
