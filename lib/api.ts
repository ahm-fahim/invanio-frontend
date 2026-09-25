import { Category, Product, Order, Employee, DashboardResponse } from './types';

// Normalize the base URL from env variables and ensure NO trailing slash here
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.199:8000/api')
  .replace(/\/+$/, '');

/**
 * Generic Fetcher wrapper for api calls
 */
async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // 1. Critical Fix: Ensure all API endpoints have trailing slashes for Django compatibility.
  // We sanitize the endpoint to prevent double // but force a single / at the end.
  const sanitizedEndpoint = `/${endpoint.replace(/^\/+/, '').replace(/\/+$/, '')}/`;
  const url = `${API_BASE_URL}${sanitizedEndpoint}`;

  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  // 3. Fix: Only add content-type header if we are sending a JSON body[cite: 3].
  // Standard GET requests should not have this or a body[cite: 1, 2].
  const isBodyAllowed = options?.method && ['POST', 'PUT', 'PATCH'].includes(options.method);
  if (isBodyAllowed) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  // Handle errors
  if (!res.ok) {
    // 3. Fix: Capture detailed validation errors sent back by Django
    const errorData = await res.json().catch(() => ({}));
    console.error(`API Error details for ${url}:`, errorData);
    throw new Error(JSON.stringify(errorData) || `API Error: ${res.status} ${res.statusText}`);
  }

  // 2. Fix: Standardize DELETE response.
  // Django's delete returns 204 No Content, which res.json() will crash on[cite: 1, 2].
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return {} as T;
  }

  // Handle empty successful responses gracefully
  try {
    return await res.json();
  } catch (error) {
    // If json parsing fails on success (like empty object {}), return appropriate type
    return {} as T;
  }
}

/**
 * Clean Invanio API implementation
 */
export const api = {
  // Dashboard Metrics
  getDashboard: (threshold = 10) => fetcher<DashboardResponse>(`dashboard?threshold=${threshold}`),

  // Products CRUD
  getProducts: () => fetcher<Product[]>('products'),
  getProductDetail: (id: number) => fetcher<Product>(`products/${id}`),
  createProduct: (data: Partial<Product>) => fetcher<Product>('products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Partial<Product>) => fetcher<Product>(`products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => fetcher<void>(`products/${id}`, { method: 'DELETE' }),
  quickUpdateStock: (id: number, stock: number) => fetcher<Product>(`products/${id}/update_stock`, { method: 'PATCH', body: JSON.stringify({ stock }) }),

  // Categories CRUD
  getCategories: () => fetcher<Category[]>('categories'),
  getCategoryDetail: (id: number) => fetcher<Category>(`categories/${id}`),
  createCategory: (data: Partial<Category>) => fetcher<Category>('categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: Partial<Category>) => fetcher<Category>(`categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: number) => fetcher<void>(`categories/${id}`, { method: 'DELETE' }),

  // Orders CRUD & Lifecycle
  getOrders: () => fetcher<Order[]>('orders'),
  getOrderDetail: (id: number) => fetcher<Order>(`orders/${id}`),
  createOrder: (data: Order) => fetcher<Order>('orders', { method: 'POST', body: JSON.stringify(data) }),
  confirmOrder: (id: number) => fetcher<void>(`orders/${id}/confirm`, { method: 'POST' }),
  cancelOrder: (id: number) => fetcher<void>(`orders/${id}/cancel`, { method: 'POST' }),

  // Employees CRUD
  getEmployees: () => fetcher<Employee[]>('employees'),
  getEmployeeDetail: (id: number) => fetcher<Employee>(`employees/${id}`),
  createEmployee: (data: Partial<Employee>) => fetcher<Employee>('employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id: number, data: Partial<Employee>) => fetcher<Employee>(`employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEmployee: (id: number) => fetcher<void>(`employees/${id}`, { method: 'DELETE' }),
};