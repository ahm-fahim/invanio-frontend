'use client';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Server, Database, Globe, Lock } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Header breadcrumb="Settings" />

        <div className="p-8 max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Backend API Target</h3>
                <p className="text-xs text-slate-400">Connected to Ubuntu Django REST Server</p>
                <p className="text-xs font-mono text-indigo-600 mt-1">http://192.168.10.163:8000/api</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Database Engine</h3>
                <p className="text-xs text-slate-400">PostgreSQL 16 Engine (`invaniodb` instance)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}