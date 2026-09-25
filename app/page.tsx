'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { DashboardResponse } from '@/lib/types';
import { CreditCard, ClipboardList, Package, AlertTriangle, TrendingUp, Plus, BarChart2 } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        <Header breadcrumb="Dashboard" />

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-emerald-600">All systems operational</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">Good morning, Jordan</h2>
              <p className="text-slate-500 text-sm mt-1">Here&apos;s what&apos;s happening with your store today.</p>
            </div>

            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all">
              <Plus className="w-4 h-4" />
              Create order
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Sales */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> 12.8%
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Total sales</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  ${loading ? '...' : Number(data?.overview.total_sales_amount || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> 8.2%
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Completed orders</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {loading ? '...' : data?.overview.completed_orders_count || 0}
                </p>
              </div>
            </div>

            {/* Stock Units */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> 3.1%
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Stock units</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {loading ? '...' : data?.overview.total_stock_units || 0}
                </p>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> 2 new
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Low stock alerts</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {loading ? '...' : data?.overview.low_stock_count || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Sales Overview Chart & Low Stock Items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Overview Chart (2 Columns) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Sales overview</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Monthly revenue performance</p>
                </div>
                <BarChart2 className="w-5 h-5 text-slate-400" />
              </div>

              {/* Bar Chart Simulation matching Screenshot */}
              <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-4">
                {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((month, idx) => {
                  const heights = [40, 55, 48, 65, 52, 72, 60, 50, 68, 55, 88, 75];
                  const isPeak = idx === 10; // Highlighting November bar like screenshot
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <div
                        style={{ height: `${heights[idx]}%` }}
                        className={`w-full rounded-lg transition-all ${
                          isPeak ? 'bg-indigo-600' : 'bg-indigo-100 group-hover:bg-indigo-200'
                        }`}
                      ></div>
                      <span className="text-[11px] font-semibold text-slate-400 mt-3">{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Low Stock Alerts List (1 Column) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Low stock alerts</h3>
                <p className="text-xs text-slate-400 mt-0.5">Items that need your attention</p>

                <div className="mt-6 space-y-4">
                  {loading ? (
                    <p className="text-sm text-slate-400">Loading alerts...</p>
                  ) : data?.low_stock_products.length === 0 ? (
                    <p className="text-sm text-slate-400">All products are adequately stocked.</p>
                  ) : (
                    data?.low_stock_products.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100/60 text-amber-600 flex items-center justify-center font-bold text-xs">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-400">SKU-{item.id}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                          {item.stock} left
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                View all inventory
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}