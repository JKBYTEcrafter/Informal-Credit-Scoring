"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { FileText, Loader2, UploadCloud } from "lucide-react";

import { uploadTransactions } from "@/services/transactions";

type Props = {
  onUploadComplete: () => Promise<void> | void;
};

export function CSVUpload({ onUploadComplete }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setMessage(null);
    setError(null);
    if (selected && !selected.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setError("Select a CSV file.");
      return;
    }
    setFile(selected);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Select a CSV file.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await uploadTransactions(file);
      setMessage(`${response.imported_count} transactions imported.`);
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      await onUploadComplete();
    } catch {
      setError("Upload failed. Check the CSV columns and values.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="border border-line bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-mint">CSV upload</p>
          <h2 className="mt-1 text-lg font-semibold">Transactions</h2>
        </div>
        <UploadCloud size={22} className="text-mint" aria-hidden="true" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-32 w-full flex-col items-center justify-center border border-dashed border-line bg-paper px-4 text-center transition hover:border-mint"
        >
          <FileText size={24} className="text-slate-500" aria-hidden="true" />
          <span className="mt-3 max-w-full truncate text-sm font-medium">
            {file ? file.name : "amount,type,merchant,category,timestamp"}
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {message && <p className="text-sm text-mint">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isUploading}
          className="flex h-11 w-full items-center justify-center gap-2 bg-ink px-4 text-sm font-semibold text-white transition hover:bg-mint disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
          {isUploading ? "Uploading" : "Upload CSV"}
        </button>
      </form>
    </section>
  );
}
