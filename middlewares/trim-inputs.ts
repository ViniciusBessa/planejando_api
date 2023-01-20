import { Request, Response, NextFunction } from 'express';

const trimInputs = (req: Request, res: Response, next: NextFunction) => {
  // Trimming all data in req.body
  for (const key in req.body) {
    const value = req.body[key];

    if (typeof value === 'string') {
      req.body[key] = value.trim();
    }
  }

  // Trimming all data in req.query
  for (const key in req.query) {
    const value = req.query[key];

    if (typeof value === 'string') {
      req.query[key] = value.trim();
    }
  }

  // Trimming all data in req.params
  for (const key in req.params) {
    const value = req.params[key];
    req.params[key] = value.trim();
  }

  return next();
};

export default trimInputs;
