"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User, Briefcase, DollarSign, Mail, Calendar, Shield, CheckCircle2 } from "lucide-react";

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-slate-800/60 last:border-0">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="mt-1 text-sm font-semibold text-white">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-800/50 bg-[#0d1220]/60 p-6 shadow-xl backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const monthlyIncome = user?.monthly_income
    ? `₹ ${Number(user.monthly_income).toLocaleString("en-IN")}`
    : null;

  return (
    <div className="flex flex-col gap-8 pb-10 text-slate-100">
      {/* Page Header */}
      <div className="border-b border-slate-800/60 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
          Account Settings
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
          Profile & Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Your account information and platform preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left — Avatar card */}
        <Panel className="flex flex-col items-center text-center py-8">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 text-3xl font-black text-white shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 border-2 border-[#0d1220]">
              <CheckCircle2 size={14} className="text-white" />
            </div>
          </div>
          <h2 className="mt-4 text-lg font-bold text-white">{user?.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{user?.email}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Shield size={11} /> Verified Account
          </div>

          <div className="mt-8 w-full space-y-2 text-left">
            <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-800/60 pt-4">
              <span>Member since</span>
              <span className="text-slate-300 font-medium">{joinedDate ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Account ID</span>
              <span className="text-slate-300 font-mono">#{user?.id}</span>
            </div>
          </div>
        </Panel>

        {/* Right — Info + Danger zone */}
        <div className="flex flex-col gap-6">
          {/* Account Information */}
          <Panel>
            <h3 className="mb-2 text-sm font-bold text-white flex items-center gap-2">
              <User size={16} className="text-indigo-400" />
              Account Information
            </h3>
            <p className="mb-4 text-xs text-slate-500">
              Your profile details as registered on the platform.
            </p>
            <div>
              <InfoRow icon={User} label="Full Name" value={user?.name} />
              <InfoRow icon={Mail} label="Email Address" value={user?.email} />
              <InfoRow icon={Briefcase} label="Occupation" value={user?.occupation ?? "Not specified"} />
              <InfoRow icon={DollarSign} label="Monthly Income" value={monthlyIncome} />
              <InfoRow icon={Calendar} label="Member Since" value={joinedDate} />
            </div>
          </Panel>

          {/* Platform Info */}
          <Panel>
            <h3 className="mb-4 text-sm font-bold text-white">Platform Information</h3>
            <div className="grid gap-3 sm:grid-cols-3 text-center">
              {[
                { label: "ML Engine", value: "v0.4.0" },
                { label: "Credit Model", value: "Ensemble" },
                { label: "Fraud Engine", value: "IF + SVM + LOF" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</p>
                  <p className="mt-1.5 text-sm font-bold text-indigo-400">{item.value}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* Danger Zone */}
          <Panel className="border-red-500/20">
            <h3 className="mb-1 text-sm font-bold text-red-400">Danger Zone</h3>
            <p className="mb-5 text-xs text-slate-500">
              Actions here cannot be undone. Proceed with caution.
            </p>
            {!showLogoutConfirm ? (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20 hover:border-red-500/50"
              >
                Sign out of all sessions
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-400 mr-2">Are you sure?</p>
                <button
                  onClick={logout}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-500"
                >
                  Yes, sign out
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition-all hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
