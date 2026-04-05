import { ERROR_CODES } from './constants';

export const errorResponse = (
  code: keyof typeof ERROR_CODES,
  message: string,
  details: any[] = []
) => ({
  error: {
    code: ERROR_CODES[code],
    message,
    details
  }
});

export const successResponse = (data: any, message: string = 'Success') => ({
  data,
  message
});