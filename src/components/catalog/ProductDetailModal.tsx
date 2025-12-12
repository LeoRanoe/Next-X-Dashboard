'use client'

import Image from 'next/image'
import { X, Plus, Package, Tag } from 'lucide-react'
import { formatCurrency, type Currency } from '@/lib/currency'

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  name: string
  description?: string | null
  imageUrl?: string | null
  price: number
  currency: Currency
  categoryName?: string | null
  onAddToCart: () => void
}

export function ProductDetailModal({
  isOpen,
  onClose,
  name,
  description,
  imageUrl,
  price,
  currency,
  categoryName,
  onAddToCart
}: ProductDetailModalProps) {
  if (!isOpen) return null

  const handleAddToCart = () => {
    onAddToCart()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-neutral-950 rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto border border-white/[0.06] shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.06] flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          <X size={18} className="text-white" />
        </button>

        <div className="md:flex">
          {/* Image */}
          <div className="md:w-1/2 aspect-square bg-neutral-900 relative">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package size={80} className="text-neutral-800" strokeWidth={1} />
              </div>
            )}
            
            {/* Category badge on image */}
            {categoryName && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.06] text-xs font-medium text-white/90">
                  {categoryName}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="md:w-1/2 p-8 flex flex-col">
            {/* Category tag */}
            {categoryName && (
              <div className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium mb-4 md:hidden">
                <Tag size={12} strokeWidth={2} />
                <span>{categoryName}</span>
              </div>
            )}
            
            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-4">
              {name}
            </h2>
            
            {/* Description */}
            {description && (
              <p className="text-sm text-neutral-400 leading-relaxed mb-8 flex-1">
                {description}
              </p>
            )}

            {/* Price and CTA */}
            <div className="pt-6 border-t border-white/[0.04] mt-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Prijs</p>
                  <span className="text-2xl font-semibold text-white">
                    {formatCurrency(price, currency)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleAddToCart}
                className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-semibold flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
              >
                <Plus size={20} strokeWidth={2} />
                <span>Toevoegen aan winkelwagen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
