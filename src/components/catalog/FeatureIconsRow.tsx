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
    <section className="border-y border-white/[0.04] bg-neutral-950/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-4 group"
            >
              {/* Icon container */}
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center transition-all duration-300 group-hover:bg-orange-500/10 group-hover:border-orange-500/20">
                <feature.icon 
                  size={20} 
                  className="text-neutral-400 transition-colors duration-300 group-hover:text-orange-500" 
                  strokeWidth={1.5}
                />
              </div>
              
              {/* Text */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {feature.title}
                </p>
                <p className="text-xs text-neutral-500 truncate">
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
