export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  category: number;
  category_name?: string;
  name: string;
  regular_price: string;
  discount_price?: string | null;
  stock: number;
  image?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id?: number;
  product: number;
  product_name?: string;
  quantity: number;
  price?: string;
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
  items: OrderItem[];
  created_at?: string;
}

export interface Employee {
  id: number;
  employee_id: string;
  name: string;
  designation: string;
  salary: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
}

export interface DashboardResponse {
  overview: {
    total_sales_amount: string;
    completed_orders_count: number;
    total_stock_units: number;
    low_stock_count: number;
  };
  sales_report: Array<{
    product__id: number;
    product__name: string;
    total_quantity_sold: number;
    total_revenue: string;
  }>;
  low_stock_products: Product[];
}