import { pool } from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SignupInput, LoginInput } from '../validators/auth.validator';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const signup = async (data: SignupInput) => {
  const { email, password, role } = data;

  // Check if user already exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    const error: any = new Error('Email already exists');
    error.code = '23505';
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Insert user
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, role) 
     VALUES ($1, $2, $3) 
     RETURNING id, email, role, created_at`,
    [email, hashedPassword, role]
  );

  return result.rows[0];
};

export const login = async (data: LoginInput) => {
  const { email, password } = data;

  // Find user
  const result = await pool.query(
    'SELECT id, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    const error: any = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  const user = result.rows[0];

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    const error: any = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  // Generate JWT
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as any }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  };
};