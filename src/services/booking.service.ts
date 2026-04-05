import { pool } from '../db';

export const createBooking = async (
  experienceId: number,
  userId: number,
  userRole: string,
  seats: number
) => {
  // 1. Check if experience exists
  const experienceResult = await pool.query(
    'SELECT * FROM experiences WHERE id = $1',
    [experienceId]
  );

  if (experienceResult.rows.length === 0) {
    const error: any = new Error('Experience not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const experience = experienceResult.rows[0];

  // 2. Check if experience is published
  if (experience.status !== 'published') {
    const error: any = new Error('Cannot book an experience that is not published');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  // 3. Check if user is trying to book their own experience
  if (experience.created_by === userId) {
    const error: any = new Error('Hosts cannot book their own experiences');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  // 4. Create booking (let the partial unique index handle duplicate prevention)
  try {
    const result = await pool.query(
      `INSERT INTO bookings (experience_id, user_id, seats, status)
       VALUES ($1, $2, $3, 'confirmed')
       RETURNING *`,
      [experienceId, userId, seats]
    );
    return result.rows[0];
  } catch (error: any) {
    // PostgreSQL unique violation error code (partial unique index)
    if (error.code === '23505') {
      const duplicateError: any = new Error('You already have a confirmed booking for this experience');
      duplicateError.statusCode = 409;
      duplicateError.code = 'CONFLICT';
      throw duplicateError;
    }
    throw error;
  }
};

export const getUserBookings = async (userId: number) => {
  const result = await pool.query(
    `SELECT b.*, e.title, e.location, e.start_time 
     FROM bookings b
     JOIN experiences e ON b.experience_id = e.id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return result.rows;
};