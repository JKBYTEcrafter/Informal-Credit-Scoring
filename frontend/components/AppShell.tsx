"use client";

import { LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-[#070a13] text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/40 bg-[#0d121f]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {/* Interactive Logo Badge */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Shield size={20} className="stroke-[2.5]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-white">
                Alternative Credit Intelligence
              </p>
              <p className="truncate text-xs text-slate-400 font-medium">{user?.email}</p>
            </div>
          </div>

          {/* Premium Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-4 text-xs font-semibold text-slate-300 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <LogOut size={14} aria-hidden="true" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
