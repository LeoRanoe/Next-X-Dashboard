'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { AuthGuard } from './AuthGuard'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { Loader2 } from 'lucide-react'

// Routes that don't need the admin layout
const noLayoutRoutes = ['/login', '/catalog']

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // For public routes like login and catalog, don't show admin layout
  if (noLayoutRoutes.includes(pathname)) {
    return <>{children}</>
  }

  // For admin routes, show full layout with auth guard
  return (
    <AuthGuard>
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
    </AuthGuard>
  )
}
