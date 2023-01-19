import { CustomError } from './custom-error';
import { StatusCodes } from 'http-status-codes';

export class BadRequestError extends CustomError {
  constructor(public message: string) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}
