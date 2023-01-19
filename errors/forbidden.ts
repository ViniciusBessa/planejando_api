import { CustomError } from './custom-error';
import { StatusCodes } from 'http-status-codes';

export class ForbiddenError extends CustomError {
  constructor(public message: string) {
    super(message, StatusCodes.FORBIDDEN);
  }
}
