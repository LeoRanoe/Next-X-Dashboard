import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { CurrencyProvider } from "@/lib/CurrencyContext";

export const metadata: Metadata = {
  title: "NextX Dashboard - Inventory & Sales Management",
  description: "Professional inventory and sales management system built with Next.js",
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
        <CurrencyProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Bar */}
              <TopBar />
              
              {/* Page Content */}
              <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
                <div className="h-full">
                  {children}
                </div>
              </main>
            </div>
          </div>
          
          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </CurrencyProvider>
      </body>
    </html>
  );
}

