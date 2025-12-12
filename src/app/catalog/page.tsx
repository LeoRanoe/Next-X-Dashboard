'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import Image from 'next/image'
import { ShoppingCart, Search, Package, MessageCircle, X, Plus, Minus, ChevronDown, MapPin, Phone, Star, Grid3X3, LayoutGrid, Truck, Shield, Clock, ArrowRight, Sparkles, Tag } from 'lucide-react'
import { formatCurrency, type Currency } from '@/lib/currency'

type Category = Database['public']['Tables']['categories']['Row']
type Item = Database['public']['Tables']['items']['Row']

interface CartItem {
  item: Item
  quantity: number
}

interface StoreSettings {
  whatsapp_number: string
  store_name: string
  store_description: string
  store_address: string
  store_logo_url: string
  hero_title: string
  hero_subtitle: string
}

export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [settings, setSettings] = useState<StoreSettings>({
    whatsapp_number: '+5978318508',
    store_name: 'NextX',
    store_description: '',
    store_address: 'Commewijne, Noord',
    store_logo_url: '',
    hero_title: 'Welkom',
    hero_subtitle: ''
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currency, setCurrency] = useState<Currency>('SRD')
  const [exchangeRate, setExchangeRate] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [showItemDetail, setShowItemDetail] = useState<Item | null>(null)
  const [gridView, setGridView] = useState<'compact' | 'comfortable'>('comfortable')
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'newest'>('name')

  const loadData = async () => {
    setLoading(true)
    const [categoriesRes, itemsRes, rateRes, settingsRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('items').select('*').eq('is_public', true).order('name'),
      supabase.from('exchange_rates').select('*').eq('is_active', true).single(),
      supabase.from('store_settings').select('*')
    ])
    
    if (categoriesRes.data) setCategories(categoriesRes.data)
    if (itemsRes.data) setItems(itemsRes.data)
    if (rateRes.data) setExchangeRate(rateRes.data.usd_to_srd)
    if (settingsRes.data) {
      const settingsMap: Record<string, string> = {}
      settingsRes.data.forEach((s: { key: string; value: string }) => {
        settingsMap[s.key] = s.value
      })
      setSettings({
        whatsapp_number: settingsMap.whatsapp_number || '+5978318508',
        store_name: settingsMap.store_name || 'NextX',
        store_description: settingsMap.store_description || '',
        store_address: settingsMap.store_address || 'Commewijne, Noord',
        store_logo_url: settingsMap.store_logo_url || '',
        hero_title: settingsMap.hero_title || 'Welkom',
        hero_subtitle: settingsMap.hero_subtitle || ''
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const getPrice = (item: Item): number => {
    if (currency === 'USD') {
      return item.selling_price_usd || (item.selling_price_srd ? item.selling_price_srd / exchangeRate : 0)
    }
    return item.selling_price_srd || (item.selling_price_usd ? item.selling_price_usd * exchangeRate : 0)
  }

  const addToCart = (item: Item, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id)
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { item, quantity: 1 }]
    })
  }

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(c => c.item.id !== itemId))
    } else {
      setCart(prev => prev.map(c => c.item.id === itemId ? { ...c, quantity } : c))
    }
  }

  const getCartTotal = () => cart.reduce((sum, c) => sum + (getPrice(c.item) * c.quantity), 0)
  const getCartCount = () => cart.reduce((sum, c) => sum + c.quantity, 0)

  const sendWhatsAppOrder = () => {
    if (cart.length === 0) return
    
    let message = `Hallo ${settings.store_name}!\n\n`
    message += `Ik wil graag bestellen:\n\n`
    
    cart.forEach((c, idx) => {
      const price = getPrice(c.item)
      message += `${idx + 1}. ${c.item.name}\n`
      message += `   ${c.quantity}x ${formatCurrency(price, currency)} = ${formatCurrency(price * c.quantity, currency)}\n\n`
    })
    
    message += `━━━━━━━━━━━━━━━━━━\n`
    message += `Totaal: ${formatCurrency(getCartTotal(), currency)}\n\n`
    
    if (customerName) message += `Naam: ${customerName}\n`
    if (customerPhone) message += `Tel: ${customerPhone}\n`
    if (customerNotes) message += `Opmerking: ${customerNotes}\n`
    
    const whatsappNumber = settings.whatsapp_number.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = !selectedCategory || item.category_id === selectedCategory
      return matchesSearch && matchesCategory
    })

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => getPrice(a) - getPrice(b))
        break
      case 'price-desc':
        result.sort((a, b) => getPrice(b) - getPrice(a))
        break
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      default:
        result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [items, searchQuery, selectedCategory, sortBy, currency, exchangeRate])

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null
    const cat = categories.find(c => c.id === categoryId)
    return cat?.name || null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-400 animate-pulse">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-20 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {settings.store_logo_url ? (
                <Image 
                  src={settings.store_logo_url} 
                  alt={settings.store_name} 
                  width={140} 
                  height={50} 
                  className="h-8 sm:h-10 w-auto object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-xl sm:text-2xl font-bold tracking-tight">
                  <span className="text-white">Next</span>
                  <span className="text-orange-500">X</span>
                </span>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {/* Currency Toggle */}
              <div className="flex p-1 bg-neutral-800/50 rounded-full">
                <button
                  onClick={() => setCurrency('SRD')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                    currency === 'SRD' 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  SRD
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                    currency === 'USD' 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  USD
                </button>
              </div>

              {/* WhatsApp Contact */}
              <a
                href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-full text-sm font-semibold transition-all duration-200 shadow-lg shadow-green-600/25 hover:shadow-green-500/40"
              >
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2.5 sm:p-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-full transition-all duration-200 group"
            >
              <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50">
                  {getCartCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-6">
              <Sparkles size={16} />
              <span>Premium Kwaliteit</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {settings.hero_title || `Welkom bij ${settings.store_name}`}
            </h1>
            
            {settings.hero_subtitle && (
              <p className="text-lg sm:text-xl text-neutral-400 mb-8 leading-relaxed max-w-2xl">
                {settings.hero_subtitle}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 rounded-full">
                <MapPin size={16} className="text-orange-500" />
                <span>{settings.store_address}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 rounded-full">
                <Phone size={16} className="text-orange-500" />
                <span>{settings.whatsapp_number}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-neutral-800/50 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Truck size={20} className="text-orange-500" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-white">Snelle Levering</p>
                <p className="text-neutral-500">In heel Suriname</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Shield size={20} className="text-orange-500" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-white">Veilig Bestellen</p>
                <p className="text-neutral-500">Via WhatsApp</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Star size={20} className="text-orange-500" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-white">Kwaliteit</p>
                <p className="text-neutral-500">Gegarandeerd</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Clock size={20} className="text-orange-500" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-white">Klantenservice</p>
                <p className="text-neutral-500">Altijd bereikbaar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search & Filters Bar */}
        <div className="sticky top-16 sm:top-20 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-neutral-950/80 backdrop-blur-xl mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek producten..."
                className="w-full pl-12 pr-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex gap-3">
              {/* Category Filter */}
              <div className="relative flex-1 lg:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none w-full px-4 py-3 pr-10 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                >
                  <option value="">Alle categorieën</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={18} />
              </div>

              {/* Sort */}
              <div className="relative flex-1 lg:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="appearance-none w-full px-4 py-3 pr-10 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                >
                  <option value="name">Naam A-Z</option>
                  <option value="price-asc">Prijs: Laag-Hoog</option>
                  <option value="price-desc">Prijs: Hoog-Laag</option>
                  <option value="newest">Nieuwste</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={18} />
              </div>

              {/* Grid Toggle */}
              <div className="hidden sm:flex p-1 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                <button
                  onClick={() => setGridView('comfortable')}
                  className={`p-2 rounded-lg transition-colors ${gridView === 'comfortable' ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:text-white'}`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setGridView('compact')}
                  className={`p-2 rounded-lg transition-colors ${gridView === 'compact' ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:text-white'}`}
                >
                  <Grid3X3 size={20} />
                </button>
              </div>

              {/* Mobile Currency Toggle */}
              <div className="flex sm:hidden p-1 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                <button
                  onClick={() => setCurrency('SRD')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currency === 'SRD' ? 'bg-orange-500 text-white' : 'text-neutral-400'
                  }`}
                >
                  SRD
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currency === 'USD' ? 'bg-orange-500 text-white' : 'text-neutral-400'
                  }`}
                >
                  USD
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-neutral-500">
            <span className="text-white font-semibold">{filteredItems.length}</span> producten
            {selectedCategory && ` in ${getCategoryName(selectedCategory)}`}
          </p>
        </div>

        {/* Products Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-800/50 flex items-center justify-center">
              <Package size={40} className="text-neutral-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Geen producten gevonden</h3>
            <p className="text-neutral-500 mb-6">Probeer een andere zoekterm of categorie</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('') }}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl font-medium transition-colors"
            >
              Filters wissen
            </button>
          </div>
        ) : (
          <div className={`grid gap-4 sm:gap-6 ${
            gridView === 'comfortable' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          }`}>
            {filteredItems.map((item) => {
              const price = getPrice(item)
              const cartItem = cart.find(c => c.item.id === item.id)
              const categoryName = getCategoryName(item.category_id)
              
              return (
                <div 
                  key={item.id} 
                  className="group bg-neutral-900/50 rounded-2xl overflow-hidden border border-neutral-800/50 hover:border-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5"
                >
                  {/* Image */}
                  <div 
                    className="aspect-square bg-neutral-800 relative cursor-pointer overflow-hidden"
                    onClick={() => setShowItemDetail(item)}
                  >
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                        <Package size={40} className="text-neutral-700" />
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    {categoryName && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                        {categoryName}
                      </span>
                    )}

                    {/* Quick Add Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <button
                        onClick={(e) => addToCart(item, e)}
                        className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                      >
                        <Plus size={18} />
                        Toevoegen
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className={`p-4 ${gridView === 'compact' ? 'p-3' : ''}`}>
                    <h3 
                      className={`font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-orange-500 transition-colors ${gridView === 'compact' ? 'text-sm' : ''}`}
                      onClick={() => setShowItemDetail(item)}
                    >
                      {item.name}
                    </h3>
                    
                    {item.description && gridView === 'comfortable' && (
                      <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{item.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-orange-500 font-bold ${gridView === 'compact' ? 'text-base' : 'text-lg'}`}>
                        {formatCurrency(price, currency)}
                      </span>
                      
                      {cartItem ? (
                        <div className="flex items-center gap-1 bg-neutral-800 rounded-xl p-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateCartQuantity(item.id, cartItem.quantity - 1) }}
                            className="p-1.5 hover:bg-neutral-700 rounded-lg transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{cartItem.quantity}</span>
                          <button
                            onClick={(e) => addToCart(item, e)}
                            className="p-1.5 hover:bg-neutral-700 rounded-lg transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => addToCart(item, e)}
                          className="p-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl transition-all duration-200 hover:scale-110"
                        >
                          <Plus size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/50 mt-16 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              {settings.store_logo_url ? (
                <Image 
                  src={settings.store_logo_url} 
                  alt={settings.store_name} 
                  width={140} 
                  height={50} 
                  className="h-10 w-auto object-contain mb-4"
                  unoptimized
                />
              ) : (
                <div className="text-2xl font-bold mb-4">
                  <span className="text-white">Next</span>
                  <span className="text-orange-500">X</span>
                </div>
              )}
              {settings.store_description && (
                <p className="text-neutral-500 text-sm">{settings.store_description}</p>
              )}
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-3 text-sm text-neutral-400">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-orange-500" />
                  <span>{settings.store_address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-orange-500" />
                  <span>{settings.whatsapp_number}</span>
                </div>
              </div>
            </div>
            
            {/* Order CTA */}
            <div>
              <h4 className="font-semibold text-white mb-4">Bestellen</h4>
              <p className="text-sm text-neutral-400 mb-4">
                Wil je iets bestellen? Neem contact met ons op via WhatsApp!
              </p>
              <a
                href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-semibold transition-all"
              >
                <MessageCircle size={18} />
                Start Chat
              </a>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} {settings.store_name}. Alle rechten voorbehouden.
            </p>
            <p className="text-xs text-neutral-600">
              Powered by NextX Dashboard
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile WhatsApp FAB */}
      <a
        href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden fixed bottom-24 right-4 z-40 p-4 bg-green-600 rounded-full shadow-lg shadow-green-600/40 hover:bg-green-500 transition-all hover:scale-110"
      >
        <MessageCircle size={24} />
      </a>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-neutral-900 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Winkelwagen</h2>
                  <p className="text-sm text-neutral-500">{getCartCount()} items</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCart(false)} 
                className="p-2 hover:bg-neutral-800 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-neutral-800/50 flex items-center justify-center">
                    <ShoppingCart size={32} className="text-neutral-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Je winkelwagen is leeg</h3>
                  <p className="text-neutral-500 text-sm mb-6">Voeg producten toe om te bestellen</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl font-medium transition-colors"
                  >
                    Ga winkelen
                  </button>
                </div>
              ) : (
                cart.map((cartItem) => {
                  const price = getPrice(cartItem.item)
                  return (
                    <div key={cartItem.item.id} className="flex gap-4 p-4 bg-neutral-800/50 rounded-2xl">
                      <div className="w-20 h-20 rounded-xl bg-neutral-700 overflow-hidden shrink-0">
                        {cartItem.item.image_url ? (
                          <Image
                            src={cartItem.item.image_url}
                            alt={cartItem.item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-neutral-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold line-clamp-1">{cartItem.item.name}</h4>
                        <p className="text-orange-500 font-bold mt-1">{formatCurrency(price, currency)}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-1 bg-neutral-700/50 rounded-lg">
                            <button
                              onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity - 1)}
                              className="p-1.5 hover:bg-neutral-600 rounded-lg transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{cartItem.quantity}</span>
                            <button
                              onClick={() => addToCart(cartItem.item)}
                              className="p-1.5 hover:bg-neutral-600 rounded-lg transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="text-sm text-neutral-400">
                            = {formatCurrency(price * cartItem.quantity, currency)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => updateCartQuantity(cartItem.item.id, 0)}
                        className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg self-start transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-800 p-5 space-y-4 bg-neutral-950/50">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Naam"
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Telefoonnummer"
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                />
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Opmerkingen (optioneel)"
                  rows={2}
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-sm focus:outline-none focus:border-orange-500/50 resize-none transition-colors"
                />
                
                <div className="flex items-center justify-between py-4 border-t border-neutral-800">
                  <span className="text-neutral-400">Totaal</span>
                  <span className="text-2xl font-bold text-orange-500">{formatCurrency(getCartTotal(), currency)}</span>
                </div>

                <button
                  onClick={sendWhatsAppOrder}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-600/25 hover:shadow-green-500/40"
                >
                  <MessageCircle size={22} />
                  Bestel via WhatsApp
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showItemDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowItemDetail(null)} />
          
          <div className="relative w-full max-w-2xl bg-neutral-900 rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setShowItemDetail(null)}
              className="absolute top-4 right-4 z-10 p-2.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="md:flex">
              {/* Image */}
              <div className="md:w-1/2 aspect-square bg-neutral-800 relative">
                {showItemDetail.image_url ? (
                  <Image
                    src={showItemDetail.image_url}
                    alt={showItemDetail.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                    <Package size={80} className="text-neutral-700" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                {getCategoryName(showItemDetail.category_id) && (
                  <span className="inline-flex items-center gap-1 self-start px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-sm font-medium mb-4">
                    <Tag size={14} />
                    {getCategoryName(showItemDetail.category_id)}
                  </span>
                )}
                
                <h2 className="text-2xl md:text-3xl font-bold mb-4">{showItemDetail.name}</h2>
                
                {showItemDetail.description && (
                  <p className="text-neutral-400 mb-6 flex-1">{showItemDetail.description}</p>
                )}

                <div className="border-t border-neutral-800 pt-6 mt-auto">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-bold text-orange-500">
                      {formatCurrency(getPrice(showItemDetail), currency)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      addToCart(showItemDetail)
                      setShowItemDetail(null)
                    }}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-orange-500/25"
                  >
                    <Plus size={22} />
                    Toevoegen aan winkelwagen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
