import { Router } from 'express';
import { productsRouter } from './product.ts';
import { ordersRouter } from './orders.ts';
import { campaignsRouter } from './campaign.ts';
import { adminRouter } from './admin.ts';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

apiRouter.use('/products', productsRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/campaigns', campaignsRouter);
apiRouter.use('/admin', adminRouter);