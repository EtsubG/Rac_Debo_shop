export type View = 'shop' | 'track' | 'admin';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'campaigns'
  | 'production'
  | 'settings';

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
  variants: ProductVariant[];
  active: boolean;
}

export interface OrderItem {
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
  customerName: string;
  phone: string;
  telegram: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  proofUrl?: string;
  createdAt: string;
  rejectionReason?: string;
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
  addedAt: string;
}
