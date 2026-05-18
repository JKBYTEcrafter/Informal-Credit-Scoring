"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
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
      setError(typeof detail === 'string' ? detail : "Unable to create this account.");
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-10 text-ink">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[520px] items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full border border-line bg-white p-6 shadow-soft"
        >
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase text-mint">
              Alternative Credit Intelligence
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Create account</h1>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                className="mt-2 h-11 w-full border border-line px-3 outline-none transition focus:border-mint"
                {...register("name", { required: "Name is required", minLength: 2 })}
              />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="mt-2 h-11 w-full border border-line px-3 outline-none transition focus:border-mint"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="mt-2 h-11 w-full border border-line px-3 outline-none transition focus:border-mint"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Use at least 8 characters" },
                })}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="occupation">
                Occupation
              </label>
              <input
                id="occupation"
                className="mt-2 h-11 w-full border border-line px-3 outline-none transition focus:border-mint"
                {...register("occupation")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="monthly_income">
                Monthly income
              </label>
              <input
                id="monthly_income"
                type="number"
                min="0"
                step="100"
                className="mt-2 h-11 w-full border border-line px-3 outline-none transition focus:border-mint"
                {...register("monthly_income", {
                  required: "Income is required",
                  valueAsNumber: true,
                  min: 0,
                })}
              />
            </div>
          </div>

          {error && <p className="mt-5 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 flex h-11 w-full items-center justify-center gap-2 bg-ink px-4 text-sm font-semibold text-white transition hover:bg-mint disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserPlus size={18} aria-hidden="true" />
            {isSubmitting ? "Creating account" : "Create account"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already registered?{" "}
            <Link className="font-semibold text-mint" href="/login">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
