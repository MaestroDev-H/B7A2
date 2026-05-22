import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import type { JwtPayload } from '../modules/auth/auth.interface.js';


export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Missing token. Access denied.',
      });
    }

   
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token format',
      });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key') as unknown as JwtPayload;
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};