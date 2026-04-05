export const ROLES = {
  USER: 'user',
  HOST: 'host',
  ADMIN: 'admin'
} as const;

export const EXPERIENCE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  BLOCKED: 'blocked'
} as const;

export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;