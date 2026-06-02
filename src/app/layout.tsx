import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ErrorBoundary } from "@/components/error-boundary";
import { JotaiProvider } from "@/components/providers/jotai-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SupplyChain",
  description: "Supply chain management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <JotaiProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </JotaiProvider>
      </body>
    </html>
  );
}
