import asyncWrapper from '../middlewares/async-wrapper';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { comparePassword, generatePassword } from '../utils/bcrypt';
import { StatusCodes } from 'http-status-codes';
import { createToken, getUserPayload } from '../utils/jwt';
import { BadRequestError, NotFoundError } from '../errors';

const prisma = new PrismaClient();
const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const registerUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    // Validating the name, email and password
    if (name.length > 40 || name.length < 8) {
      throw new BadRequestError('O nome deve conter de 8 a 40 caracteres');
    } else if (!EMAIL_REGEX.test(email)) {
      throw new BadRequestError(`O e-mail ${email} está incorreto`);
    } else if (!password) {
      throw new BadRequestError('Por favor, informe uma senha');
    }
    // Hashing the password
    const hashedPassword = await generatePassword(password);

    // Creating the user in the database
    const user = await prisma.user.create({
      data: { name, password: hashedPassword, email },
    });

    // Getting the user payload and generating a token for authentication
    const userPayload = await getUserPayload(user);
    const token = await createToken(userPayload);

    return res.status(StatusCodes.OK).json({ user: userPayload, token });
  }
);

const loginUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new NotFoundError(
        `Nenhum usuário foi encontrado com o e-mail ${email}`
      );
    }

    // Comparing the password submitted by the user to the one in the database
    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      throw new BadRequestError('A senha está incorreta');
    }
    // Getting the user payload and generating a token for authentication
    const userPayload = await getUserPayload(user);
    const token = await createToken(userPayload);

    return res.status(StatusCodes.OK).json({ user: userPayload, token });
  }
);

export { registerUser, loginUser };
