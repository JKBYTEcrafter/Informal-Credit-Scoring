import { api } from "@/services/api";
import type {
  FraudScoreResponse,
  FraudAlertsResponse,
  RiskEventsResponse,
  BehavioralRiskResponse,
  AnomalyAnalysisResponse,
  FraudExplainabilityResponse,
  FraudSummaryResponse,
} from "@/utils/types";

export async function fetchFraudScore(userId: number): Promise<FraudScoreResponse> {
  const { data } = await api.get<FraudScoreResponse>(`/fraud-score/${userId}`);
  return data;
}

export async function fetchFraudAlerts(userId: number): Promise<FraudAlertsResponse> {
  const { data } = await api.get<FraudAlertsResponse>(`/fraud-alerts/${userId}`);
  return data;
}

export async function fetchRiskEvents(userId: number): Promise<RiskEventsResponse> {
  const { data } = await api.get<RiskEventsResponse>(`/risk-events/${userId}`);
  return data;
}

export async function fetchBehavioralRisk(userId: number): Promise<BehavioralRiskResponse> {
  const { data } = await api.get<BehavioralRiskResponse>(`/behavioral-risk/${userId}`);
  return data;
}

export async function fetchAnomalyAnalysis(userId: number): Promise<AnomalyAnalysisResponse> {
  const { data } = await api.get<AnomalyAnalysisResponse>(`/anomaly-analysis/${userId}`);
  return data;
}

export async function fetchFraudExplainability(userId: number): Promise<FraudExplainabilityResponse> {
  const { data } = await api.get<FraudExplainabilityResponse>(`/fraud-explainability/${userId}`);
  return data;
}

export async function fetchFraudSummary(userId: number): Promise<FraudSummaryResponse> {
  const { data } = await api.get<FraudSummaryResponse>(`/fraud/fraud-summary/${userId}`);
  return data;
}
