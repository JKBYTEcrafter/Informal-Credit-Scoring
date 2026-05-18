"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
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
    <main className="min-h-screen bg-paper px-4 py-10 text-ink">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_460px]">
        <div className="hidden lg:block">
          <p className="text-sm font-semibold uppercase text-mint">
            Alternative Credit Intelligence
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight">
            Transaction behavior, ready for responsible credit decisions.
          </h1>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
            <div className="border border-line bg-white p-4 shadow-soft">
              <p className="font-semibold">JWT</p>
              <p className="mt-2 text-slate-600">Secure sessions</p>
            </div>
            <div className="border border-line bg-white p-4 shadow-soft">
              <p className="font-semibold">CSV</p>
              <p className="mt-2 text-slate-600">Validated uploads</p>
            </div>
            <div className="border border-line bg-white p-4 shadow-soft">
              <p className="font-semibold">Postgres</p>
              <p className="mt-2 text-slate-600">Durable storage</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto w-full max-w-[460px] border border-line bg-white p-6 shadow-soft"
        >
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase text-mint">Sign in</p>
            <h2 className="mt-2 text-2xl font-semibold">Dashboard access</h2>
          </div>

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
          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}

          <label className="mt-5 block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-2 h-11 w-full border border-line px-3 outline-none transition focus:border-mint"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
          )}

          {error && <p className="mt-5 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 flex h-11 w-full items-center justify-center gap-2 bg-ink px-4 text-sm font-semibold text-white transition hover:bg-mint disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={18} aria-hidden="true" />
            {isSubmitting ? "Signing in" : "Sign in"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            No account yet?{" "}
            <Link className="font-semibold text-mint" href="/register">
              Create one
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
