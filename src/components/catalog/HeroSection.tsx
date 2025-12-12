'use client'

import { MapPin, Phone, Sparkles } from 'lucide-react'

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
      {/* Unique gradient mesh background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-neutral-950" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
      </div>
      
      {/* Floating orbs for depth */}
      <div className="absolute top-20 left-[15%] w-72 h-72 bg-gradient-to-br from-orange-500/25 to-orange-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-[10%] w-96 h-96 bg-gradient-to-br from-amber-500/15 to-orange-500/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-4xl mx-auto text-center">
          {/* Glowing badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 mb-8 rounded-full bg-gradient-to-r from-orange-500/25 to-amber-500/15 border border-orange-400/30 shadow-[0_0_30px_-5px_rgba(249,115,22,0.4)]">
            <Sparkles size={14} className="text-orange-400" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-orange-300">
              Premium Collection
            </span>
          </div>
          
          {/* Main title with glow */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1] drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            {heroTitle || `Welkom bij ${storeName}`}
          </h1>
          
          {/* Subtitle */}
          {heroSubtitle && (
            <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              {heroSubtitle}
            </p>
          )}
          
          {/* Contact pills with glassmorphism */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.15] text-sm text-white transition-all duration-300 hover:bg-white/[0.12] hover:border-orange-400/40 hover:shadow-[0_8px_30px_-5px_rgba(249,115,22,0.3)] hover:scale-105">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all">
                <MapPin size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-medium">{storeAddress}</span>
            </div>
            <div className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.15] text-sm text-white transition-all duration-300 hover:bg-white/[0.12] hover:border-orange-400/40 hover:shadow-[0_8px_30px_-5px_rgba(249,115,22,0.3)] hover:scale-105">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all">
                <Phone size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-medium">{whatsappNumber}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent" />
    </section>
  )
}
