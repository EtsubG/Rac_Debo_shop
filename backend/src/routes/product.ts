import { Router } from 'express';
import * as productController from '../controllers/productController.ts';
import { validateBody } from '../middleware/validate.ts';
import { requireAuth } from '../middleware/auth.ts';

export const productsRouter = Router();

// Public
productsRouter.get('/', productController.listProducts);
productsRouter.get('/:id', productController.getProduct);

// Admin
productsRouter.post(
  '/',
  requireAuth,
  validateBody(productController.productBodySchema),
  productController.createProduct
);
productsRouter.put(
  '/:id',
  requireAuth,
  validateBody(productController.productUpdateSchema),
  productController.updateProduct
);
productsRouter.delete('/:id', requireAuth, productController.deleteProduct);