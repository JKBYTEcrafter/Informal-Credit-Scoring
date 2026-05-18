"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, router, user]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper text-sm text-slate-600">
        Loading workspace
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
