// ============================================================
// Core Auth & User Types
// ============================================================
export type User = {
  id: number;
  name: string;
  email: string;
  occupation?: string | null;
  monthly_income: number | string;
  created_at: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  occupation?: string;
  monthly_income: number;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

// ============================================================
// Transaction Types
// ============================================================
export type Transaction = {
  id: number;
  amount: number | string;
  transaction_type: "credit" | "debit";
  merchant: string;
  category: string;
  timestamp: string;
  description?: string | null;
};

export type TransactionUploadResponse = {
  imported_count: number;
  transactions: Transaction[];
};

// ============================================================
// Dashboard Types
// ============================================================
export type DashboardSummary = {
  total_income: number;
  total_expenses: number;
  savings_ratio: number;
  transaction_count: number;
};

// ============================================================
// Sprint 2 Intelligence Types
// ============================================================
export type ExplanationItem = {
  feature: string;
  impact: "positive" | "negative" | "neutral";
  message: string;
};

export type FeatureImportanceItem = {
  feature: string;
  importance: number;
  method: string;
};

export type CreditScoreResponse = {
  user_id: number;
  score: number;
  risk_level: "Low Risk" | "Medium Risk" | "High Risk";
  model_version: string;
  model_name: string;
  generated_at: string;
  score_breakdown: {
    ml_prediction: number;
    behavioral_score: number;
    financial_health_score: number;
  };
  explanations: ExplanationItem[];
  feature_importance: FeatureImportanceItem[];
};

export type RiskAnalysisResponse = {
  user_id: number;
  score: number;
  risk_level: "Low Risk" | "Medium Risk" | "High Risk";
  band: string;
  key_risk_factors: ExplanationItem[];
  protective_factors: ExplanationItem[];
  generated_at: string;
};

export type CategoryDistributionItem = {
  category: string;
  total_spent: number;
  ratio: number;
};

export type MonthlyCashFlowPoint = {
  month: string;
  income: number;
  expenses: number;
  net_cash_flow: number;
};

export type FinancialHealthResponse = {
  user_id: number;
  health_score: number;
  features: Record<string, number>;
  behavioral_indicators: Record<string, number>;
  category_distribution: CategoryDistributionItem[];
  monthly_cash_flow: MonthlyCashFlowPoint[];
  categorical_profile: Record<string, string>;
  generated_at: string;
};

export type ModelMetricsResponse = {
  model_version: string;
  model_name: string;
  created_at: string | null;
  metrics: Record<string, unknown>;
  model_comparison: Array<Record<string, unknown>>;
  training_metadata: Record<string, unknown>;
  feature_schema: {
    numeric: string[];
    categorical: string[];
  };
};

// ============================================================
// Sprint 3 Types — Explainability
// ============================================================
export type SHAPValue = {
  feature: string;
  shap_value: number;
  feature_value: number;
  impact: "positive" | "negative" | "neutral";
  readable_label: string;
};

export type ExplainabilityResponse = {
  user_id: number;
  credit_score: number;
  risk_level: "Low Risk" | "Medium Risk" | "High Risk";
  base_score: number;
  shap_values: SHAPValue[];
  top_positive_factors: string[];
  top_negative_factors: string[];
  financial_health_score: number;
  explanation_method: string;
  generated_at: string;
};

// ============================================================
// Sprint 3 Types — Financial Health Report
// ============================================================
export type HealthDimension = {
  label: string;
  score: number;
  description: string;
};

export type FinancialHealthReportResponse = {
  user_id: number;
  health_score: number;
  stability_score: number;
  volatility_score: number;
  cash_flow_health: number;
  savings_discipline_score: number;
  expense_management_score: number;
  income_reliability_score: number;
  dimensions: HealthDimension[];
  percentile_benchmarks: Record<string, number>;
  generated_at: string;
};

// ============================================================
// Sprint 3 Types — Recommendations
// ============================================================
export type RecommendationItem = {
  id: number;
  recommendation: string;
  priority: "High" | "Medium" | "Low";
  category: string;
  generated_at: string;
};

export type RecommendationsResponse = {
  user_id: number;
  recommendations: RecommendationItem[];
  total_count: number;
  high_priority_count: number;
};

// ============================================================
// Sprint 3 Types — Behavioral Analysis
// ============================================================
export type SpenderProfile = {
  profile_label: string;
  profile_description: string;
  risk_flags: string[];
  strengths: string[];
};

export type BehavioralInsightItem = {
  insight_type: string;
  insight_description: string;
  severity: "Critical" | "Warning" | "Info";
};

export type BehavioralAnalysisResponse = {
  user_id: number;
  spender_profile: SpenderProfile;
  insights: BehavioralInsightItem[];
  spending_patterns: Record<string, number | string>;
  merchant_concentration: Array<{
    category: string;
    total_spent: number;
    share_pct: number;
    risk_flag: boolean;
  }>;
  category_risk_breakdown: Array<{
    category: string;
    risk_level: "High" | "Medium" | "Low";
    total_spent: number;
    ratio: number;
  }>;
  generated_at: string;
};

// ============================================================
// Sprint 3 Types — Risk Trends
// ============================================================
export type RiskTrendPoint = {
  month: string;
  credit_score: number;
  health_score: number;
  risk_level: string;
  savings_ratio: number;
  spending_volatility: number;
};

export type RiskTrendsResponse = {
  user_id: number;
  trend_points: RiskTrendPoint[];
  score_change_6m: number;
  trend_direction: "Improving" | "Declining" | "Stable";
  best_month: string | null;
  worst_month: string | null;
};

// ============================================================
// Sprint 3 Types — Financial Story
// ============================================================
export type StorySegment = {
  segment_type: "header" | "positive" | "warning" | "neutral" | "recommendation";
  text: string;
};

export type FinancialStoryResponse = {
  user_id: number;
  headline: string;
  narrative_segments: StorySegment[];
  full_narrative: string;
  credit_score: number;
  risk_level: string;
  generated_at: string;
};

// ============================================================
// Sprint 3 Types — Advanced Summary
// ============================================================
export type AdvancedSummaryResponse = {
  user_id: number;
  credit_score: number;
  risk_level: string;
  health_report: FinancialHealthReportResponse;
  top_recommendations: RecommendationItem[];
  spender_profile: SpenderProfile;
  risk_trend_direction: string;
  score_change_6m: number;
  financial_story_headline: string;
  key_insights: BehavioralInsightItem[];
  generated_at: string;
};
