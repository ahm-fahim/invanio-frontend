'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts()
      .then((res) => setProducts(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Header breadcrumb="Products" />

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Inventory Catalog</h2>
              <p className="text-sm text-slate-500">Manage products, pricing, and stock levels.</p>
            </div>

            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                  <th className="p-4 pl-6">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-400">Loading catalog...</td></tr>
                ) : products.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="p-4 pl-6 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                      {item.name}
                    </td>
                    <td className="p-4 text-slate-500">{item.category_name || 'General'}</td>
                    <td className="p-4 font-semibold text-slate-900">${item.regular_price}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.stock < 10 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {item.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2"></span>
                      Active
                    </td>
                    <td className="p-4 text-right pr-6 space-x-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}