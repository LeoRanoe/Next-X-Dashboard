import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'red'
}

export function StatCard({ title, value, icon: Icon, trend, color = 'orange' }: StatCardProps) {
  const colorClasses = {
    orange: 'from-orange-500 via-orange-600 to-orange-700 shadow-orange-500/20',
    blue: 'from-blue-500 via-blue-600 to-blue-700 shadow-blue-500/20',
    green: 'from-green-500 via-green-600 to-green-700 shadow-green-500/20',
    purple: 'from-purple-500 via-purple-600 to-purple-700 shadow-purple-500/20',
    red: 'from-red-500 via-red-600 to-red-700 shadow-red-500/20',
  }

  const iconBgClasses = {
    orange: 'bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20',
    blue: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20',
    green: 'bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20',
    purple: 'bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20',
    red: 'bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20',
  }

  const iconColorClasses = {
    orange: 'text-orange-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
  }

  return (
    <div className="group relative bg-[hsl(var(--card))] rounded-2xl p-6 border border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br from-orange-500 to-transparent" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[hsl(var(--muted-foreground))] font-semibold mb-2 tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] mb-3 tracking-tight">{value}</h3>
          {trend && (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${trend.isPositive ? 'bg-green-950/50 text-green-400 border border-green-800' : 'bg-red-950/50 text-red-400 border border-red-800'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-2xl ${iconBgClasses[color]} flex items-center justify-center shadow-sm`}>
          <Icon size={26} className={iconColorClasses[color]} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  )
}

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
  icon?: ReactNode
}

export function ChartCard({ title, subtitle, children, action, icon }: ChartCardProps) {
  return (
    <div className="bg-[hsl(var(--card))] rounded-2xl p-6 lg:p-8 border border-[hsl(var(--border))] hover:border-[hsl(var(--border-hover))] shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            {icon && <div className="text-orange-500">{icon}</div>}
            <h3 className="text-xl font-bold text-[hsl(var(--foreground))] tracking-tight">{title}</h3>
          </div>
          {subtitle && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 font-medium">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div>{children}</div>
    </div>
  )
}

interface QuickActionCardProps {
  title: string
  icon: LucideIcon
  onClick: () => void
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'red' | 'teal' | 'indigo'
}

export function QuickActionCard({ title, icon: Icon, onClick, color = 'orange' }: QuickActionCardProps) {
  const colorClasses = {
    orange: 'from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 shadow-orange-500/30',
    blue: 'from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 shadow-blue-500/30',
    green: 'from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 shadow-green-500/30',
    purple: 'from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 shadow-purple-500/30',
    red: 'from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-red-500/30',
    teal: 'from-teal-500 via-teal-600 to-teal-700 hover:from-teal-600 hover:via-teal-700 hover:to-teal-800 shadow-teal-500/30',
    indigo: 'from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:via-indigo-700 hover:to-indigo-800 shadow-indigo-500/30',
  }

  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 active:scale-[0.98] w-full text-left group border border-white/10`}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      
      <div className="relative flex flex-col gap-3">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-white/30">
          <Icon size={22} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-base tracking-tight">{title}</span>
      </div>
    </button>
  )
}

interface ActivityItemProps {
  icon: LucideIcon
  title: string
  time: string
  color?: 'orange' | 'blue' | 'green' | 'purple'
}

export function ActivityItem({ icon: Icon, title, time, color = 'orange' }: ActivityItemProps) {
  const colorClasses = {
    orange: 'bg-orange-950/50 text-orange-400 border border-orange-800',
    blue: 'bg-blue-950/50 text-blue-400 border border-blue-800',
    green: 'bg-green-950/50 text-green-400 border border-green-800',
    purple: 'bg-purple-950/50 text-purple-400 border border-purple-800',
  }

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-[hsl(var(--muted))] rounded-lg transition">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{title}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{time}</p>
      </div>
    </div>
  )
}
