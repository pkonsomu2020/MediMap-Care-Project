import { NextFunction, Request, Response } from 'express';
export type AuthInfo = {
    userId: number;
    role?: string | undefined;
    email?: string | undefined;
};
export interface AuthenticatedRequest extends Request {
    auth?: AuthInfo;
}
export declare function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.d.ts.map