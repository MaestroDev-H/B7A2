import type { Response } from 'express';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T
): void => {
  res.status(statusCode).json({
    success,
    message,
    ...(data !== undefined && { data }),
  });
};