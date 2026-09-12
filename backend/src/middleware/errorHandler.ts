import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Route not found' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  if (err instanceof Error) {
    console.error('[error]', err.message);
    return res.status(500).json({
      error: env.isProd ? 'Internal server error' : err.message,
    });
  }

  console.error('[error] unknown', err);
  res.status(500).json({ error: 'Internal server error' });
}