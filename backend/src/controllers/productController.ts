import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as productService from '../services/productService.js';

const variantSchema = z.object({
  color: z.string().min(1),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color'),
  sizes: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  price: z.number().nonnegative(),
  category: z.enum(['T-Shirt', 'Hoodie', 'Tote Bag', 'Cap', 'Mug']),
  image: z.string().default(''),
  target: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
  variants: z.array(variantSchema).default([]),
});

export const productBodySchema = productSchema;
export const productUpdateSchema = productSchema.partial();

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const products = await productService.listProducts(includeInactive);
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}