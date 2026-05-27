import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AuthProvider } from "@/components/AuthProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TopLoadingBar } from "@/components/TopLoadingBar";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Alternative Credit Intelligence",
    template: "%s | ACI Platform",
  },
  description:
    "AI-powered alternative credit scoring engine — fraud detection, behavioral analytics, and financial health intelligence.",
  keywords: ["credit scoring", "fraud detection", "fintech", "AI", "alternative credit"],
  openGraph: {
    title: "Alternative Credit Intelligence Platform",
    description: "Real-time financial risk & fraud intelligence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <TopLoadingBar />
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
