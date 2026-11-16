export type OrderStatus =
  | 'Awaiting Payment'
  | 'Proof Uploaded'
  | 'Paid'
  | 'Confirmed'
  | 'Production'
  | 'Ready'
  | 'Delivered';

export type ProductCategory = 'T-Shirt' | 'Hoodie' | 'Tote Bag' | 'Cap' | 'Mug';

export interface ProductVariant {
  id: string;
  productId: string;
  color: string;
  hex: string;
  sizes: string[];
  active: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  target: number;
  currentOrders: number;
  active: boolean;
  variants: ProductVariant[];
}

export interface OrderItem {
  id?: string;
  productId: string;
  productTitle: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  campaignId?: string | null;
  customerName: string;
  phone: string;
  telegram: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  proofUrl?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  active: boolean;
  startDate: string;
  endDate: string;
  orderCount: number;
  totalSales: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super' | 'admin';
  createdAt: string;
}

export interface JwtPayload {
  sub: string;
  username: string;
  role: 'super' | 'admin';
}