<<<<<<< HEAD
import { ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";
export declare function validate(schema: {
    body?: ZodTypeAny;
    query?: ZodTypeAny;
    params?: ZodTypeAny;
}): (req: Request, res: Response, next: NextFunction) => void;
=======
import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';
export declare function validate(schema: {
    body?: AnyZodObject;
    query?: AnyZodObject;
    params?: AnyZodObject;
}): (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
>>>>>>> vector_search
//# sourceMappingURL=validate.d.ts.map