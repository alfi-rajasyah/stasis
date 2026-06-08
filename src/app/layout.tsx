import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TabBar } from "@/components/tab-bar";
import { OfflineBanner } from "@/components/offline-banner";
import { TRPCProvider } from "@/trpc/react";
import { PageTransition } from "@/components/page-transition";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Stasis",
  description: "Personal Finance Manager",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090B",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased relative`}>
        <OfflineBanner />
        <ThemeProvider>
          <TRPCProvider>
            <div className="relative z-10 min-h-screen pb-24">
              <PageTransition>{children}</PageTransition>
            </div>
            <TabBar />
          </TRPCProvider>
        </ThemeProvider>
        <Toaster position="top-center" richColors />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
      </body>
    </html>
  );
}
