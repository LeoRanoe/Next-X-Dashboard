export function PageHeader({ 
  title, 
  subtitle, 
  action,
  icon
}: { 
  title: string
  subtitle?: string
  action?: React.ReactNode
  icon?: React.ReactNode 
}) {
  return (
    <div className="bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--background))] border-b border-[hsl(var(--border))] backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {icon && <div className="text-orange-500">{icon}</div>}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-sm lg:text-base text-[hsl(var(--muted-foreground))] mt-2 font-medium">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center gap-3">{action}</div>}
        </div>
      </div>
    </div>
  )
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
      {children}
    </div>
  )
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description,
  action
}: { 
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 lg:py-24 px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-3xl blur-2xl" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--card))] rounded-3xl flex items-center justify-center border border-[hsl(var(--border))] shadow-lg">
          <Icon size={36} className="text-[hsl(var(--muted-foreground))]" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-[hsl(var(--muted-foreground))] text-center max-w-md mb-8 leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-[hsl(var(--border))] border-t-orange-500 rounded-full animate-spin" />
    </div>
  )
}

export function Badge({ 
  children, 
  variant = 'default',
  className = ''
}: { 
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'orange'
  className?: string
}) {
  const variants = {
    default: 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]',
    success: 'bg-green-950/50 text-green-400 border-green-800',
    warning: 'bg-amber-950/50 text-amber-400 border-amber-800',
    danger: 'bg-red-950/50 text-red-400 border-red-800',
    info: 'bg-blue-950/50 text-blue-400 border-blue-800',
    orange: 'bg-orange-950/50 text-orange-400 border-orange-800',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold tracking-wide border ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function Button({ 
  children, 
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  className = ''
}: { 
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}) {
  const variants = {
    primary: 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 border border-orange-600/20',
    secondary: 'bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-sm hover:shadow-md',
    outline: 'border-2 border-orange-500/70 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500 shadow-sm',
    ghost: 'hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:text-[hsl(var(--foreground))]',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-3',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
        font-semibold rounded-xl transition-all duration-200
        active:scale-[0.98] active:shadow-sm
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
      `}
    >
      {children}
    </button>
  )
}
