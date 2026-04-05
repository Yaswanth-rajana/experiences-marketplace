import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import {
  createBookingController,
  getUserBookingsController
} from '../controllers/booking.controller';

const router = Router();

// Create a booking (user only)
router.post('/experiences/:id/book', 
  requireAuth, 
  requireRole(['user']), 
  createBookingController
);

// Get user's bookings (user only)
router.get('/bookings', 
  requireAuth, 
  requireRole(['user']), 
  getUserBookingsController
);

export default router;