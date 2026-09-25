// lib/types.ts

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  category: number; // Foreign Key ID for creating
  category_name?: string; // For listing display
  name: string;
  regular_price: string;
  discount_price?: string | null;
  sizes: string;
  description: string;
  stock: number;
  image?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id?: number;
  product: number; // Foreign Key ID for creating
  product_name?: string; // For display
  quantity: number;
  price?: string; // Snapshot price
}

export interface Order {
  id?: number;
  customer_name: string;
  phone: string;
  location?: string;
  delivery_location?: string;
  shipping_cost: string;
  discount: string;
  total_quantity?: number;
  total_amount?: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  items: OrderItem[]; // Nested items required on creation
  created_at?: string;
}

export interface Employee {
  id: number;
  employee_id: string; // "EMP-101" unique code
  name: string;
  designation: string;
  phone: string;
  address: string;
  salary: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
}

// Dashboard Report Schemas
export interface SalesReportItem {
  product__id: number;
  product__name: string;
  total_quantity_sold: number;
  total_revenue: number;
}

export interface DashboardOverview {
  total_sales_amount: number;
  completed_orders_count: number;
  total_stock_units: number;
  low_stock_count: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  sales_report: SalesReportItem[];
  low_stock_products: Product[];
}