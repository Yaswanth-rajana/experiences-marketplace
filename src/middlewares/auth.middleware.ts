import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/helpers';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json(
      errorResponse('UNAUTHORIZED', 'No authorization header provided')
    );
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json(
      errorResponse('UNAUTHORIZED', 'Invalid authorization format. Use Bearer <token>')
    );
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json(
      errorResponse('UNAUTHORIZED', 'No token provided')
    );
  }
  
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    return res.status(500).json(
      errorResponse('INTERNAL_ERROR', 'JWT_SECRET not configured')
    );
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as { sub: number; role: string };
    req.user = { userId: decoded.sub, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json(
      errorResponse('UNAUTHORIZED', 'Invalid or expired token')
    );
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', 'Authentication required')
      );
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(
        errorResponse('FORBIDDEN', `Access denied. Required role: ${allowedRoles.join(' or ')}`)
      );
    }
    
    next();
  };
};

// NEW: Check if user is owner (created_by) OR admin
export const requireOwnerOrAdmin = (getResourceUserId: (req: AuthRequest) => Promise<number>) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', 'Authentication required')
      );
    }

    // Admin can do anything
    if (req.user.role === 'admin') {
      return next();
    }

    // Get the resource owner's user ID from the database
    try {
      const resourceUserId = await getResourceUserId(req);
      
      if (req.user.userId === resourceUserId) {
        return next();
      }
      
      return res.status(403).json(
        errorResponse('FORBIDDEN', 'You can only access your own resources')
      );
    } catch (error) {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Resource not found')
      );
    }
  };
};