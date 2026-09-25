'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, Settings, Store, HelpCircle } from 'lucide-react';

const workspaceNav = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: Tags },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Employees', href: '/employees', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between min-h-screen fixed left-0 top-0 z-20">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Store className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">invanio<span className="text-indigo-600">.</span></span>
        </div>

        {/* Workspace Navigation */}
        <div className="px-4 mt-4">
          <p className="px-3 text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Workspace</p>
          <nav className="space-y-1">
            {workspaceNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Navigation */}
        <div className="px-4 mt-8">
          <p className="px-3 text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">System</p>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <Settings className="w-5 h-5 text-slate-400" />
            Settings
          </Link>
        </div>
      </div>

      {/* Need Help Footer */}
      <div className="p-4 m-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-medium">Need help?</span>
        </div>
        <button className="text-xs text-indigo-400 hover:underline">Docs</button>
      </div>
    </aside>
  );
}