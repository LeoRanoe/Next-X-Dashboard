'use client'

import Image from 'next/image'
import { MapPin, Phone, MessageCircle, Zap, Heart } from 'lucide-react'

interface FooterSectionProps {
  storeName: string
  logoUrl?: string
  storeDescription?: string
  storeAddress: string
  whatsappNumber: string
}

export function FooterSection({
  storeName,
  logoUrl,
  storeDescription,
  storeAddress,
  whatsappNumber
}: FooterSectionProps) {
  const whatsappClean = whatsappNumber.replace(/[^0-9]/g, '')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950 to-neutral-900" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/[0.03] rounded-full blur-3xl" />
      
      <div className="relative border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {/* Brand column */}
            <div className="md:col-span-1">
              {logoUrl ? (
                <Image 
                  src={logoUrl} 
                  alt={storeName} 
                  width={140} 
                  height={48} 
                  className="h-10 w-auto object-contain mb-6"
                  unoptimized
                />
              ) : (
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Zap size={20} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-2xl font-black tracking-tight">
                    <span className="text-white">Next</span>
                    <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">X</span>
                  </span>
                </div>
              )}
              {storeDescription && (
                <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
                  {storeDescription}
                </p>
              )}
            </div>
          
          {/* Contact column */}
          <div className="md:col-span-1">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-6">
              Contact
            </h4>
            <ul className="space-y-5">
              <li>
                <div className="flex items-start gap-4 text-sm text-neutral-300 group">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:border-orange-500/30 group-hover:bg-orange-500/10 transition-all">
                    <MapPin size={16} className="text-orange-500" />
                  </div>
                  <span className="leading-relaxed pt-2.5">{storeAddress}</span>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-4 text-sm text-neutral-300 group">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:border-orange-500/30 group-hover:bg-orange-500/10 transition-all">
                    <Phone size={16} className="text-orange-500" />
                  </div>
                  <span>{whatsappNumber}</span>
                </div>
              </li>
            </ul>
          </div>
          
          {/* CTA column */}
          <div className="md:col-span-1">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-6">
              Bestellen
            </h4>
            <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
              Neem contact op via WhatsApp om je bestelling te plaatsen.
            </p>
            <a
              href={`https://wa.me/${whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#22c55e] hover:to-[#0ea271] text-white text-sm font-bold transition-all duration-300 shadow-xl shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:scale-105"
            >
              <MessageCircle size={18} strokeWidth={2.5} />
              <span>Start een chat</span>
            </a>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © {currentYear} {storeName}. Alle rechten voorbehouden.
          </p>
          <p className="flex items-center gap-2 text-sm text-neutral-600">
            <span>Made with</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>by NextX</span>
          </p>
        </div>
      </div>
    </div>
    </footer>
  )
}
