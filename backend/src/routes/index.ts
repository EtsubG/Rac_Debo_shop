import { Router } from 'express';
import { productsRouter } from './products.js';
import { ordersRouter } from './orders.js';
import { campaignsRouter } from './campaigns.js';
import { adminRouter } from './admin.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

apiRouter.use('/products', productsRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/campaigns', campaignsRouter);
apiRouter.use('/admin', adminRouter);