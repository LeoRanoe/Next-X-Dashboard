'use client'

import Image from 'next/image'
import { ArrowRight, MapPin, Clock, Truck } from 'lucide-react'

interface NewHeroProps {
  storeName: string
  heroTitle: string
  heroSubtitle: string
  storeAddress: string
  logoUrl?: string
  featuredImageUrl?: string
  onExploreClick: () => void
}

export function NewHero({
  storeName,
  heroTitle,
  heroSubtitle,
  storeAddress,
  logoUrl,
  featuredImageUrl,
  onExploreClick
}: NewHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-neutral-100/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-neutral-200/30 to-transparent rounded-full -translate-x-1/2 translate-y-1/2" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-16 lg:py-24">
          {/* Content */}
          <div className="order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white border border-neutral-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-neutral-600">
                Alleen Afhalen in {storeAddress}
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight leading-[1.1] mb-6">
              {heroTitle || `Welkom bij ${storeName}`}
            </h1>
            
            {/* Subtitle */}
            {heroSubtitle && (
              <p className="text-lg text-neutral-600 max-w-lg mb-8 leading-relaxed">
                {heroSubtitle}
              </p>
            )}
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <button
                onClick={onExploreClick}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/20 hover:shadow-xl hover:shadow-neutral-900/25"
              >
                Ontdek Producten
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-neutral-400" />
                <span>Lokale Afhaallocatie</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-neutral-400" />
                <span>WhatsApp Bestellingen</span>
              </div>
            </div>
          </div>
          
          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-square max-w-md mx-auto lg:max-w-none">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-100 rounded-[2rem] transform rotate-3" />
              
              {/* Main image container */}
              <div className="relative bg-white rounded-[2rem] shadow-2xl shadow-neutral-200/50 overflow-hidden">
                {featuredImageUrl ? (
                  <Image
                    src={featuredImageUrl}
                    alt={storeName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : logoUrl ? (
                  <div className="aspect-square flex items-center justify-center p-12">
                    <Image
                      src={logoUrl}
                      alt={storeName}
                      width={300}
                      height={300}
                      className="max-w-full max-h-full object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-50">
                    <span className="text-6xl font-bold text-neutral-200">
                      {storeName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <MapPin size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Afhaallocatie</p>
                    <p className="text-sm font-medium text-neutral-900">{storeAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
