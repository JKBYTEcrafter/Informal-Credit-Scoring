import { api } from "@/services/api";
import type {
  CreditScoreResponse,
  FinancialHealthResponse,
  ModelMetricsResponse,
  RiskAnalysisResponse,
} from "@/utils/types";

export async function fetchCreditScore(userId: number): Promise<CreditScoreResponse> {
  const response = await api.get<CreditScoreResponse>(`/credit-score/${userId}`);
  return response.data;
}

export async function fetchRiskAnalysis(userId: number): Promise<RiskAnalysisResponse> {
  const response = await api.get<RiskAnalysisResponse>(`/risk-analysis/${userId}`);
  return response.data;
}

export async function fetchFinancialHealth(userId: number): Promise<FinancialHealthResponse> {
  const response = await api.get<FinancialHealthResponse>(`/financial-health/${userId}`);
  return response.data;
}

export async function fetchModelMetrics(): Promise<ModelMetricsResponse> {
  const response = await api.get<ModelMetricsResponse>("/ml/model-metrics");
  return response.data;
}
