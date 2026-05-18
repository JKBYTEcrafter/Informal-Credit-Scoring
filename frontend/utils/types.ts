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

export type DashboardSummary = {
  total_income: number;
  total_expenses: number;
  savings_ratio: number;
  transaction_count: number;
};

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
