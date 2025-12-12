'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { Loader2 } from 'lucide-react'

// Routes that don't require authentication
const publicRoutes = ['/login', '/catalog']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !isAuthenticated && !publicRoutes.includes(pathname)) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, pathname, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // If on a public route, always show content
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>
  }

  // If not authenticated and not on public route, show loading (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Authenticated, show content
  return <>{children}</>
}
