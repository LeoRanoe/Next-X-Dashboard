'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Wallet 
} from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', icon: LayoutDashboard, path: '/' },
    { name: 'Sales', icon: ShoppingCart, path: '/sales' },
    { name: 'Stock', icon: Package, path: '/stock' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
    { name: 'Wallets', icon: Wallet, path: '/wallets' },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-2xl z-50 safe-area-bottom backdrop-blur-md">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
                isActive ? 'text-orange-500' : 'text-muted-foreground'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-b-full" />
              )}
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-orange-50' : ''}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-xs mt-0.5 font-medium ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

