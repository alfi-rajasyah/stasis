import type { Metadata } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TabBar } from "@/components/tab-bar";
import { TRPCProvider } from "@/trpc/react";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Stasis",
  description: "Personal Finance Manager",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${openSans.variable} font-sans antialiased`}>
        <ThemeProvider>
          <TRPCProvider>
            <div className="min-h-screen pb-20">{children}</div>
            <TabBar />
          </TRPCProvider>
        </ThemeProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
