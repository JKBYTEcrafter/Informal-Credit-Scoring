"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CreditCard,
  HeartPulse,
  Receipt,
  Brain,
  BarChart2,
  ShieldAlert,
  Shield,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/credit", label: "Credit Intelligence", icon: CreditCard },
  { href: "/dashboard/health", label: "Financial Health", icon: HeartPulse },
  { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  { href: "/dashboard/insights", label: "AI Insights", icon: Brain },
  { href: "/dashboard/analytics", label: "ML Analytics", icon: BarChart2 },
  { href: "/dashboard/fraud", label: "Fraud Intelligence", icon: ShieldAlert, badge: "NEW", isFraud: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-[#070a13] text-slate-100 font-sans antialiased overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform flex-col border-r border-slate-800/60 bg-[#0b0f1c] sidebar-transition lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex`}
      >
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Shield size={16} className="stroke-[2.5]" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white leading-tight">
              Alternative Credit<br/>Intelligence
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                  isActive
                    ? item.isFraud
                      ? "bg-red-900/30 text-red-100 border-l-2 border-red-500"
                      : "bg-indigo-600/20 text-indigo-100 border-l-2 border-indigo-500"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon 
                    size={18} 
                    className={isActive 
                      ? item.isFraud ? "text-red-400" : "text-indigo-400" 
                      : "text-slate-500 group-hover:text-slate-300"
                    } 
                  />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    item.isFraud ? "bg-red-500/20 text-red-400" : "bg-indigo-500/20 text-indigo-400"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 border border-slate-800 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Mobile Header */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-800/60 bg-[#0d121f]/80 px-4 backdrop-blur-md lg:hidden">
          <button
            onClick={toggleSidebar}
            className="p-2 text-slate-400 hover:bg-slate-800 rounded-md"
          >
            <Menu size={20} />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white">
            <Shield size={16} />
          </div>
          <span className="text-sm font-bold text-white">Credit Intelligence</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
