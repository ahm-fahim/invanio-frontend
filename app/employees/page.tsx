'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { Employee } from '@/lib/types';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  X,
  AlertCircle,
  ShieldCheck,
  Briefcase,
  Phone,
  MapPin,
  DollarSign
} from 'lucide-react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form Fields
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('');
  const [role, setRole] = useState('STAFF');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to fetch employee list. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setEmployeeId(`emp${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setAddress('');
    setPhone('');
    setDesignation('');
    setSalary('30000.00');
    setRole('STAFF');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmployeeId(emp.employee_id || '');
    setName(emp.name || '');
    setAddress(emp.address || '');
    setPhone(emp.phone || '');
    setDesignation(emp.designation || '');
    setSalary(emp.salary || '0.00');
    setRole(emp.role || 'STAFF');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !designation) {
      alert('Please fill out all required fields.');
      return;
    }

    setModalLoading(true);
    const payload: Employee = {
      employee_id: employeeId,
      name,
      address,
      phone,
      designation,
      salary,
      role,
    };

    try {
      if (editingEmployee && editingEmployee.id) {
        await api.updateEmployee(editingEmployee.id, payload);
      } else {
        await api.createEmployee(payload);
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      console.error('Employee Save Error:', err);
      alert(`Failed to save employee: ${err.message || 'Check input parameters.'}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm('Are you sure you want to remove this employee record?')) {
      try {
        await api.deleteEmployee(id);
        fetchEmployees();
      } catch (err) {
        alert('Failed to delete employee record.');
      }
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        <Header breadcrumb="Employee Management" />

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Employees Directory</h2>
              <p className="text-sm text-slate-500">Manage team designations, roles, salaries, and contact details.</p>
            </div>

            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Employee
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-4 bg-white p-2 px-4 rounded-xl border border-slate-100 shadow-sm max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm text-slate-900 focus:outline-none placeholder:text-slate-400 bg-transparent"
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">ID / Name</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Contact & Location</th>
                  <th className="p-4">Salary</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        <span>Loading staff records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No employees found. Click &quot;Add Employee&quot; to insert staff data.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-all">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{emp.name}</span>
                            <span className="text-xs text-slate-400 font-mono">{emp.employee_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>{emp.designation}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                            emp.role === 'ADMIN'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : emp.role === 'MANAGER'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {emp.role || 'STAFF'}
                        </span>
                      </td>
                      <td className="p-4 text-xs space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-600 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{emp.phone}</span>
                        </div>
                        {emp.address && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{emp.address}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        ${Number(emp.salary).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right pr-6 space-x-1">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete"
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

        {/* Add/Edit Employee Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingEmployee ? 'Edit Employee Record' : 'Add New Employee'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Employee ID</label>
                    <input
                      type="text"
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="emp101"
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Fahim"
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Designation</label>
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="Managing Director"
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Role System</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="STAFF">STAFF</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (247) 714-8059"
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Monthly Salary ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="60000.00"
                      className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Address / Location</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-300"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
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
                    {editingEmployee ? 'Update Employee' : 'Save Employee'}
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