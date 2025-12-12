'use client'

import { Truck, Shield, Star, Headphones } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Snelle Levering',
    description: 'In heel Suriname'
  },
  {
    icon: Shield,
    title: 'Veilig Bestellen',
    description: 'Via WhatsApp'
  },
  {
    icon: Star,
    title: 'Premium Kwaliteit',
    description: 'Gegarandeerd'
  },
  {
    icon: Headphones,
    title: 'Klantenservice',
    description: 'Altijd bereikbaar'
  }
]

export function FeatureIconsRow() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.06]">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/[0.02] via-transparent to-amber-500/[0.02]" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-4 group"
            >
              {/* Icon container */}
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/15 to-amber-500/5 border border-orange-500/20 flex items-center justify-center transition-all duration-300 group-hover:from-orange-500/25 group-hover:to-amber-500/15 group-hover:border-orange-400/40 group-hover:shadow-xl group-hover:shadow-orange-500/20 group-hover:scale-110">
                <feature.icon 
                  size={22} 
                  className="text-orange-400 transition-all duration-300" 
                  strokeWidth={2}
                />
              </div>
              
              {/* Text */}
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate mb-0.5">
                  {feature.title}
                </p>
                <p className="text-xs text-neutral-400 truncate font-medium">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
