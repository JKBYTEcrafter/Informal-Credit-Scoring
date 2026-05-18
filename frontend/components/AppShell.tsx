"use client";

import { LogOut, ShieldCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-ink text-white">
              <ShieldCheck size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Alternative Credit Intelligence</p>
              <p className="truncate text-xs text-slate-600">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex h-10 items-center gap-2 border border-line px-3 text-sm font-semibold transition hover:border-mint hover:text-mint"
          >
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
