const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export async function getProducts() {
  return apiRequest<{ products: any[] }>('/products');
}

export async function getProduct(id: string) {
  return apiRequest<{ product: any }>(`/products/${id}`);
}

export async function createOrder(formData: FormData) {
  return apiRequest<{ order: any }>('/orders', {
    method: 'POST',
    body: formData,
  });
}

export async function trackOrder(
  orderNumber: string,
  phone: string
) {
  return apiRequest<{ order: any | null }>(
    `/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`
  );
}

export async function adminLogin(
  username: string,
  password: string
) {
  return apiRequest<{ token: string; admin: any }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

export async function getAdminOrders(token: string) {
  return apiRequest<{ orders: any[]; total: number }>('/orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function approveOrder(
  orderId: string,
  token: string
) {
  return apiRequest<{ order: any }>(
    `/orders/${orderId}/approve`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function rejectOrder(
  orderId: string,
  reason: string,
  token: string
) {
  return apiRequest<{ order: any }>(
    `/orders/${orderId}/reject`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    }
  );
}