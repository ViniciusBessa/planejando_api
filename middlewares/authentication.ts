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
    // Trying to get a token from the headers
    const token = req.headers.authorization;

    // Checking if there was a token
    if (!token) {
      return next();
    }

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
