import { CustomError } from './custom-error';
import { StatusCodes } from 'http-status-codes';

export class NotFoundError extends CustomError {
  constructor(public message: string) {
    super(message, StatusCodes.NOT_FOUND);
  }
}
