import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[AUTH] Missing or invalid authorization header');
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      console.log(`[AUTH] User ${decoded.userId} authenticated successfully`);
      next();
    } catch (error) {
      console.log('[AUTH] Token verification failed:', (error as Error).message);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.',
      });
      return;
    }
  } catch (error) {
    console.error('[AUTH] Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
    return;
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken(token);
        req.user = decoded;
        console.log(`[OPTIONAL AUTH] User ${decoded.userId} authenticated`);
      } catch (error) {
        // Token is invalid but we don't reject the request
        console.log('[OPTIONAL AUTH] Invalid token, continuing without auth');
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};