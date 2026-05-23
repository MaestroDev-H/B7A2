import type { Request, Response, NextFunction } from 'express';
interface AppError extends Error {
    statusCode?: number;
    errors?: unknown[] | null;
}
export declare const globalErrorHandler: (err: AppError, req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=error.middleware.d.ts.map