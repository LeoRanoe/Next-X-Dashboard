'use client'

import { useRouter } from 'next/navigation'
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
  ArrowUpRight,
  Activity
} from 'lucide-react'
import { StatCard, ChartCard, QuickActionCard, ActivityItem } from '@/components/Cards'

export default function Home() {
  const router = useRouter()

  const quickActions = [
    { name: 'New Sale', icon: ShoppingCart, path: '/sales', color: 'orange' as const },
    { name: 'Add Stock', icon: Package, path: '/stock', color: 'blue' as const },
    { name: 'Exchange Rate', icon: DollarSign, path: '/exchange', color: 'green' as const },
    { name: 'View Reports', icon: BarChart3, path: '/reports', color: 'purple' as const },
  ]

  const recentActivity = [
    { icon: ShoppingCart, title: 'New sale completed - $450', time: '5 minutes ago', color: 'orange' as const },
    { icon: Package, title: 'Stock updated for Item #1234', time: '15 minutes ago', color: 'blue' as const },
    { icon: DollarSign, title: 'Exchange rate updated to 1:42', time: '1 hour ago', color: 'green' as const },
    { icon: Users, title: 'Commission calculated for John', time: '2 hours ago', color: 'purple' as const },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold mb-2">Welcome back! 👋</h1>
              <p className="text-orange-100 text-sm lg:text-base">Here's what's happening with your business today</p>
            </div>
            <div className="hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Activity size={20} />
              <span className="text-sm font-medium">Live Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <StatCard 
            title="Total Sales" 
            value="$12,450" 
            icon={DollarSign}
            trend={{ value: "12%", isPositive: true }}
            color="orange"
          />
          <StatCard 
            title="Active Orders" 
            value="47" 
            icon={ShoppingCart}
            trend={{ value: "8%", isPositive: true }}
            color="blue"
          />
          <StatCard 
            title="Stock Items" 
            value="1,234" 
            icon={Package}
            trend={{ value: "3%", isPositive: false }}
            color="green"
          />
          <StatCard 
            title="Total Revenue" 
            icon={TrendingUp}
            value="$45.2K" 
            trend={{ value: "15%", isPositive: true }}
            color="purple"
          />
        </div>

        {/* Quick Actions - Mobile & Desktop */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.name}
                title={action.name}
                icon={action.icon}
                onClick={() => router.push(action.path)}
                color={action.color}
              />
            ))}
          </div>
        </div>

        {/* Desktop Layout: Charts & Activity Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-6">
            <ChartCard 
              title="Monthly Profit" 
              subtitle="Trends from all brands"
              action={
                <button className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium">
                  View All <ArrowUpRight size={16} />
                </button>
              }
            >
              <div className="h-64 lg:h-80 flex items-end justify-between gap-2 lg:gap-4">
                {[40, 60, 45, 75, 55, 85, 70, 90, 65, 80, 75, 95].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 hidden lg:block">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Brand Sales - Desktop Only */}
            <div className="hidden lg:block">
              <ChartCard title="Brand Sales" subtitle="Distribution by category">
                <div className="flex items-center justify-center gap-8">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#F97316" strokeWidth="12" 
                        strokeDasharray="75 25" strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="12" 
                        strokeDasharray="15 85" strokeDashoffset="-75" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="12" 
                        strokeDasharray="10 90" strokeDashoffset="-90" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold text-gray-900">$3.2K</span>
                      <span className="text-sm text-gray-500">Total</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm text-gray-700">Brand A</span>
                      <span className="text-sm font-semibold text-gray-900 ml-auto">$2.4K</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700">Brand B</span>
                      <span className="text-sm font-semibold text-gray-900 ml-auto">$480</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-700">Brand C</span>
                      <span className="text-sm font-semibold text-gray-900 ml-auto">$320</span>
                    </div>
                  </div>
                </div>
              </ChartCard>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <ChartCard title="Recent Activity" subtitle="Latest updates">
              <div className="space-y-2">
                {recentActivity.map((activity, i) => (
                  <ActivityItem key={i} {...activity} />
                ))}
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Mobile: All Modules Grid */}
        <div className="lg:hidden mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">All Modules</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Items', icon: Package, path: '/items' },
              { name: 'Locations', icon: MapPin, path: '/locations' },
              { name: 'Wallets', icon: Wallet, path: '/wallets' },
              { name: 'Expenses', icon: Receipt, path: '/expenses' },
              { name: 'Commissions', icon: Users, path: '/commissions' },
              { name: 'Budgets', icon: Target, path: '/budgets' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95 flex flex-col items-center gap-2"
                >
                  <Icon size={24} className="text-orange-500" />
                  <span className="text-xs font-medium text-gray-700">{item.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
