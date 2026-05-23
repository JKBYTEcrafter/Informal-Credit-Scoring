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
      setError("Select a valid CSV file.");
      return;
    }
    setFile(selected);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Please select a CSV statement file first.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await uploadTransactions(file);
      setMessage(`${response.imported_count} transactions ingested successfully.`);
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      await onUploadComplete();
    } catch {
      setError("Upload failed. Verify column headers match our template.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="bg-transparent border-0 p-0 shadow-none">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Statement Ingestion</p>
          <h2 className="mt-1 text-lg font-bold text-white">Upload Transactions</h2>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <UploadCloud size={18} aria-hidden="true" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/60 px-4 text-center transition-all duration-200 hover:border-indigo-500/50 hover:bg-slate-950"
        >
          <FileText size={24} className="text-indigo-400" aria-hidden="true" />
          <span className="mt-3 max-w-full truncate text-xs font-semibold text-slate-300">
            {file ? file.name : "Format: amount, type, merchant, category, timestamp"}
          </span>
          <span className="mt-1 text-[10px] text-slate-500 font-medium">Click to browse statement file</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {message && <p className="text-xs font-semibold text-emerald-400 text-center">{message}</p>}
        {error && <p className="text-xs font-semibold text-red-400 text-center">{error}</p>}

        <button
          type="submit"
          disabled={isUploading || !file}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white transition-all duration-200 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          {isUploading ? "Processing..." : "Ingest statement"}
        </button>
      </form>
    </section>
  );
}
