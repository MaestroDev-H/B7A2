import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';


interface AppError extends Error {
  statusCode?: number;
  errors?: unknown[] | null;
}

export const globalErrorHandler = (
  err: AppError, 
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error Logged:', err.message || err);
  
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null,
  });
};