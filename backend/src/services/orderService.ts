import { supabase } from '../config/supabase.js';
import { getProductById } from './productService.js';
import { generateOrderNumber } from '../utils/orderNumber.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import type { Order, OrderItem, OrderStatus } from '../types/index.js';

interface OrderRow {
  id: string;
  order_number: string;
  campaign_id: string | null;
  customer_name: string;
  phone: string;
  telegram: string;
  notes: string | null;
  total: number;
  status: OrderStatus;
  proof_url: string | null;
  rejection_reason: string | null;
  created_at: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
}

function mapItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id ?? '',
    productTitle: row.product_title,
    color: row.color,
    size: row.size,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
  };
}

function mapOrder(row: OrderRow, items: OrderItemRow[]): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    campaignId: row.campaign_id,
    customerName: row.customer_name,
    phone: row.phone,
    telegram: row.telegram,
    notes: row.notes ?? undefined,
    items: items.map(mapItem),
    total: Number(row.total),
    status: row.status,
    proofUrl: row.proof_url ?? undefined,
    rejectionReason: row.rejection_reason ?? undefined,
    createdAt: row.created_at,
  };
}

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  telegram: string;
  notes?: string;
  items: { productId: string; color: string; size: string; quantity: number }[];
}

export async function createOrder(
  input: CreateOrderInput,
  proofUrl?: string
): Promise<Order> {
  if (input.items.length === 0) throw new BadRequestError('Order must contain at least one item');

  // Resolve product details and compute total
  const resolvedItems: Omit<OrderItemRow, 'id' | 'order_id'>[] = [];
  let total = 0;

  for (const line of input.items) {
    const product = await getProductById(line.productId);
    if (!product.active) throw new BadRequestError(`Product "${product.title}" is not available`);

    const variant = product.variants.find(
      (v) => v.color.toLowerCase() === line.color.toLowerCase() && v.active
    );
    if (!variant) throw new BadRequestError(`Color "${line.color}" not available for ${product.title}`);
    if (!variant.sizes.includes(line.size)) {
      throw new BadRequestError(`Size "${line.size}" not available for ${product.title} (${variant.color})`);
    }

    const lineTotal = product.price * line.quantity;
    total += lineTotal;

    resolvedItems.push({
      product_id: product.id,
      product_title: product.title,
      color: variant.color,
      size: line.size,
      quantity: line.quantity,
      unit_price: product.price,
    });
  }

  const orderNumber = await generateOrderNumber();

  // Find active campaign
  const { data: activeCampaign } = await supabase
    .from('campaigns')
    .select('id')
    .eq('active', true)
    .maybeSingle();

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      campaign_id: activeCampaign?.id ?? null,
      customer_name: input.customerName,
      phone: input.phone,
      telegram: input.telegram,
      notes: input.notes ?? null,
      total,
      status: proofUrl ? 'Proof Uploaded' : 'Awaiting Payment',
      proof_url: proofUrl ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;

  const { error: itemErr } = await supabase.from('order_items').insert(
    resolvedItems.map((i) => ({ ...i, order_id: order.id }))
  );
  if (itemErr) throw itemErr;

  return getOrderById(order.id);
}

export async function getOrderById(id: string): Promise<Order> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!order) throw new NotFoundError('Order not found');

  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  if (iErr) throw iErr;

  return mapOrder(order as OrderRow, (items ?? []) as OrderItemRow[]);
}

export async function getOrderByNumberAndPhone(
  orderNumber: string,
  phone: string
): Promise<Order | null> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .ilike('order_number', orderNumber)
    .eq('phone', phone)
    .maybeSingle();

  if (error) throw error;
  if (!order) return null;

  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  if (iErr) throw iErr;

  return mapOrder(order as OrderRow, (items ?? []) as OrderItemRow[]);
}

export interface ListOrdersFilters {
  status?: OrderStatus | 'All';
  search?: string;
  limit?: number;
  offset?: number;
}

