'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { Order, Product } from '@/lib/types';
import { ShoppingCart, Plus, CheckCircle, XCircle, User, MapPin, Phone } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [shippingCost, setShippingCost] = useState('60.00');
  const [discount, setDiscount] = useState('0.00');
  const [selectedProduct, setSelectedProduct] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([api.getOrders(), api.getProducts()]);
      setOrders(ordersRes);
      setProducts(productsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !customerName) return;

    const payload: Order = {
      customer_name: customerName,
      phone,
      location,
      delivery_location: deliveryLocation,
      shipping_cost: shippingCost,
      discount,
      items: [
        {
          product: Number(selectedProduct),
          quantity: Number(quantity),
        },
      ],
    };

    try {
      await api.createOrder(payload);
      setIsModalOpen(false);
      setCustomerName('');
      setPhone('');
      setSelectedProduct('');
      loadData();
    } catch (err) {
      alert('Failed to place order. Check product stock.');
    }
  };

  const handleConfirm = async (id: number) => {
    await api.confirmOrder(id);
    loadData();
  };

  const handleCancel = async (id: number) => {
    await api.cancelOrder(id);
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Header breadcrumb="Orders" />

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Order Management</h2>
              <p className="text-sm text-slate-500">Track sales orders, confirm completions, or issue cancellations.</p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create New Order
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Total Items</th>
                  <th className="p-4">Billing Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-400">Loading order records...</td></tr>
                ) : orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="p-4 pl-6 font-bold text-slate-900">#{ord.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> {ord.customer_name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {ord.phone || 'N/A'}</p>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{ord.total_quantity} pcs</td>
                    <td className="p-4 font-bold text-slate-900">${ord.total_amount}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        ord.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                        ord.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6 space-x-2">
                      {ord.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleConfirm(ord.id!)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold">
                            Confirm
                          </button>
                          <button onClick={() => handleCancel(ord.id!)} className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold">
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Create POS Sales Order</h3>
              <form onSubmit={handleCreateOrder} className="space-y-3">
                <input type="text" placeholder="Customer Name" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm" />
                <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm" />
                <input type="text" placeholder="Delivery Location" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm" />

                <div className="grid grid-cols-2 gap-3">
                  <select required value={selectedProduct} onChange={(e) => setSelectedProduct(Number(e.target.value))} className="px-4 py-2 rounded-xl border border-slate-200 text-sm">
                    <option value="">Select Item</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (${p.regular_price})</option>
                    ))}
                  </select>
                  <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="px-4 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold text-slate-600">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white">Submit Order</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}