import { NextFunction, Request, Response } from 'express';

export function notFound(req: Request, res: Response) {
  return res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message = err?.message || 'Internal Server Error';
  return res.status(status).json({ error: message });
}


