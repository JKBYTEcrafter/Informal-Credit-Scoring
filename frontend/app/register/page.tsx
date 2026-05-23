"use client";

import Link from "next/link";
import { UserPlus, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  occupation?: string;
  monthly_income: number;
};

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();

  async function onSubmit(values: RegisterFormValues) {
    setError(null);
    try {
      await registerUser(values);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Unable to create this account.");
    }
  }

  return (
    <main className="min-h-screen bg-[#070a13] flex items-center justify-center px-4 py-12 text-slate-100 antialiased relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

      <section className="relative z-10 w-full max-w-[500px] flex items-center">
        {/* Glassmorphic Registration Card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full rounded-2xl border border-slate-800 bg-[#0d1220]/70 p-8 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-md space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Shield size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Alternative Credit Intelligence
              </p>
              <h1 className="text-lg font-bold text-white">Create free account</h1>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 text-sm text-white outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-slate-950"
                placeholder="e.g. Ramesh Kumar"
                {...register("name", { required: "Name is required", minLength: 2 })}
              />
              {errors.name && <p className="text-xs text-red-400 font-medium mt-1">{errors.name.message}</p>}
            </div>

            <div className="sm:col-span-2 flex flex-col gap-1.5">
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

            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 text-sm text-white outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-slate-950"
                placeholder="Use at least 8 characters"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Use at least 8 characters" },
                })}
              />
              {errors.password && <p className="text-xs text-red-400 font-medium mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400" htmlFor="occupation">
                Occupation
              </label>
              <input
                id="occupation"
                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 text-sm text-white outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-slate-950"
                placeholder="e.g. Gig Worker"
                {...register("occupation")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400" htmlFor="monthly_income">
                Monthly Income (₹)
              </label>
              <input
                id="monthly_income"
                type="number"
                min="0"
                step="100"
                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 text-sm text-white outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-slate-950"
                placeholder="e.g. 25000"
                {...register("monthly_income", {
                  required: "Income is required",
                  valueAsNumber: true,
                  min: 0,
                })}
              />
              {errors.monthly_income && (
                <p className="text-xs text-red-400 font-medium mt-1">{errors.monthly_income.message}</p>
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
            <UserPlus size={14} aria-hidden="true" />
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-xs text-slate-400">
            Already registered?{" "}
            <Link className="font-semibold text-indigo-400 transition hover:text-indigo-300" href="/login">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
