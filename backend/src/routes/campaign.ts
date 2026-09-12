import { Router } from 'express';
import * as campaignController from '../controllers/campaignController.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

export const campaignsRouter = Router();

// Public
campaignsRouter.get('/', campaignController.listCampaigns);
campaignsRouter.get('/active', campaignController.getActiveCampaign);

// Admin
campaignsRouter.post(
  '/',
  requireAuth,
  validateBody(campaignController.campaignBodySchema),
  campaignController.createCampaign
);
campaignsRouter.post('/:id/activate', requireAuth, campaignController.activateCampaign);
campaignsRouter.post('/:id/archive', requireAuth, campaignController.archiveCampaign);