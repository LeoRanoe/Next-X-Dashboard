'use client'

import Image from 'next/image'
import { MapPin, Phone, MessageCircle } from 'lucide-react'

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
    <footer className="border-t border-white/[0.04] bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand column */}
          <div className="md:col-span-5 lg:col-span-4">
            {logoUrl ? (
              <Image 
                src={logoUrl} 
                alt={storeName} 
                width={120} 
                height={40} 
                className="h-8 w-auto object-contain mb-6"
                unoptimized
              />
            ) : (
              <div className="text-2xl font-semibold tracking-tight mb-6">
                <span className="text-white">Next</span>
                <span className="text-orange-500">X</span>
              </div>
            )}
            {storeDescription && (
              <p className="text-sm text-neutral-500 leading-relaxed max-w-sm">
                {storeDescription}
              </p>
            )}
          </div>
          
          {/* Contact column */}
          <div className="md:col-span-3 lg:col-span-4">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-6">
              Contact
            </h4>
            <ul className="space-y-4">
              <li>
                <div className="flex items-start gap-3 text-sm text-neutral-400">
                  <MapPin size={16} className="text-orange-500/60 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{storeAddress}</span>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <Phone size={16} className="text-orange-500/60 flex-shrink-0" />
                  <span>{whatsappNumber}</span>
                </div>
              </li>
            </ul>
          </div>
          
          {/* CTA column */}
          <div className="md:col-span-4 lg:col-span-4">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-6">
              Bestellen
            </h4>
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              Neem contact op via WhatsApp om je bestelling te plaatsen.
            </p>
            <a
              href={`https://wa.me/${whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#22c55e] text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/30"
            >
              <MessageCircle size={16} strokeWidth={2} />
              <span>Start een chat</span>
            </a>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600">
            © {currentYear} {storeName}. Alle rechten voorbehouden.
          </p>
          <p className="text-xs text-neutral-700">
            Powered by NextX
          </p>
        </div>
      </div>
    </footer>
  )
}
