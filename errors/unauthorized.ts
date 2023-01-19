import { CustomError } from './custom-error';
import { StatusCodes } from 'http-status-codes';

export class UnauthorizedError extends CustomError {
  constructor(public message: string) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}
