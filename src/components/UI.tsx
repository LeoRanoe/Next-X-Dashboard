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
    <div className="bg-gradient-to-b from-white to-gray-50/30 border-b border-gray-200/60 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {icon && <div className="text-orange-600">{icon}</div>}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-sm lg:text-base text-gray-600 mt-2 font-medium">{subtitle}</p>
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
        <div className="relative w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center border border-gray-200 shadow-lg">
          <Icon size={36} className="text-gray-400" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 text-center max-w-md mb-8 leading-relaxed">
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
      <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
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
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
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
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300',
    outline: 'border-2 border-orange-500/70 text-orange-600 hover:bg-orange-50 hover:border-orange-600 shadow-sm',
    ghost: 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900',
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
