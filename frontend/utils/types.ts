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
