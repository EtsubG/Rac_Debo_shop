import type { Request, Response, NextFunction } from 'express';
import { uploadProductImage } from '../services/productImageService.ts';

export async function uploadProductImageController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided',
      });
    }

    const url = await uploadProductImage(req.file);

    return res.status(201).json({
      url,
    });
  } catch (error) {
    next(error);
  }
}