import { api } from "@/services/api";
import type { LoginPayload, RegisterPayload, TokenResponse } from "@/utils/types";

export async function loginUser(payload: LoginPayload): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>("/auth/login", payload);
  return response.data;
}

export async function registerUser(payload: RegisterPayload): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>("/auth/register", payload);
  return response.data;
}
