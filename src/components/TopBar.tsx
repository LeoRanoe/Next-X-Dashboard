'use client'

import { Bell, Search, Menu, DollarSign } from 'lucide-react'
import { useState } from 'react'
import MobileMenu from './MobileMenu'
import { useCurrency } from '@/lib/CurrencyContext'

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { displayCurrency, setDisplayCurrency, exchangeRate } = useCurrency()

  return (
    <>
      <header className="bg-card/95 border-b border-border sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 lg:px-6 py-2 lg:py-3">
          {/* Left Section - Mobile Menu & Logo */}
          <div className="flex items-center gap-2 lg:gap-3 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <Menu size={20} className="text-foreground" />
            </button>
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-1.5">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm">
              NX
            </div>
            <span className="font-bold text-sm text-foreground">NextX</span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-2.5 w-full max-w-md border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-muted transition-all">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder-[hsl(var(--muted-foreground))] w-full font-medium"
            />
          </div>
        </div>

        {/* Right Section - Currency Toggle, Actions & Profile */}
        <div className="flex items-center gap-1 lg:gap-2">
          {/* Currency Toggle */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border border-border">
            <button
              onClick={() => setDisplayCurrency('USD')}
              className={`flex items-center gap-1 px-2 py-1 lg:px-3 lg:py-1.5 rounded-md text-xs lg:text-sm font-semibold transition-all ${
                displayCurrency === 'USD'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <DollarSign size={14} />
              <span className="hidden sm:inline">USD</span>
            </button>
            <button
              onClick={() => setDisplayCurrency('SRD')}
              className={`flex items-center gap-1 px-2 py-1 lg:px-3 lg:py-1.5 rounded-md text-xs lg:text-sm font-semibold transition-all ${
                displayCurrency === 'SRD'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="hidden sm:inline">SRD</span>
              <span className="sm:hidden">S</span>
            </button>
          </div>

          {/* Exchange Rate Display - Desktop only */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/30 rounded-lg border border-border/50 text-xs text-muted-foreground">
            <span>1 USD = {exchangeRate} SRD</span>
          </div>

          {/* Search Icon - Mobile */}
          <button className="lg:hidden p-1.5 hover:bg-muted rounded-lg transition-colors">
            <Search size={18} className="text-muted-foreground" />
          </button>

          {/* Notifications */}
          <button className="relative p-1.5 lg:p-2 hover:bg-muted rounded-lg lg:rounded-xl transition-colors">
            <Bell size={18} className="lg:w-5 lg:h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 lg:top-1.5 lg:right-1.5 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-orange-500 rounded-full ring-2 ring-card"></span>
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2 px-1.5 lg:px-2 py-1 lg:py-1.5 hover:bg-muted rounded-lg lg:rounded-xl transition-colors">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-foreground">Admin User</span>
              <span className="text-xs text-muted-foreground">Administrator</span>
            </div>
            <div className="w-7 h-7 lg:w-9 lg:h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg lg:rounded-xl flex items-center justify-center text-white font-semibold text-xs lg:text-sm shadow-sm">
              A
            </div>
          </button>
        </div>
      </div>
    </header>

    {/* Mobile Menu Drawer */}
    <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  )
}

