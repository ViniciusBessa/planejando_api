import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/userPayload';

const getUserPayload = async (user: User): Promise<UserPayload> => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const createToken = async (userPayload: UserPayload): Promise<string> => {
  const token = jwt.sign(userPayload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
  return token;
};

const verifyToken = async (token: string): Promise<UserPayload> => {
  const userPayload = jwt.verify(token, process.env.JWT_SECRET as string);
  return userPayload as UserPayload;
};

export { getUserPayload, createToken, verifyToken };
