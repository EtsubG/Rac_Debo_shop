import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as campaignService from '../services/campaignService.ts';

const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const campaignBodySchema = campaignSchema;

export async function listCampaigns(_req: Request, res: Response, next: NextFunction) {
  try {
    const campaigns = await campaignService.listCampaigns();
    res.json({ campaigns });
  } catch (err) {
    next(err);
  }
}

export async function getActiveCampaign(_req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignService.getActiveCampaign();
    res.json({ campaign });
  } catch (err) {
    next(err);
  }
}

export async function createCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignService.createCampaign(req.body);
    res.status(201).json({ campaign });
  } catch (err) {
    next(err);
  }
}

export async function activateCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await campaignService.setActiveCampaign(req.params.id);
    res.json({ campaign });
  } catch (err) {
    next(err);
  }
}

export async function archiveCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    await campaignService.archiveCampaign(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}