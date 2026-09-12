import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { BadRequestError } from '../utils/errors.ts';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const first = result.error.issues[0];
      return next(
        new BadRequestError(`${first.path.join('.') || 'body'}: ${first.message}`)
      );
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const first = result.error.issues[0];
      return next(
        new BadRequestError(`${first.path.join('.') || 'query'}: ${first.message}`)
      );
    }
    // @ts-expect-error — overwrite parsed query
    req.query = result.data;
    next();
  };
}