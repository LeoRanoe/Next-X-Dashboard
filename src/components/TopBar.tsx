'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { useState } from 'react'
import MobileMenu from './MobileMenu'

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="bg-card/95 border-b border-border sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          {/* Left Section - Mobile Menu & Search */}
          <div className="flex items-center gap-3 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <Menu size={22} className="text-foreground" />
            </button>
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-sm">
              NX
            </div>
            <span className="font-bold text-foreground">NextX</span>
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

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Search Icon - Mobile */}
          <button className="lg:hidden p-2 hover:bg-muted rounded-xl transition-colors">
            <Search size={20} className="text-muted-foreground" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-muted rounded-xl transition-colors">
            <Bell size={20} className="text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-card"></span>
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-muted rounded-xl transition-colors">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-foreground">Admin User</span>
              <span className="text-xs text-muted-foreground">Administrator</span>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm">
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

