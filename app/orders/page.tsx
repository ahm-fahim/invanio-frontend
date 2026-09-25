'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { Order, Product } from '@/lib/types';
import { ShoppingCart, Plus, Eye, CheckCircle2, XCircle, Trash2, Loader2, X, AlertCircle } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Form State for Creating Order
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Dhaka');
  const [deliveryLocation, setDeliveryLocation] = useState('Dhaka'); // REQUIRED BY BACKEND
  const [shippingCost, setShippingCost] = useState('60.00');
  const [discount, setDiscount] = useState('0.00');
  const [orderItems, setOrderItems] = useState<{ product: number; quantity: number }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
      ]);
      setOrders(ordersRes);
      setProducts(productsRes);
    } catch (err) {
      console.error('Failed to load orders data:', err);
      setError('Failed to fetch orders or products. Check Django connection.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setCustomerName('');
    setPhone('');
    setLocation('Dhaka');
    setDeliveryLocation('Dhaka');
    setShippingCost('60.00');
    setDiscount('0.00');
    
    if (products.length > 0) {
      setOrderItems([{ product: products[0].id, quantity: 1 }]);
    } else {
      setOrderItems([]);
    }
    setIsCreateModalOpen(true);
  };

  const handleAddItemRow = () => {
    if (products.length === 0) return;
    setOrderItems([...orderItems, { product: products[0].id, quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'product' | 'quantity', value: number) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !deliveryLocation || orderItems.length === 0) {
      alert('Please fill customer details, delivery location, and add at least one product.');
      return;
    }

    setModalLoading(true);
    const newOrderPayload: Order = {
      customer_name: customerName,
      phone,
      location: location || deliveryLocation,
      delivery_location: deliveryLocation, // Fixed: Explicitly passed to clear 400 error
      shipping_cost: shippingCost,
      discount: discount,
      items: orderItems,
    };

    try {
      await api.createOrder(newOrderPayload);
      setIsCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Create Order Error:', err);
      alert(`Failed to create order: ${err.message || 'Check validation parameters.'}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmOrder = async (id: number) => {
    if (confirm('Confirm this order and deduct stock?')) {
      try {
        await api.confirmOrder(id);
        loadData();
      } catch (err) {
        alert('Could not confirm order.');
      }
    }
  };

  const handleCancelOrder = async (id: number) => {
    if (confirm('Cancel this order?')) {
      try {
        await api.cancelOrder(id);
        loadData();
      } catch (err) {
        alert('Could not cancel order.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        <Header breadcrumb="Orders Management" />

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Orders List</h2>
              <p className="text-sm text-slate-500">Track incoming sales, inspect details, and update statuses.</p>
            </div>

            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Create Order
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Delivery Location</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        <span>Loading order records...</span>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No orders found. Click &quot;Create Order&quot; to log a new purchase order.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition-all">
                      <td className="p-4 pl-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-indigo-600" />
                          <span>#{ord.id}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-900 font-bold">{ord.customer_name}</td>
                      <td className="p-4 text-slate-600 font-mono text-xs">{ord.phone}</td>
                      <td className="p-4 text-slate-600 text-xs">{ord.delivery_location || ord.location || 'N/A'}</td>
                      <td className="p-4 text-slate-900 font-bold">${ord.total_amount || '0.00'}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            ord.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : ord.status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}
                        >
                          {ord.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6 space-x-1">
                        <button
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                          <>
                            <button
                              onClick={() => ord.id && handleConfirmOrder(ord.id)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Confirm Order"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => ord.id && handleCancelOrder(ord.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Cancel Order"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Order Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Create New Order</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Tamanna"
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="02485382452"
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Location / Billing Address</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Dhaka"
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Delivery Location (Required)</label>
                    <input
                      type="text"
                      required
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      placeholder="Dhaka"
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Shipping Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Discount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Items Section */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Order Items</label>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                  </div>

                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <select
                        value={item.product}
                        onChange={(e) => handleItemChange(index, 'product', Number(e.target.value))}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${p.regular_price} | Stock: {p.stock})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        className="w-24 px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />

                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(index)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {selectedOrderDetails && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-7 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xl font-bold text-slate-900">Order #{selectedOrderDetails.id} Details</h3>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-xs uppercase text-slate-400 block">Customer</span>
                    <strong className="text-slate-900">{selectedOrderDetails.customer_name}</strong>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-slate-400 block">Phone</span>
                    <strong className="text-slate-900 font-mono">{selectedOrderDetails.phone}</strong>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs uppercase text-slate-400 block">Delivery Location</span>
                    <span className="text-slate-900 font-medium">{selectedOrderDetails.delivery_location || selectedOrderDetails.location || 'N/A'}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs uppercase text-slate-400 block">Status</span>
                    <span className="text-indigo-600 font-bold">{selectedOrderDetails.status || 'PENDING'}</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold uppercase text-slate-400 pt-2">Purchased Items</h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {selectedOrderDetails.items?.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white text-slate-900">
                      <div>
                        <p className="font-bold text-slate-900">{item.product_name || `Product #${item.product}`}</p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      {item.price && <span className="font-bold text-slate-900">${item.price}</span>}
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-xs space-y-1 text-slate-500">
                  <div className="flex justify-between">
                    <span>Shipping Cost:</span>
                    <span className="font-semibold text-slate-900">${selectedOrderDetails.shipping_cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="font-semibold text-slate-900">${selectedOrderDetails.discount}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold text-sm text-slate-900">
                    <span>Total Bill:</span>
                    <span>${selectedOrderDetails.total_amount || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}