import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { bookingSchema } from '../validators/booking.validator';
import * as bookingService from '../services/booking.service';
import { successResponse } from '../utils/helpers';

export const createBookingController = async (
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
    const validatedData = bookingSchema.parse(req.body);
    
    const booking = await bookingService.createBooking(
      experienceId,
      req.user!.userId,
      req.user!.role,
      validatedData.seats
    );
    
    return res.status(201).json(successResponse(booking, 'Booking confirmed successfully'));
  } catch (error) {
    return next(error);
  }
};

export const getUserBookingsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user!.userId);
    return res.status(200).json(successResponse(bookings, 'Bookings retrieved successfully'));
  } catch (error) {
    return next(error);
  }
};