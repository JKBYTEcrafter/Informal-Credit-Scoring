"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console — in production you'd send to Sentry/Datadog here
    console.error("[ErrorBoundary] Unhandled error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen items-center justify-center bg-[#070a13] px-6 text-slate-100">
          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#0d1220]/80 p-10 text-center shadow-[0_0_60px_rgba(239,68,68,0.08)] backdrop-blur-md">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              An unexpected error occurred in the application. The error has been
              logged automatically.
            </p>
            {this.state.error?.message && (
              <code className="mt-4 block rounded-lg bg-slate-950/60 border border-slate-800 px-4 py-3 text-xs text-red-300 font-mono text-left break-all">
                {this.state.error.message}
              </code>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              >
                <RefreshCw size={15} />
                Try again
              </button>
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:border-slate-600 hover:text-white"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
