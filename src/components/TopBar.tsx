'use client'

import { Bell, Search, User, Menu } from 'lucide-react'
import { useState } from 'react'
import MobileMenu from './MobileMenu'

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 lg:px-8 py-4">
          {/* Left Section - Mobile Menu & Search */}
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition"
            >
              <Menu size={24} className="text-[hsl(var(--foreground))]" />
            </button>
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">
              NX
            </div>
            <span className="font-bold text-[hsl(var(--foreground))]">NextX</span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center gap-3 bg-[hsl(var(--muted))] rounded-lg px-4 py-2.5 w-full max-w-md border border-[hsl(var(--border))] focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition">
            <Search size={18} className="text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] w-full"
            />
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Search Icon - Mobile */}
          <button className="lg:hidden p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition">
            <Search size={20} className="text-[hsl(var(--muted-foreground))]" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition">
            <Bell size={20} className="text-[hsl(var(--muted-foreground))]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-3 px-3 py-2 hover:bg-[hsl(var(--muted))] rounded-lg transition">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Admin User</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Administrator</span>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
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
