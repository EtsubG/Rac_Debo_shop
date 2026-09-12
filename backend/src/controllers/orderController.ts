import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as orderService from '../services/orderService.js';
import { NotFoundError } from '../utils/errors.js';
import type { OrderStatus } from '../types/index.js';

const createOrderSchema = z.object({
  customerName: z.string().min(1),
  phone: z.string().min(3),
  telegram: z.string().min(1),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        color: z.string().min(1),
        size: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export const createOrderBodySchema = createOrderSchema;

const statusValues: OrderStatus[] = [
  'Awaiting Payment',
  'Proof Uploaded',
  'Paid',
  'Confirmed',
  'Production',
  'Ready',
  'Delivered',
];

const updateStatusSchema = z.object({
  status: z.enum(statusValues as [OrderStatus, ...OrderStatus[]]),
  rejectionReason: z.string().optional(),
});

export const updateStatusBodySchema = updateStatusSchema;

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    // Proof file optional — handled by upload middleware, sets req.file
    const proofUrl = (req as Request & { file?: Express.Multer.File }).file
      ? `/uploads/${(req as Request & { file: Express.Multer.File }).file.filename}`
      : undefined;

    const order = await orderService.createOrder(req.body, proofUrl);
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function trackOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const orderNumber = String(req.query.orderNumber || '').trim();
    const phone = String(req.query.phone || '').trim();
    if (!orderNumber || !phone) {
      res.status(400).json({ error: 'orderNumber and phone are required' });
      return;
    }
    const order = await orderService.getOrderByNumberAndPhone(orderNumber, phone);
    if (!order) throw new NotFoundError('Order not found');
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as OrderStatus | 'All' | undefined;
    const search = req.query.search as string | undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const offset = req.query.offset ? parseInt(String(req.query.offset), 10) : 0;

    const result = await orderService.listOrders({ status, search, limit, offset });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status,
      req.body.rejectionReason
    );
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

export async function approveOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, 'Paid');
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

export async function rejectOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const reason = String(req.body.reason || 'Payment rejected');
    const order = await orderService.updateOrderStatus(req.params.id, 'Awaiting Payment', reason);
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await orderService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function getProductionReport(_req: Request, res: Response, next: NextFunction) {
  try {
    const report = await orderService.getProductionReport();
    res.json(report);
  } catch (err) {
    next(err);
  }
}