"use client";

import Link from "next/link";
import { LogIn, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    try {
      await login(values);
    } catch {
      setError("Unable to sign in with those credentials.");
    }
  }

  return (
    <main className="min-h-screen bg-[#070a13] flex items-center justify-center px-4 py-12 text-slate-100 antialiased relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

      <section className="relative z-10 w-full max-w-6xl grid items-center gap-12 lg:grid-cols-[1fr_460px]">
        
        {/* Left Side: Product Branding & Pillars */}
        <div className="hidden lg:block space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
            Enterprise Credit Intelligence
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Transaction behavior, ready for responsible credit decisions.
          </h1>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            Harness algorithmic transaction analysis, real-time SHAP explainability, and multi-dimensional health reports instantly.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-slate-800/80 bg-[#0d1220]/50 p-4 shadow-2xl backdrop-blur-sm">
              <p className="font-bold text-white text-sm">Secure JWT</p>
              <p className="mt-1 text-slate-400">Encrypted Auth Sessions</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-[#0d1220]/50 p-4 shadow-2xl backdrop-blur-sm">
              <p className="font-bold text-white text-sm">ML Pipeline</p>
              <p className="mt-1 text-slate-400">Verified statement uploads</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-[#0d1220]/50 p-4 shadow-2xl backdrop-blur-sm">
              <p className="font-bold text-white text-sm">Neon Cloud</p>
              <p className="mt-1 text-slate-400">Durable Postgres storage</p>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphic Auth Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full mx-auto max-w-[460px] rounded-2xl border border-slate-800 bg-[#0d1220]/70 p-8 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-md space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Shield size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Sign in</p>
              <h2 className="text-lg font-bold text-white">Dashboard access</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 text-sm text-white outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-slate-950"
                placeholder="name@domain.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-xs text-red-400 font-medium mt-1">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 text-sm text-white outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-slate-950"
                placeholder="••••••••"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <p className="text-xs text-red-400 font-medium mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-medium text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white transition-all duration-200 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={14} aria-hidden="true" />
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-xs text-slate-400">
            No account yet?{" "}
            <Link className="font-semibold text-indigo-400 transition hover:text-indigo-300" href="/register">
              Create one
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
