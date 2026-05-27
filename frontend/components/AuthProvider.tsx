"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { loginUser, registerUser } from "@/services/auth";
import type { LoginPayload, RegisterPayload, User } from "@/utils/types";

const TOKEN_KEY = "aci_access_token";
const USER_KEY = "aci_user";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Decode a JWT payload (no signature verification — just for exp check). */
function getTokenExpiry(token: string): number | null {
  try {
    const payloadB64 = token.split(".")[1];
    if (!payloadB64) return null;
    const decoded = JSON.parse(atob(payloadB64));
    return typeof decoded.exp === "number" ? decoded.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiry(token);
  if (exp === null) return false; // can't determine — assume valid
  return Date.now() / 1000 > exp;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      // ── JWT expiry check ──────────────────────────────────────────────────
      if (isTokenExpired(storedToken)) {
        // Token is stale — clear everything and redirect
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
        router.push("/login");
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      }
    }
    setIsLoading(false);
  }, [router]);

  function persistSession(nextToken: string, nextUser: User) {
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      async login(payload) {
        const response = await loginUser(payload);
        persistSession(response.access_token, response.user);
        router.push("/dashboard");
      },
      async register(payload) {
        const response = await registerUser(payload);
        persistSession(response.access_token, response.user);
        router.push("/dashboard");
      },
      logout() {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
        router.push("/login");
      },
    }),
    [isLoading, router, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
