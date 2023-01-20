import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors';
import asyncWrapper from './async-wrapper';

const restrictAccessMiddleware = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== Role.ADMIN) {
      throw new ForbiddenError(
        'Você não tem permissão para acessar esse conteúdo'
      );
    }
    return next();
  }
);

export default restrictAccessMiddleware;
