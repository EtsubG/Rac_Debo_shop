import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import * as orderController from '../controllers/orderController.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';

export const adminRouter = Router();

// Auth
adminRouter.post(
  '/login',
  validateBody(adminController.loginBodySchema),
  adminController.login
);
adminRouter.get('/me', requireAuth, adminController.me);
adminRouter.post(
  '/change-password',
  requireAuth,
  validateBody(adminController.changePasswordBodySchema),
  adminController.changePassword
);

// Admin users (super only)
adminRouter.get('/users', requireAuth, requireSuperAdmin, adminController.listAdmins);
adminRouter.post(
  '/users',
  requireAuth,
  requireSuperAdmin,
  validateBody(adminController.createAdminBodySchema),
  adminController.createAdmin
);
adminRouter.delete('/users/:id', requireAuth, requireSuperAdmin, adminController.deleteAdmin);

// Dashboard + production report
adminRouter.get('/dashboard', requireAuth, orderController.getDashboardStats);
adminRouter.get('/production-report', requireAuth, orderController.getProductionReport);