import { api } from "@/services/api";
import type { Transaction, TransactionUploadResponse } from "@/utils/types";

export async function uploadTransactions(file: File): Promise<TransactionUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<TransactionUploadResponse>(
    "/transactions/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const response = await api.get<Transaction[]>("/transactions");
  return response.data;
}
