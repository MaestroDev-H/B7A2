import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '../modules/auth/auth.interface.js';
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}
export declare const protect: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const restrictTo: (...roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map