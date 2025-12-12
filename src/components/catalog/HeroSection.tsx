'use client'

import { MapPin, Phone } from 'lucide-react'

interface HeroSectionProps {
  storeName: string
  heroTitle: string
  heroSubtitle: string
  storeAddress: string
  whatsappNumber: string
}

export function HeroSection({ 
  storeName, 
  heroTitle, 
  heroSubtitle, 
  storeAddress, 
  whatsappNumber 
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950" />
      
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-4xl mx-auto text-center">
          {/* Premium badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-medium tracking-widest uppercase text-neutral-400">
              Premium Collection
            </span>
          </div>
          
          {/* Main title */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tight text-white mb-6 leading-[1.1]">
            {heroTitle || `Welkom bij ${storeName}`}
          </h1>
          
          {/* Subtitle */}
          {heroSubtitle && (
            <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              {heroSubtitle}
            </p>
          )}
          
          {/* Contact pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-sm text-neutral-300 transition-all hover:bg-white/[0.05] hover:border-white/[0.1]">
              <MapPin size={14} className="text-orange-500/80" />
              <span className="font-light">{storeAddress}</span>
            </div>
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-sm text-neutral-300 transition-all hover:bg-white/[0.05] hover:border-white/[0.1]">
              <Phone size={14} className="text-orange-500/80" />
              <span className="font-light">{whatsappNumber}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
