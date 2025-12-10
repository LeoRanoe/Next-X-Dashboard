'use client'

import { usePathname, useRouter } from 'next/navigation'
import { 
  Package, 
  MapPin, 
  ShoppingCart, 
  Wallet, 
  Receipt, 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp, 
  Target,
  BarChart3,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Items', icon: Package, path: '/items' },
    { name: 'Locations', icon: MapPin, path: '/locations' },
    { name: 'Stock', icon: Package, path: '/stock' },
    { name: 'Exchange', icon: DollarSign, path: '/exchange' },
    { name: 'Sales', icon: ShoppingCart, path: '/sales' },
    { name: 'Reservations', icon: Calendar, path: '/reservations' },
    { name: 'Wallets', icon: Wallet, path: '/wallets' },
    { name: 'Expenses', icon: Receipt, path: '/expenses' },
    { name: 'Commissions', icon: Users, path: '/commissions' },
    { name: 'Budgets', icon: Target, path: '/budgets' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
  ]

  return (
    <aside 
      className={`hidden lg:flex flex-col bg-[#1a1a1a] text-white transition-all duration-300 h-screen sticky top-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center font-bold text-xl">
              NX
            </div>
            <div>
              <h1 className="font-bold text-lg">NextX</h1>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center font-bold text-xl mx-auto">
            NX
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          {!isCollapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
