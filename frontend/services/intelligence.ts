import { api } from "@/services/api";
import type {
  AdvancedSummaryResponse,
  BehavioralAnalysisResponse,
  CreditScoreResponse,
  ExplainabilityResponse,
  FinancialHealthReportResponse,
  FinancialHealthResponse,
  FinancialStoryResponse,
  ModelMetricsResponse,
  RecommendationsResponse,
  RiskAnalysisResponse,
  RiskTrendsResponse,
} from "@/utils/types";

// ---- Sprint 2 ----
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

// ---- Sprint 3 ----
export async function fetchExplainability(userId: number): Promise<ExplainabilityResponse> {
  const response = await api.get<ExplainabilityResponse>(`/explainability/${userId}`);
  return response.data;
}

export async function fetchFinancialHealthReport(userId: number): Promise<FinancialHealthReportResponse> {
  const response = await api.get<FinancialHealthReportResponse>(`/financial-health/${userId}`);
  return response.data;
}

export async function fetchRecommendations(userId: number): Promise<RecommendationsResponse> {
  const response = await api.get<RecommendationsResponse>(`/recommendations/${userId}`);
  return response.data;
}

export async function fetchBehavioralAnalysis(userId: number): Promise<BehavioralAnalysisResponse> {
  const response = await api.get<BehavioralAnalysisResponse>(`/behavioral-analysis/${userId}`);
  return response.data;
}

export async function fetchRiskTrends(userId: number): Promise<RiskTrendsResponse> {
  const response = await api.get<RiskTrendsResponse>(`/risk-trends/${userId}`);
  return response.data;
}

export async function fetchFinancialStory(userId: number): Promise<FinancialStoryResponse> {
  const response = await api.get<FinancialStoryResponse>(`/financial-story/${userId}`);
  return response.data;
}

export async function fetchAdvancedSummary(userId: number): Promise<AdvancedSummaryResponse> {
  const response = await api.get<AdvancedSummaryResponse>(`/dashboard/advanced-summary/${userId}`);
  return response.data;
}
