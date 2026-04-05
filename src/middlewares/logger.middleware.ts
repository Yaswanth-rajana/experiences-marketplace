import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = uuidv4();
  
  // Attach requestId to request object for use in other middleware
  (req as any).id = requestId;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const path = req.path;
    
    let statusColor = '\x1b[32m';
    if (statusCode >= 400) statusColor = '\x1b[31m';
    if (statusCode >= 500) statusColor = '\x1b[35m';
    
    console.log(`[${requestId}] ${method} ${path} ${statusColor}${statusCode}\x1b[0m - ${duration}ms`);
  });
  
  next();
};