export async function listOrders(filters: ListOrdersFilters = {}): Promise<{
  orders: Order[];
  total: number;
}> {
  let query = supabase.from('orders').select('*', { count: 'exact' });

  if (filters.status && filters.status !== 'All') {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    const s = `%${filters.search}%`;
    query = query.or(
      `order_number.ilike.${s},customer_name.ilike.${s},phone.ilike.${s}`
    );
  }

  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const { data: orders, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  if (!orders || orders.length === 0) return { orders: [], total: count ?? 0 };

  const ids = orders.map((o) => o.id);
  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', ids);

  if (iErr) throw iErr;

  const byOrder = new Map<string, OrderItemRow[]>();
  for (const it of (items ?? []) as OrderItemRow[]) {
    if (!byOrder.has(it.order_id)) byOrder.set(it.order_id, []);
    byOrder.get(it.order_id)!.push(it);
  }

  return {
    orders: (orders as OrderRow[]).map((o) => mapOrder(o, byOrder.get(o.id) ?? [])),
    total: count ?? 0,
  };
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  rejectionReason?: string
): Promise<Order> {
  const update: Record<string, unknown> = { status };
  if (status === 'Awaiting Payment' && rejectionReason) {
    update.rejection_reason = rejectionReason;
    update.proof_url = null;
  }

  const { error } = await supabase.from('orders').update(update).eq('id', id);
  if (error) throw error;

  return getOrderById(id);
}

export async function attachProof(id: string, proofUrl: string): Promise<Order> {
  const { error } = await supabase
    .from('orders')
    .update({ proof_url: proofUrl, status: 'Proof Uploaded', rejection_reason: null })
    .eq('id', id);

  if (error) throw error;
  return getOrderById(id);
}

export async function updateOrderNotes(id: string, notes: string): Promise<Order> {
  const { error } = await supabase.from('orders').update({ notes }).eq('id', id);
  if (error) throw error;
  return getOrderById(id);
}

export interface ProductionRow {
  product: string;
  color: string;
  size: string;
  quantity: number;
  category: string;
}

export async function getProductionReport(): Promise<{
  rows: ProductionRow[];
  totalUnits: number;
  byProduct: Record<string, number>;
  ordersInProduction: number;
}> {
  const included: OrderStatus[] = ['Confirmed', 'Production', 'Ready', 'Delivered'];

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, status')
    .in('status', included);

  if (error) throw error;

  if (!orders || orders.length === 0) {
    return { rows: [], totalUnits: 0, byProduct: {}, ordersInProduction: 0 };
  }

  const orderIds = orders.map((o) => o.id);
  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  if (iErr) throw iErr;

  const productIds = Array.from(
    new Set((items ?? []).map((i) => i.product_id).filter(Boolean))
  ) as string[];

  const { data: products } = productIds.length
    ? await supabase.from('products').select('id, category').in('id', productIds)
    : { data: [] as { id: string; category: string }[] };

  const categoryById = new Map((products ?? []).map((p) => [p.id, p.category]));

  const map = new Map<string, ProductionRow>();
  for (const it of (items ?? []) as OrderItemRow[]) {
    const key = `${it.product_title}|${it.color}|${it.size}`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += it.quantity;
    } else {
      map.set(key, {
        product: it.product_title,
        color: it.color,
        size: it.size,
        quantity: it.quantity,
        category: it.product_id ? categoryById.get(it.product_id) ?? '' : '',
      });
    }
  }

  const rows = Array.from(map.values()).sort((a, b) => {
    if (a.product !== b.product) return a.product.localeCompare(b.product);
    if (a.color !== b.color) return a.color.localeCompare(b.color);
    return a.size.localeCompare(b.size);
  });

  const totalUnits = rows.reduce((s, r) => s + r.quantity, 0);
  const byProduct: Record<string, number> = {};
  for (const r of rows) byProduct[r.product] = (byProduct[r.product] ?? 0) + r.quantity;

  const ordersInProduction = orders.filter((o) =>
    ['Confirmed', 'Production'].includes(o.status)
  ).length;

  return { rows, totalUnits, byProduct, ordersInProduction };
}

export interface DashboardStats {
  totalOrders: number;
  totalSales: number;
  totalPaid: number;
  pendingPayments: number;
  recentOrders: Order[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const all = (orders ?? []) as OrderRow[];
  const totalOrders = all.length;
  const totalSales = all.reduce((s, o) => s + Number(o.total), 0);
  const paidStatuses: OrderStatus[] = ['Paid', 'Confirmed', 'Production', 'Ready', 'Delivered'];
  const totalPaid = all
    .filter((o) => paidStatuses.includes(o.status))
    .reduce((s, o) => s + Number(o.total), 0);
  const pendingPayments = all.filter(
    (o) => o.status === 'Awaiting Payment' || o.status === 'Proof Uploaded'
  ).length;

  const recentIds = all.slice(0, 5).map((o) => o.id);
  const { data: items } = recentIds.length
    ? await supabase.from('order_items').select('*').in('order_id', recentIds)
    : { data: [] as OrderItemRow[] };

  const byOrder = new Map<string, OrderItemRow[]>();
  for (const it of (items ?? []) as OrderItemRow[]) {
    if (!byOrder.has(it.order_id)) byOrder.set(it.order_id, []);
    byOrder.get(it.order_id)!.push(it);
  }

  const recentOrders = all.slice(0, 5).map((o) => mapOrder(o, byOrder.get(o.id) ?? []));

  return { totalOrders, totalSales, totalPaid, pendingPayments, recentOrders };
}