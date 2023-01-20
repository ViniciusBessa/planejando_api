import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { getUserPayload, verifyToken } from '../utils/jwt';

const prisma = new PrismaClient();

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Getting the authorization header
    const { authorization } = req.headers;

    // If there is no value in authorization value, just continue with the user not authenticated
    if (!authorization) {
      return next();
    }

    // Getting the token from the authorization header
    const token = authorization.split(' ')[1];

    // Getting the user from the database
    const userPayload = await verifyToken(token);
    const user = await prisma.user.findFirst({ where: { id: userPayload.id } });

    // If no user was found, push forward the request
    if (!user) {
      return next();
    }
    req.user = await getUserPayload(user);
    return next();
  } catch {
    return next();
  }
};

export default authMiddleware;
