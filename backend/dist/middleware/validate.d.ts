import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';
export declare function validate(schema: {
    body?: AnyZodObject;
    query?: AnyZodObject;
    params?: AnyZodObject;
}): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=validate.d.ts.map