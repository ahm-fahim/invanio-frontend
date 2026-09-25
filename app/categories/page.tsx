'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';
import { Tags, Plus, Trash2, FolderPlus, Edit2, Loader2, X } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    setLoading(true);
    api.getCategories()
      .then((res) => setCategories(res))
      .catch((err) => setError('Failed to load categories. Please check API.'))
      .finally(() => setLoading(false));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setModalLoading(true);

    try {
      if (editingId) {
        // Full UPDATE CRUD: Executes PUT against /categories/{id}/
        await api.updateCategory(editingId, { name, description });
      } else {
        // Full CREATE CRUD: Executes POST against /categories/
        await api.createCategory({ name, description });
      }
      setIsModalOpen(false);
      loadCategories(); // Refresh list after CRUD
    } catch (error: any) {
      console.error('CRUD Error:', error.message);
      alert('Failed to save category. Check your backend logs.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Full DELETE CRUD: Executes DELETE against /categories/{id}/
    if (confirm('Delete this category? Products linked to this will lose their category association.')) {
      try {
        await api.deleteCategory(id);
        setCategories(categories.filter((c) => c.id !== id));
      } catch (error) {
        alert('Could not delete category.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Header breadcrumb="Categories" />

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Product Categories</h2>
              <p className="text-sm text-slate-500">Organize your inventory into structured classifications.</p>
            </div>

            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          {error && <p className="text-sm text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100">{error}</p>}

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 flex items-center gap-3 text-slate-400 p-8"><Loader2 className="w-5 h-5 animate-spin"/> Loading categories...</div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-slate-400 col-span-3 text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">No categories found. Click Add Category to create one.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-indigo-100 transition-all group">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Tags className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(cat)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{cat.name}</h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-3 leading-relaxed">{cat.description || 'No description provided for this classification.'}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Database ID: #{cat.id}</span>
                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">ACTIVE</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Fix: Fully styled for dark text inputs to prevent 'white text' issue seen in user screenshot */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-7 shadow-2xl space-y-4 border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingId ? 'Edit Product Category' : 'Add New Category'}
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-all">
                    <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4 pt-3">
                <div className="space-y-1.5">
                  <label htmlFor="catName" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Category Name</label>
                  <input
                    id="catName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apparel, Electronics, Cargo Pants"
                    // MODAL FIX: 'text-slate-900' ensures input text is visible against white background
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="catDesc" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Description (Optional)</label>
                  <textarea
                    id="catDesc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the classification..."
                    rows={4}
                    // MODAL FIX: 'text-slate-900' ensures textarea text is visible
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-300 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    {modalLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
                    {editingId ? 'Update Classification' : 'Save Classification'}
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