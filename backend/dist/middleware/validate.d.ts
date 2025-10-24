import { ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";
export declare function validate(schema: {
    body?: ZodTypeAny;
    query?: ZodTypeAny;
    params?: ZodTypeAny;
}): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map