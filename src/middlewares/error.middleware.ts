import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/helpers';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    // Safely extract error details
    const details = err.issues?.map((e: any) => ({ 
      path: e.path?.join('.') || 'unknown', 
      message: e.message || 'Validation failed'
    })) || [];
    
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'Validation failed', details)
    );
  }

  // Duplicate email error (PostgreSQL code 23505)
  if (err.code === '23505') {
    return res.status(409).json(
      errorResponse('CONFLICT', 'Email already exists')
    );
  }

  // Foreign key violation (PostgreSQL code 23503)
  if (err.code === '23503') {
    return res.status(400).json(
      errorResponse('BAD_REQUEST', 'Referenced record does not exist')
    );
  }

  // Check constraint violation (PostgreSQL code 23514)
  if (err.code === '23514') {
    return res.status(400).json(
      errorResponse('BAD_REQUEST', err.message || 'Check constraint violation')
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      errorResponse('UNAUTHORIZED', 'Invalid token')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      errorResponse('UNAUTHORIZED', 'Token expired')
    );
  }

  // Custom application errors
  if (err.statusCode && err.code) {
    return res.status(err.statusCode).json(
      errorResponse(err.code, err.message, err.details || [])
    );
  }

  // Default internal server error
  return res.status(500).json(
    errorResponse('INTERNAL_ERROR', 'Internal server error')
  );
};