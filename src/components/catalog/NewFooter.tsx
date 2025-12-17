'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, MessageCircle, Mail, Clock, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface NewFooterProps {
  storeName: string
  logoUrl?: string
  storeDescription?: string
  storeAddress: string
  whatsappNumber: string
  storeEmail?: string
  categories: Category[]
  onCategoryClick: (categoryId: string) => void
}

export function NewFooter({
  storeName,
  logoUrl,
  storeDescription,
  storeAddress,
  whatsappNumber,
  storeEmail,
  categories,
  onCategoryClick
}: NewFooterProps) {
  const whatsappClean = whatsappNumber.replace(/[^0-9]/g, '')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-neutral-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            {logoUrl ? (
              <Image 
                src={logoUrl} 
                alt={storeName} 
                width={120} 
                height={40} 
                className="h-8 w-auto object-contain mb-4"
                unoptimized
              />
            ) : (
              <span className="text-xl font-bold text-neutral-900 block mb-4">
                {storeName}
              </span>
            )}
            {storeDescription && (
              <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                {storeDescription}
              </p>
            )}
            <a
              href={`https://wa.me/${whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-medium hover:bg-[#22c55e] transition-colors"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>

          {/* Categories Column */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">
              Categorieën
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => onCategoryClick('')}
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Alle Producten
                </button>
              </li>
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onCategoryClick(cat.id)}
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Column */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">
              Informatie
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/blog" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Blog
                </Link>
              </li>
              <li className="flex items-start gap-3 text-sm text-neutral-600">
                <MapPin size={16} className="text-neutral-400 mt-0.5 shrink-0" />
                <span>Alleen afhalen op locatie, geen bezorging</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-neutral-600">
                <MessageCircle size={16} className="text-neutral-400 mt-0.5 shrink-0" />
                <span>Bestel via WhatsApp</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-neutral-600">
                <Clock size={16} className="text-neutral-400 mt-0.5 shrink-0" />
                <span>Snelle reactie binnen kantooruren</span>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">
              Contact
            </h4>
            <ul className="space-y-4">
              <li>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500 mb-0.5">Afhaallocatie</p>
                    <p className="text-sm text-neutral-900">{storeAddress}</p>
                  </div>
                </div>
              </li>
              <li>
                <a 
                  href={`https://wa.me/${whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <Phone size={16} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500 mb-0.5">WhatsApp</p>
                    <p className="text-sm text-neutral-900 group-hover:text-[#25D366] transition-colors">
                      {whatsappNumber}
                    </p>
                  </div>
                </a>
              </li>
              {storeEmail && (
                <li>
                  <a 
                    href={`mailto:${storeEmail}`}
                    className="flex items-start gap-3 group"
                  >
                    <Mail size={16} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-500 mb-0.5">E-mail</p>
                      <p className="text-sm text-neutral-900 group-hover:text-neutral-600 transition-colors">
                        {storeEmail}
                      </p>
                    </div>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              © {currentYear} {storeName}. Alle rechten voorbehouden.
            </p>
            <p className="text-sm text-neutral-400">
              Powered by NextX
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
