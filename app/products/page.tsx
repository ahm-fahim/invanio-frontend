'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { Product, Category } from '@/lib/types';
import {
  Plus,
  Package,
  Edit2,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  Eye,
  Upload,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // View Details Modal State
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState<number>(0);
  const [sizes, setSizes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Quick Stock Adjustment State
  const [stockModalId, setStockModalId] = useState<number | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(productsRes);
      setCategories(categoriesRes);
    } catch (err: any) {
      console.error('Failed to load catalog:', err);
      setError('Could not connect to the inventory backend. Check your Django server.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setDescription('');
    setRegularPrice('');
    setDiscountPrice('');
    setStock(10);
    setSizes('S, M, L, XL');
    setImageFile(null);
    setImagePreview(null);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setCategoryId(p.category);
    setDescription(p.description || '');
    setRegularPrice(p.regular_price);
    setDiscountPrice(p.discount_price || '');
    setStock(p.stock);
    setSizes(p.sizes || '');
    setImageFile(null);
    setImagePreview(p.image_url || p.image || null);
    setIsActive(p.is_active);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !regularPrice) {
      alert('Please fill out all required fields.');
      return;
    }

    setModalLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', String(categoryId));
    formData.append('regular_price', regularPrice);
    if (discountPrice.trim()) {
      formData.append('discount_price', discountPrice);
    }
    formData.append('description', description || '');
    formData.append('stock', String(stock));
    formData.append('sizes', sizes || '');
    formData.append('is_active', String(isActive));

    // Append image if new file is selected
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (editingId) {
        await api.updateProduct(editingId, formData);
      } else {
        await api.createProduct(formData);
      }
      setIsModalOpen(false);
      loadInitialData();
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Check backend parameters.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        setProducts(products.filter((p) => p.id !== id));
      } catch (err) {
        alert('Could not delete product.');
      }
    }
  };

  const handleQuickStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stockModalId === null) return;

    try {
      await api.quickUpdateStock(stockModalId, newStockValue);
      setStockModalId(null);
      loadInitialData();
    } catch (err) {
      alert('Failed to update stock balance.');
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
              <p className="text-sm text-slate-500">Manage products, pricing tiers, and stock balances.</p>
            </div>

            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Product Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Regular Price</th>
                  <th className="p-4">Discount Price</th>
                  <th className="p-4">Stock Level</th>
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
                        <span>Loading catalog from API...</span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No products found. Click &quot;Add Product&quot; to populate your inventory.
                    </td>
                  </tr>
                ) : (
                  products.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-all">
                      <td className="p-4 pl-6 font-bold text-slate-900 flex items-center gap-3">
                        {item.image_url || item.image ? (
                          <img
                            src={item.image_url || item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="line-clamp-1">{item.name}</p>
                          <p className="text-[11px] font-mono text-slate-400 font-normal">SKU-{item.id}</p>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{item.category_name || 'Uncategorized'}</td>
                      <td className="p-4 font-bold text-slate-900">${item.regular_price}</td>
                      <td className="p-4 text-slate-500">
                        {item.discount_price ? (
                          <span className="text-indigo-600 font-semibold">${item.discount_price}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setStockModalId(item.id);
                            setNewStockValue(item.stock);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            item.stock <= 10
                              ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title="Click to quickly adjust stock balance"
                        >
                          {item.stock} units
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 border border-slate-100 text-slate-600">
                          <span className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          {item.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6 space-x-1">
                        <button
                          onClick={() => setSelectedProductDetails(item)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="View Product Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Details Modal */}
        {selectedProductDetails && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-7 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xl font-bold text-slate-900">Product Specification</h3>
                </div>
                <button
                  onClick={() => setSelectedProductDetails(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  {selectedProductDetails.image_url || selectedProductDetails.image ? (
                    <img
                      src={selectedProductDetails.image_url || selectedProductDetails.image}
                      alt={selectedProductDetails.name}
                      className="w-full h-48 object-cover rounded-xl shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-48 rounded-xl bg-slate-100 text-slate-400 flex flex-col items-center justify-center space-y-2">
                      <Package className="w-10 h-10" />
                      <span className="text-xs">No image uploaded</span>
                    </div>
                  )}
                  <div className="mt-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        selectedProductDetails.is_active
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {selectedProductDetails.is_active ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active Item
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Disabled Item
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs uppercase font-semibold text-slate-400 block">Product Name</span>
                    <strong className="text-slate-900 text-lg block">{selectedProductDetails.name}</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[11px] uppercase font-semibold text-slate-400 block">Category</span>
                      <strong className="text-slate-800 text-xs capitalize">
                        {selectedProductDetails.category_name || selectedProductDetails.category || 'N/A'}
                      </strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[11px] uppercase font-semibold text-slate-400 block">Stock Level</span>
                      <strong
                        className={`text-xs ${
                          selectedProductDetails.stock > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {selectedProductDetails.stock} Available
                      </strong>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[11px] uppercase font-semibold text-slate-400 block">Pricing Details</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-slate-900">
                        ${selectedProductDetails.discount_price || selectedProductDetails.regular_price}
                      </span>
                      {selectedProductDetails.discount_price && (
                        <span className="text-xs text-slate-400 line-through">
                          ${selectedProductDetails.regular_price}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs uppercase font-semibold text-slate-400 block">Sizes</span>
                    <p className="text-slate-700 font-mono text-xs font-semibold bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                      {selectedProductDetails.sizes || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400 block">Description</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedProductDetails.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedProductDetails(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200"
                >
                  Close Specification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Product Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Graphic T-Shirt"
                    className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Category Mapping</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Cloudinary Image Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Product Image (Cloudinary)</label>
                  <div className="mt-1.5 flex items-center gap-4">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <Upload className="w-5 h-5" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Regular Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(e.target.value)}
                      placeholder="1200.00"
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Discount Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      placeholder="1000.00"
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Sizes</label>
                    <input
                      type="text"
                      value={sizes}
                      onChange={(e) => setSizes(e.target.value)}
                      placeholder="S, M, L, XL"
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide item specifications..."
                    className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 w-full">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-semibold text-slate-900">Product Active</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
                    {editingId ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quick Stock Adjustment Modal */}
        {stockModalId !== null && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Quick Stock Adjustment</h3>
              <form onSubmit={handleQuickStockUpdate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">Set New Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(Number(e.target.value))}
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStockModalId(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-md shadow-indigo-200"
                  >
                    Update Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}