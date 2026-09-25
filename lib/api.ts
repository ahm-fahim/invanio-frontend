import { Category, Product, Order, Employee, DashboardResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.199:8000/api/';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: (threshold = 10) => fetcher<DashboardResponse>(`/dashboard/?threshold=${threshold}`),

  // Products
  getProducts: () => fetcher<Product[]>('/products/'),
  createProduct: (data: Partial<Product>) => fetcher<Product>('/products/', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Partial<Product>) => fetcher<Product>(`/products/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => fetcher<void>(`/products/${id}/`, { method: 'DELETE' }),
  quickUpdateStock: (id: number, stock: number) => fetcher<Product>(`/products/${id}/update_stock/`, { method: 'PATCH', body: JSON.stringify({ stock }) }),

  // Categories
  getCategories: () => fetcher<Category[]>('/categories/'),
  createCategory: (data: Partial<Category>) => fetcher<Category>('/categories/', { method: 'POST', body: JSON.stringify(data) }),
  deleteCategory: (id: number) => fetcher<void>(`/categories/${id}/`, { method: 'DELETE' }),

  // Orders
  getOrders: () => fetcher<Order[]>('/orders/'),
  createOrder: (data: Order) => fetcher<Order>('/orders/', { method: 'POST', body: JSON.stringify(data) }),
  confirmOrder: (id: number) => fetcher<void>(`/orders/${id}/confirm/`, { method: 'POST' }),
  cancelOrder: (id: number) => fetcher<void>(`/orders/${id}/cancel/`, { method: 'POST' }),

  // Employees
  getEmployees: () => fetcher<Employee[]>('/employees/'),
  createEmployee: (data: Partial<Employee>) => fetcher<Employee>('/employees/', { method: 'POST', body: JSON.stringify(data) }),
  deleteEmployee: (id: number) => fetcher<void>(`/employees/${id}/`, { method: 'DELETE' }),
};