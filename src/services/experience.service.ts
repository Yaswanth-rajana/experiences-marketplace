import { pool } from '../db';
import { CreateExperienceInput } from '../validators/experience.validator';

export const createExperience = async (
  userId: number,
  role: string,
  data: CreateExperienceInput
) => {
  if (role !== 'host' && role !== 'admin') {
    const error: any = new Error('Only hosts and admins can create experiences');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO experiences (title, description, location, price, start_time, created_by, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'draft')
     RETURNING *`,
    [data.title, data.description, data.location, data.price, data.start_time, userId]
  );

  return result.rows[0];
};

export const publishExperience = async (
  experienceId: number,
  userId: number,
  role: string
) => {
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

  if (role !== 'admin' && experience.created_by !== userId) {
    const error: any = new Error('Only the experience owner or admin can publish');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (experience.status === 'published') {
    const error: any = new Error('Experience is already published');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  if (experience.status === 'blocked') {
    const error: any = new Error('Cannot publish a blocked experience');
    error.statusCode = 400;
    error.code = 'BAD_REQUEST';
    throw error;
  }

  const result = await pool.query(
    'UPDATE experiences SET status = $1 WHERE id = $2 RETURNING *',
    ['published', experienceId]
  );

  return result.rows[0];
};

export const blockExperience = async (
  experienceId: number,
  role: string
) => {
  if (role !== 'admin') {
    const error: any = new Error('Only admins can block experiences');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

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

  const result = await pool.query(
    'UPDATE experiences SET status = $1 WHERE id = $2 RETURNING *',
    ['blocked', experienceId]
  );

  return result.rows[0];
};

export const getExperienceById = async (experienceId: number) => {
  const result = await pool.query(
    'SELECT * FROM experiences WHERE id = $1',
    [experienceId]
  );
  return result.rows[0];
};

export const getPublishedExperiences = async (
  filters: {
    location?: string;
    from?: string;
    to?: string;
  },
  pagination: {
    page: number;
    limit: number;
  },
  sort: 'asc' | 'desc'
) => {
  const { location, from, to } = filters;
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT * FROM experiences 
    WHERE status = 'published'
  `;
  
  const params: any[] = [];
  let paramIndex = 1;
  
  if (location && location.trim() !== '') {
    query += ` AND location ILIKE $${paramIndex}`;
    params.push(`%${location}%`);
    paramIndex++;
  }
  
  if (from && from.trim() !== '') {
    query += ` AND start_time >= $${paramIndex}`;
    params.push(from);
    paramIndex++;
  }
  
  if (to && to.trim() !== '') {
    query += ` AND start_time <= $${paramIndex}`;
    params.push(to);
    paramIndex++;
  }
  
  query += ` ORDER BY start_time ${sort === 'asc' ? 'ASC' : 'DESC'}`;
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);
  
  let countQuery = `SELECT COUNT(*) as total FROM experiences WHERE status = 'published'`;
  const countParams: any[] = [];
  let countIndex = 1;
  
  if (location && location.trim() !== '') {
    countQuery += ` AND location ILIKE $${countIndex}`;
    countParams.push(`%${location}%`);
    countIndex++;
  }
  
  if (from && from.trim() !== '') {
    countQuery += ` AND start_time >= $${countIndex}`;
    countParams.push(from);
    countIndex++;
  }
  
  if (to && to.trim() !== '') {
    countQuery += ` AND start_time <= $${countIndex}`;
    countParams.push(to);
    countIndex++;
  }
  
  const countResult = await pool.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].total);
  
  const result = await pool.query(query, params);
  
  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};