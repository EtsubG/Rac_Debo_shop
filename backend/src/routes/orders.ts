import { Router } from 'express';
import * as orderController from '../controllers/orderController.ts';
import { validateBody } from '../middleware/validate.ts';
import { requireAuth } from '../middleware/auth.ts';
import { upload } from '../middleware/upload.ts';

export const ordersRouter = Router();

// Public: place an order with optional proof upload
ordersRouter.post(
  '/',
  upload.single('proof'),
  validateBody(orderController.createOrderBodySchema),
  orderController.createOrder
);

// Public: track by orderNumber + phone
ordersRouter.get('/track', orderController.trackOrder);

// Admin
ordersRouter.get('/', requireAuth, orderController.listOrders);
ordersRouter.get('/:id', requireAuth, orderController.getOrder);
ordersRouter.patch(
  '/:id/status',
  requireAuth,
  validateBody(orderController.updateStatusBodySchema),
  orderController.updateOrderStatus
);
ordersRouter.post('/:id/approve', requireAuth, orderController.approveOrder);
ordersRouter.post('/:id/reject', requireAuth, orderController.rejectOrder);