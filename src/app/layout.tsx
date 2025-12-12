import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CurrencyProvider } from "@/lib/CurrencyContext";
import { AuthProvider } from "@/lib/AuthContext";
import { LayoutWrapper } from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "NextX Dashboard - Inventory & Sales Management",
  description: "Professional inventory and sales management system built with Next.js",
  icons: {
    icon: '/favicon.ico',
    apple: '/nextx-logo-light.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <CurrencyProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

