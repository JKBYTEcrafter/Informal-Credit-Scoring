import { api } from "@/services/api";
import type { DashboardSummary } from "@/utils/types";

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>("/dashboard/summary");
  return response.data;
}
