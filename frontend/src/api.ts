import type {
  AdminUser,
  Campaign,
  DashboardStats,
  Order,
  OrderStatus,
  Product,
  ProductInput,
  ProductionReport,
} from '@/types';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ADMIN_TOKEN_KEY = 'rotaract_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function adminLogout(): void {
  clearAdminToken();
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAdminToken();

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAdminToken();
    }

    throw new Error(
      data?.error ||
      data?.message ||
      'Something went wrong'
    );
  }

  return data as T;
}

/* =========================================================
   PRODUCTS
   ========================================================= */

export async function getProducts(
  includeInactive = false
): Promise<{ products: Product[] }> {
  const query = includeInactive
    ? '?includeInactive=true'
    : '';

  return apiRequest<{ products: Product[] }>(
    `/products${query}`
  );
}

export async function getProduct(
  id: string
): Promise<{ product: Product }> {
  return apiRequest<{ product: Product }>(
    `/products/${encodeURIComponent(id)}`
  );
}

export async function createProduct(
  product: ProductInput
): Promise<{ product: Product }> {
  return apiRequest<{ product: Product }>('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function updateProduct(
  id: string,
  product: Partial<ProductInput>
): Promise<{ product: Product }> {
  return apiRequest<{ product: Product }>(
    `/products/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(product),
    }
  );
}

export async function deleteProduct(
  id: string
): Promise<void> {
  return apiRequest<void>(
    `/products/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    }
  );
}

export async function uploadProductImage(
  file: File
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);

  return apiRequest<{ url: string }>(
    '/products/upload-image',
    {
      method: 'POST',
      body: formData,
    }
  );
}

/* =========================================================
   ORDERS
   ========================================================= */

export async function createOrder(
  formData: FormData
): Promise<{ order: Order }> {
  return apiRequest<{ order: Order }>('/orders', {
    method: 'POST',
    body: formData,
  });
}

export async function trackOrder(
  orderNumber: string,
  phone: string
): Promise<{ order: Order }> {
  return apiRequest<{ order: Order }>(
    `/orders/track?orderNumber=${encodeURIComponent(
      orderNumber
    )}&phone=${encodeURIComponent(phone)}`
  );
}

export async function getAdminOrders(
  options: {
    status?: OrderStatus | 'All';
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ orders: Order[]; total: number }> {
  const params = new URLSearchParams();

  if (options.status && options.status !== 'All') {
    params.set('status', options.status);
  }

  if (options.search) {
    params.set('search', options.search);
  }

  if (options.limit !== undefined) {
    params.set('limit', String(options.limit));
  }

  if (options.offset !== undefined) {
    params.set('offset', String(options.offset));
  }

  const query = params.toString();

  return apiRequest<{ orders: Order[]; total: number }>(
    `/orders${query ? `?${query}` : ''}`
  );
}

export async function getOrder(
  id: string
): Promise<{ order: Order }> {
  return apiRequest<{ order: Order }>(
    `/orders/${encodeURIComponent(id)}`
  );
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  rejectionReason?: string
): Promise<{ order: Order }> {
  return apiRequest<{ order: Order }>(
    `/orders/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        rejectionReason,
      }),
    }
  );
}

export async function approveOrder(
  orderId: string
): Promise<{ order: Order }> {
  return apiRequest<{ order: Order }>(
    `/orders/${encodeURIComponent(orderId)}/approve`,
    {
      method: 'POST',
    }
  );
}

export async function rejectOrder(
  orderId: string,
  reason: string
): Promise<{ order: Order }> {
  return apiRequest<{ order: Order }>(
    `/orders/${encodeURIComponent(orderId)}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }
  );
}

/* =========================================================
   ADMIN AUTHENTICATION
   ========================================================= */

export async function adminLogin(
  username: string,
  password: string
): Promise<{
  token: string;
  admin: AdminUser;
}> {
  const result = await apiRequest<{
    token: string;
    admin: AdminUser;
  }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
    }),
  });

  setAdminToken(result.token);

  return result;
}

export async function getCurrentAdmin(): Promise<{
  admin: AdminUser;
}> {
  return apiRequest<{ admin: AdminUser }>('/admin/me');
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  return apiRequest<void>('/admin/change-password', {
    method: 'POST',
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });
}

/* =========================================================
   ADMIN USERS
   ========================================================= */

export async function getAdminUsers(): Promise<{
  admins: AdminUser[];
}> {
  return apiRequest<{ admins: AdminUser[] }>('/admin/users');
}

export async function createAdmin(
  input: {
    username: string;
    email: string;
    password: string;
    role?: 'super' | 'admin';
  }
): Promise<{ admin: AdminUser }> {
  return apiRequest<{ admin: AdminUser }>('/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      role: input.role ?? 'admin',
    }),
  });
}

export async function deleteAdmin(
  id: string
): Promise<void> {
  return apiRequest<void>(
    `/admin/users/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    }
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>('/admin/dashboard');
}

/* =========================================================
   PRODUCTION REPORT
   ========================================================= */

export async function getProductionReport(): Promise<ProductionReport> {
  return apiRequest<ProductionReport>(
    '/admin/production-report'
  );
}

/* =========================================================
   CAMPAIGNS
   ========================================================= */

export async function getCampaigns(): Promise<{
  campaigns: Campaign[];
}> {
  return apiRequest<{ campaigns: Campaign[] }>('/campaigns');
}

export async function getActiveCampaign(): Promise<{
  campaign: Campaign | null;
}> {
  return apiRequest<{ campaign: Campaign | null }>(
    '/campaigns/active'
  );
}

export async function createCampaign(
  campaign: {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
  }
): Promise<{ campaign: Campaign }> {
  return apiRequest<{ campaign: Campaign }>('/campaigns', {
    method: 'POST',
    body: JSON.stringify(campaign),
  });
}

export async function activateCampaign(
  id: string
): Promise<{ campaign: Campaign }> {
  return apiRequest<{ campaign: Campaign }>(
    `/campaigns/${encodeURIComponent(id)}/activate`,
    {
      method: 'POST',
    }
  );
}

export async function archiveCampaign(
  id: string
): Promise<void> {
  return apiRequest<void>(
    `/campaigns/${encodeURIComponent(id)}/archive`,
    {
      method: 'POST',
    }
  );
}