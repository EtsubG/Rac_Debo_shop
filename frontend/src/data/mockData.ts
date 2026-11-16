import type {
  Product,
  Order,
  Campaign,
  AdminUser,
  OrderStatus,
} from '@/types';

export const products: Product[] = [
  {
    id: 'p1',
    title: 'Classic Logo T-Shirt',
    description: 'Premium cotton tee with embroidered Rotaract Club of Debo logo.',
    price: 650,
    category: 'T-Shirt',
    image:
      'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800',
    target: 100,
    currentOrders: 67,
    active: true,
    variants: [
      { id: 'v1', color: 'Cranberry Red', hex: '#D91B5C', sizes: ['S', 'M', 'L', 'XL', 'XXL'], active: true },
      { id: 'v2', color: 'Navy Blue', hex: '#1D2939', sizes: ['S', 'M', 'L', 'XL', 'XXL'], active: true },
      { id: 'v3', color: 'White', hex: '#FFFFFF', sizes: ['M', 'L', 'XL'], active: true },
      { id: 'v4', color: 'Charcoal', hex: '#36454F', sizes: ['S', 'M', 'L', 'XL'], active: false },
    ],
  },
  {
    id: 'p2',
    title: 'Rotaract Club Hoodie',
    description: 'Warm fleece-lined hoodie with raised club crest.',
    price: 1200,
    category: 'Hoodie',
    image:
      'https://images.pexels.com/photos/8217427/pexels-photo-8217427.jpeg?auto=compress&cs=tinysrgb&w=800',
    target: 80,
    currentOrders: 34,
    active: true,
    variants: [
      { id: 'v1', color: 'Navy Blue', hex: '#1D2939', sizes: ['S', 'M', 'L', 'XL', 'XXL'], active: true },
      { id: 'v2', color: 'Cranberry Red', hex: '#D91B5C', sizes: ['M', 'L', 'XL'], active: true },
      { id: 'v3', color: 'Black', hex: '#1a1a1a', sizes: ['S', 'M', 'L', 'XL'], active: true },
    ],
  },
  {
    id: 'p3',
    title: 'Canvas Tote Bag',
    description: 'Eco-friendly canvas bag with screen-printed club slogan.',
    price: 350,
    category: 'Tote Bag',
    image:
      'https://images.pexels.com/photos/1201033/pexels-photo-1201033.jpeg?auto=compress&cs=tinysrgb&w=800',
    target: 150,
    currentOrders: 112,
    active: true,
    variants: [
      { id: 'v1', color: 'Natural', hex: '#e8dccc', sizes: ['One Size'], active: true },
      { id: 'v2', color: 'Navy Blue', hex: '#1D2939', sizes: ['One Size'], active: true },
      { id: 'v3', color: 'Cranberry Red', hex: '#D91B5C', sizes: ['One Size'], active: true },
    ],
  },
  {
    id: 'p4',
    title: 'Embroidered Club Cap',
    description: 'Adjustable snapback cap with stitched club initials.',
    price: 400,
    category: 'Cap',
    image:
      'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=800',
    target: 60,
    currentOrders: 18,
    active: true,
    variants: [
      { id: 'v1', color: 'Navy Blue', hex: '#1D2939', sizes: ['Adjustable'], active: true },
      { id: 'v2', color: 'White', hex: '#FFFFFF', sizes: ['Adjustable'], active: true },
      { id: 'v3', color: 'Cranberry Red', hex: '#D91B5C', sizes: ['Adjustable'], active: true },
    ],
  },
  {
    id: 'p5',
    title: 'Rotaract Coffee Mug',
    description: 'Ceramic mug with wrap-around club artwork.',
    price: 250,
    category: 'Mug',
    image:
      'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
    target: 100,
    currentOrders: 45,
    active: true,
    variants: [
      { id: 'v1', color: 'White', hex: '#FFFFFF', sizes: ['11oz'], active: true },
      { id: 'v2', color: 'Navy Blue', hex: '#1D2939', sizes: ['11oz'], active: true },
    ],
  },
  {
    id: 'p6',
    title: 'Premium Performance Tee',
    description: 'Moisture-wicking athletic fit tee for active Rotaractors.',
    price: 750,
    category: 'T-Shirt',
    image:
      'https://images.pexels.com/photos/1655582/pexels-photo-1655582.jpeg?auto=compress&cs=tinysrgb&w=800',
    target: 50,
    currentOrders: 8,
    active: false,
    variants: [
      { id: 'v1', color: 'Cranberry Red', hex: '#D91B5C', sizes: ['S', 'M', 'L', 'XL'], active: true },
      { id: 'v2', color: 'Black', hex: '#1a1a1a', sizes: ['S', 'M', 'L', 'XL'], active: true },
    ],
  },
];

