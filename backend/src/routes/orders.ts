import { Router } from 'express';
import * as orderController from '../controllers/orderController.ts';
import { validateBody } from '../middleware/validate.ts';
import { requireAuth,requireSuperAdmin } from '../middleware/auth.ts';
import { paymentProofUpload } from '../middleware/paymentProofUpload.ts';

export const ordersRouter = Router();

// Public: place an order with optional proof upload
ordersRouter.post(
  '/',
  paymentProofUpload.single('proof'),
  (req, _res, next) => {
    try {
      if (typeof req.body.items === 'string') {
        req.body.items = JSON.parse(req.body.items);
      }

      next();
    } catch {
      _res.status(400).json({
        error: 'items must be valid JSON',
        code: 'BAD_REQUEST',
      });
    }
  },
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
ordersRouter.delete(
  '/:id',
  requireAuth,
  requireSuperAdmin,
  orderController.deleteOrder
);