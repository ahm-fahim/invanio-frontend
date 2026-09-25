'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { DashboardData } from '@/lib/types';
import {
  DollarSign,
  ShoppingBag,
  PackageCheck,
  AlertTriangle,
  TrendingUp,
  Loader2,
  AlertCircle,
  Package,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardData();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard metrics. Check API connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        <Header breadcrumb="Dashboard Overview" />

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
            <p className="text-sm text-slate-500">Real-time metrics on sales revenue, order fulfillment, and stock health.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center p-24 text-slate-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="font-medium text-sm">Loading dashboard analytics...</span>
            </div>
          ) : (
            data && (
              <>
                {/* Overview Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Total Sales Amount */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Sales</p>
                      <h3 className="text-2xl font-extrabold text-slate-900">
                        ${data.overview.total_sales_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold pt-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Completed Revenue</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Completed Orders */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Completed Orders</p>
                      <h3 className="text-2xl font-extrabold text-slate-900">
                        {data.overview.completed_orders_count}
                      </h3>
                      <span className="text-xs text-slate-400">Fulfilled transactions</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Total Stock Units */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Stock Units</p>
                      <h3 className="text-2xl font-extrabold text-slate-900">
                        {data.overview.total_stock_units}
                      </h3>
                      <span className="text-xs text-slate-400">Items in inventory</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <PackageCheck className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Low Stock Count */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Low Stock Alert</p>
                      <h3 className="text-2xl font-extrabold text-slate-900">
                        {data.overview.low_stock_count}
                      </h3>
                      <span className={`text-xs font-semibold ${data.overview.low_stock_count > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {data.overview.low_stock_count > 0 ? 'Action required' : 'Stock level healthy'}
                      </span>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                      data.overview.low_stock_count > 0 
                        ? 'bg-rose-50 border-rose-100 text-rose-600' 
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Main Section Grid: Sales Performance + Low Stock Alert Table */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Product Sales Performance Report Table */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Sales Performance</h3>
                        <p className="text-xs text-slate-500">Breakdown of product sales and earned revenue</p>
                      </div>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        {data.sales_report.length} Products Sold
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <th className="p-3 pl-4">Product Name</th>
                            <th className="p-3 text-center">Units Sold</th>
                            <th className="p-3 text-right pr-4">Total Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium">
                          {data.sales_report.map((item) => (
                            <tr key={item.product__id} className="hover:bg-slate-50/60 transition-all">
                              <td className="p-3 pl-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                                    <Package className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block">{item.product__name}</span>
                                    <span className="text-xs text-slate-400 font-mono">ID: #{item.product__id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                                  {item.total_quantity_sold} pcs
                                </span>
                              </td>
                              <td className="p-3 text-right pr-4 font-bold text-slate-900">
                                ${item.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Low Stock Alert Sidebar Table */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Low Stock Warnings</h3>
                          <p className="text-xs text-slate-500">Products requiring inventory replenishment</p>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      </div>

                      {data.low_stock_products.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 space-y-2">
                          <PackageCheck className="w-8 h-8 mx-auto text-emerald-500" />
                          <p className="text-xs">All inventory items are sufficiently stocked.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {data.low_stock_products.map((prod) => (
                            <div
                              key={prod.id}
                              className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                {prod.image_url || prod.image ? (
                                  <img
                                    src={prod.image_url || prod.image}
                                    alt={prod.name}
                                    className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                                    N/A
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-bold text-slate-900 text-xs">{prod.name}</h4>
                                  <span className="text-[11px] text-slate-400 capitalize">
                                    Cat: {prod.category_name || prod.category}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs inline-block">
                                  Stock: {prod.stock}
                                </span>
                                <span className="block text-[11px] font-bold text-slate-500 mt-1">
                                  ${prod.discount_price || prod.regular_price}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <a
                      href="/products"
                      className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all mt-4"
                    >
                      <span>Manage Products Inventory</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </main>
    </div>
  );
}