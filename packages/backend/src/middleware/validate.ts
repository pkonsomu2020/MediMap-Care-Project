import { ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";

export function validate(schema: {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query) as any;
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params) as any;
      }

      // ✅ Explicitly return here to make TS happy
      return next();
    } catch (err: any) {
      res.status(400).json({
        error: "ValidationError",
        details: err?.issues || err?.message,
      });
      return; // ✅ Explicitly return after sending response
    }
  };
}
