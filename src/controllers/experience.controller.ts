import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createExperienceSchema } from '../validators/experience.validator';
import * as experienceService from '../services/experience.service';
import { successResponse } from '../utils/helpers';

export const createExperienceController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createExperienceSchema.parse(req.body);
    const experience = await experienceService.createExperience(
      req.user!.userId,
      req.user!.role,
      validatedData
    );
    return res.status(201).json(successResponse(experience, 'Experience created successfully'));
  } catch (error) {
    return next(error);
  }
};

export const publishExperienceController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const experienceId = parseInt(req.params.id as string);
    
    if (isNaN(experienceId) || experienceId <= 0) {
      const error: any = new Error('Invalid experience ID');
      error.statusCode = 400;
      error.code = 'BAD_REQUEST';
      throw error;
    }
    const experience = await experienceService.publishExperience(
      experienceId,
      req.user!.userId,
      req.user!.role
    );
    return res.status(200).json(successResponse(experience, 'Experience published successfully'));
  } catch (error) {
    return next(error);
  }
};

export const blockExperienceController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const experienceId = parseInt(req.params.id as string);
    
    if (isNaN(experienceId) || experienceId <= 0) {
      const error: any = new Error('Invalid experience ID');
      error.statusCode = 400;
      error.code = 'BAD_REQUEST';
      throw error;
    }
    const experience = await experienceService.blockExperience(
      experienceId,
      req.user!.role
    );
    return res.status(200).json(successResponse(experience, 'Experience blocked successfully'));
  } catch (error) {
    return next(error);
  }
};

// NEW: Public listing controller
export const listPublishedExperiencesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = req.query.location as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    let page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 10;
    
    // Security: Enforce max limit
    limit = Math.min(limit, 100);
    
    const sort = (req.query.sort as string) === 'desc' ? 'desc' : 'asc';
    
    if (page < 1) {
      const error: any = new Error('Page must be greater than 0');
      error.statusCode = 400;
      error.code = 'BAD_REQUEST';
      throw error;
    }
    
    if (limit < 1) {
      const error: any = new Error('Limit must be greater than 0');
      error.statusCode = 400;
      error.code = 'BAD_REQUEST';
      throw error;
    }
    
    const result = await experienceService.getPublishedExperiences(
      { location, from, to },
      { page, limit },
      sort
    );
    
    // Flattened response structure
    return res.status(200).json({
      data: result.data,
      meta: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages
      },
      message: 'Experiences retrieved successfully'
    });
  } catch (error) {
    return next(error);
  }
};