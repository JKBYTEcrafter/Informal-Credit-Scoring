import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AuthProvider } from "@/components/AuthProvider";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Alternative Credit Intelligence",
  description: "Reliable data infrastructure for alternative credit scoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
