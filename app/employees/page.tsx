'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { Employee } from '@/lib/types';
import { Users, Plus, Shield, Briefcase, Trash2 } from 'lucide-react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'STAFF'>('STAFF');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    setLoading(true);
    api.getEmployees()
      .then((res) => setEmployees(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEmployee({ employee_id: employeeId, name, designation, salary, role });
      setIsModalOpen(false);
      loadEmployees();
    } catch (err) {
      alert('Error adding employee.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete employee record?')) {
      await api.deleteEmployee(id);
      setEmployees(employees.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Header breadcrumb="Employees" />

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Staff Directory</h2>
              <p className="text-sm text-slate-500">Manage employee accounts, designations, and system roles.</p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Employee
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Name & Title</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Monthly Salary</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-400">Loading directory...</td></tr>
                ) : employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="p-4 pl-6 font-bold text-slate-900">{emp.employee_id}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{emp.name}</p>
                      <p className="text-xs text-slate-400">{emp.designation}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600">
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">${emp.salary}</td>
                    <td className="p-4 text-right pr-6">
                      <button onClick={() => handleDelete(emp.id)} className="p-2 text-slate-300 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employee Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Add Staff Member</h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <input type="text" placeholder="Employee Code (e.g. EMP-101)" required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full px-4 py-2 rounded-xl border text-sm" />
                <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-xl border text-sm" />
                <input type="text" placeholder="Designation" required value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full px-4 py-2 rounded-xl border text-sm" />
                <input type="number" placeholder="Salary Amount" required value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full px-4 py-2 rounded-xl border text-sm" />
                <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full px-4 py-2 rounded-xl border text-sm">
                  <option value="STAFF">STAFF</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}