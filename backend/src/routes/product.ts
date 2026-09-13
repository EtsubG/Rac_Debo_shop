import { Router } from 'express';
import * as productController from '../controllers/productController.ts';
import * as productImageController from '../controllers/productImageController.ts';
import { validateBody } from '../middleware/validate.ts';
import { requireAuth } from '../middleware/auth.ts';
import { productImageUpload } from '../middleware/productImageUpload.ts';

export const productsRouter = Router();

// Public
productsRouter.get('/', productController.listProducts);

// Product image upload
productsRouter.post(
  '/upload-image',
  requireAuth,
  productImageUpload.single('image'),
  productImageController.uploadProductImageController
);

// Get one product
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

productsRouter.delete(
  '/:id',
  requireAuth,
  productController.deleteProduct
);