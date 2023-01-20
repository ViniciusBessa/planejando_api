import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors';
import asyncWrapper from './async-wrapper';

const loginRequiredMiddleware = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError(
        'É necessário estar logado para acessar esse conteúdo'
      );
    }
    return next();
  }
);

export default loginRequiredMiddleware;