export const orders: Order[] = [
  {
    id: 'o1',
    orderNumber: 'DEBO-0042',
    customerName: 'Hanna Tesfaye',
    phone: '0912345678',
    telegram: '@hanna_t',
    notes: 'Please deliver after 3pm',
    items: [
      { productId: 'p1', productTitle: 'Classic Logo T-Shirt', color: 'Cranberry Red', size: 'M', quantity: 2, unitPrice: 650 },
    ],
    total: 1300,
    status: 'Proof Uploaded',
    proofUrl: 'https://images.pexels.com/photos/8427110/pexels-photo-8427110.jpeg?auto=compress&cs=tinysrgb&w=600',
    createdAt: '2026-09-08T10:30:00',
  },
  {
    id: 'o2',
    orderNumber: 'DEBO-0041',
    customerName: 'Yonas Girma',
    phone: '0987654321',
    telegram: '@yonas_g',
    items: [
      { productId: 'p2', productTitle: 'Rotaract Club Hoodie', color: 'Navy Blue', size: 'L', quantity: 1, unitPrice: 1200 },
      { productId: 'p3', productTitle: 'Canvas Tote Bag', color: 'Natural', size: 'One Size', quantity: 1, unitPrice: 350 },
    ],
    total: 1550,
    status: 'Paid',
    proofUrl: 'https://images.pexels.com/photos/8427110/pexels-photo-8427110.jpeg?auto=compress&cs=tinysrgb&w=600',
    createdAt: '2026-09-08T09:15:00',
  },
  {
    id: 'o3',
    orderNumber: 'DEBO-0040',
    customerName: 'Selam Abebe',
    phone: '0923456789',
    telegram: '@selam_a',
    items: [
      { productId: 'p4', productTitle: 'Embroidered Club Cap', color: 'Navy Blue', size: 'Adjustable', quantity: 1, unitPrice: 400 },
    ],
    total: 400,
    status: 'Confirmed',
    createdAt: '2026-09-07T14:20:00',
  },
  {
    id: 'o4',
    orderNumber: 'DEBO-0039',
    customerName: 'Dawit Kebede',
    phone: '0934567890',
    telegram: '@dawit_k',
    items: [
      { productId: 'p1', productTitle: 'Classic Logo T-Shirt', color: 'Navy Blue', size: 'XL', quantity: 3, unitPrice: 650 },
    ],
    total: 1950,
    status: 'Awaiting Payment',
    createdAt: '2026-09-09T08:00:00',
  },
  {
    id: 'o5',
    orderNumber: 'DEBO-0038',
    customerName: 'Bethel Mengistu',
    phone: '0945678901',
    telegram: '@bethel_m',
    items: [
      { productId: 'p5', productTitle: 'Rotaract Coffee Mug', color: 'White', size: '11oz', quantity: 2, unitPrice: 250 },
      { productId: 'p3', productTitle: 'Canvas Tote Bag', color: 'Navy Blue', size: 'One Size', quantity: 1, unitPrice: 350 },
    ],
    total: 850,
    status: 'Production',
    createdAt: '2026-09-06T11:45:00',
  },
  {
    id: 'o6',
    orderNumber: 'DEBO-0037',
    customerName: 'Nahom Tadesse',
    phone: '0956789012',
    telegram: '@nahom_t',
    items: [
      { productId: 'p2', productTitle: 'Rotaract Club Hoodie', color: 'Cranberry Red', size: 'M', quantity: 1, unitPrice: 1200 },
    ],
    total: 1200,
    status: 'Ready',
    createdAt: '2026-09-05T16:30:00',
  },
  {
    id: 'o7',
    orderNumber: 'DEBO-0036',
    customerName: 'Liya Solomon',
    phone: '0967890123',
    telegram: '@liya_s',
    items: [
      { productId: 'p1', productTitle: 'Classic Logo T-Shirt', color: 'White', size: 'L', quantity: 1, unitPrice: 650 },
    ],
    total: 650,
    status: 'Delivered',
    createdAt: '2026-09-04T10:00:00',
  },
  {
    id: 'o8',
    orderNumber: 'DEBO-0035',
    customerName: 'Abel Bekele',
    phone: '0978901234',
    telegram: '@abel_b',
    items: [
      { productId: 'p4', productTitle: 'Embroidered Club Cap', color: 'Cranberry Red', size: 'Adjustable', quantity: 2, unitPrice: 400 },
    ],
    total: 800,
    status: 'Proof Uploaded',
    proofUrl: 'https://images.pexels.com/photos/8427110/pexels-photo-8427110.jpeg?auto=compress&cs=tinysrgb&w=600',
    createdAt: '2026-09-09T07:30:00',
  },
];

export const campaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Campaign 1',
    description: 'Fall 2026 community service fundraiser — our first merchandise pre-order drive.',
    active: true,
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    orderCount: 42,
    totalSales: 7900,
  },
  {
    id: 'c2',
    name: 'Campaign 0 (Pilot)',
    description: 'Spring 2026 pilot run — limited items, internal members only.',
    active: false,
    startDate: '2026-03-01',
    endDate: '2026-04-15',
    orderCount: 28,
    totalSales: 4200,
  },
];

export const adminUsers: AdminUser[] = [
  { id: 'a1', username: 'rotaract_admin', email: 'admin@deboclub.org', role: 'super', addedAt: '2026-01-15' },
  { id: 'a2', username: 'merch_manager', email: 'merch@deboclub.org', role: 'admin', addedAt: '2026-06-01' },
];

export const statusColors: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  'Awaiting Payment': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Proof Uploaded': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Paid': { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Confirmed': { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
  'Production': { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  'Ready': { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  'Delivered': { bg: 'bg-gray-200', text: 'text-gray-600', dot: 'bg-gray-400' },
};

export const statusOrder: OrderStatus[] = [
  'Awaiting Payment',
  'Proof Uploaded',
  'Paid',
  'Confirmed',
  'Production',
  'Ready',
  'Delivered',
];

export const paymentInstructions = [
  { label: 'Telebirr Number', value: '0911 23 45 67' },
  { label: 'CBE Account', value: '1000 2045 6789' },
  { label: 'Account Name', value: 'Rotaract Club of Debo' },
];
