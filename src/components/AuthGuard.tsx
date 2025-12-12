'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { Loader2, ShieldX, ArrowLeft } from 'lucide-react'

// Routes that don't require authentication
const publicRoutes = ['/login', '/catalog']

// Admin-only routes that require admin role
const adminOnlyRoutes = [
  '/',           // Dashboard
  '/items',
  '/stock',
  '/orders',
  '/sales',
  '/expenses',
  '/budgets',
  '/wallets',
  '/commissions',
  '/exchange',
  '/locations',
  '/reports',
  '/settings',
  '/activity',
  '/reservations',
  '/upload-example',
  '/migrate'
]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicRoute = publicRoutes.includes(pathname)
  const isAdminRoute = adminOnlyRoutes.includes(pathname)
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicRoute) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, pathname, router, isPublicRoute])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // If on a public route, always show content
  if (isPublicRoute) {
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

  // Check admin access for admin-only routes
  if (isAdminRoute && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 flex items-center justify-center mb-6">
            <ShieldX className="w-10 h-10 text-red-500" />
          </div>
          
          {/* Message */}
          <h1 className="text-2xl font-bold text-white mb-3">
            Access Denied
          </h1>
          <p className="text-neutral-400 mb-8">
            You don&apos;t have permission to access this page. This area is restricted to administrators only.
          </p>
          
          {/* User info */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 mb-6">
            <p className="text-sm text-neutral-500 mb-1">Logged in as:</p>
            <p className="text-white font-medium">{user?.email}</p>
            <span className="inline-flex items-center px-2.5 py-1 mt-2 rounded-full bg-neutral-800 text-xs font-medium text-neutral-400 capitalize">
              {user?.role} Account
            </span>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/catalog')}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold transition-all"
            >
              Go to Catalog
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white font-medium hover:bg-white/[0.1] transition-all"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated and authorized, show content
  return <>{children}</>
}
