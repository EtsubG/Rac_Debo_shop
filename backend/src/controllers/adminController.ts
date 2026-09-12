import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as adminService from '../services/adminService.js';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const loginBodySchema = loginSchema;

const createAdminSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['super', 'admin']).default('admin'),
});

export const createAdminBodySchema = createAdminSchema;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const changePasswordBodySchema = changePasswordSchema;

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.login(req.body.username, req.body.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    // req.admin is set by auth middleware
    res.json({ admin: req.admin });
  } catch (err) {
    next(err);
  }
}

export async function listAdmins(_req: Request, res: Response, next: NextFunction) {
  try {
    const admins = await adminService.listAdmins();
    res.json({ admins });
  } catch (err) {
    next(err);
  }
}

export async function createAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = await adminService.createAdmin(req.body);
    res.status(201).json({ admin });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const requesterId = req.admin!.sub;
    await adminService.deleteAdmin(req.params.id, requesterId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const adminId = req.admin!.sub;
    await adminService.changePassword(
      adminId,
      req.body.currentPassword,
      req.body.newPassword
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}