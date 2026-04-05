import { Request, Response, NextFunction } from 'express';
import { signupSchema, loginSchema } from '../validators/auth.validator';
import * as authService from '../services/auth.service';
import { successResponse } from '../utils/helpers';

export const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const user = await authService.signup(validatedData);
    return res.status(201).json(successResponse(user, 'User created successfully'));
  } catch (error) {
    return next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);
    return res.status(200).json(successResponse(result, 'Login successful'));
  } catch (error) {
    return next(error);
  }
};