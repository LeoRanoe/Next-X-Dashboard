'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { MessageCircle, Search, X } from 'lucide-react'
import { formatCurrency, type Currency } from '@/lib/currency'

import {
  Header,
  HeroSection,
  ProductCard,
  ProductGrid,
  ProductGridHeader,
  CartDrawer,
  ProductDetailModal,
  FooterSection,
  CategorySlider,
  ProductCarousel
} from '@/components/catalog'

type Category = Database['public']['Tables']['categories']['Row']
type Item = Database['public']['Tables']['items']['Row']
type Location = Database['public']['Tables']['locations']['Row']

interface ComboItem {
  id: string
  parent_item_id: string
  child_item_id: string
  quantity: number
  items?: Item // child item details
}

interface ItemWithCombo extends Item {
  combo_items?: ComboItem[]
}

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
  // Data state
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<ItemWithCombo[]>([])
  const [comboItems, setComboItems] = useState<ItemWithCombo[]>([]) // Items that are combos
  const [locations, setLocations] = useState<Location[]>([])
  const [settings, setSettings] = useState<StoreSettings>({
    whatsapp_number: '+5978318508',
    store_name: 'NextX',
    store_description: '',
    store_address: 'Commewijne, Noord',
    store_logo_url: '',
    hero_title: 'Welkom',
    hero_subtitle: ''
  })
  const [exchangeRate, setExchangeRate] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currency, setCurrency] = useState<Currency>('SRD')

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>('') // Location ID for pickup

  // Modal state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('nextx-cart')
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        // We'll sync with items once they load
        setCart(parsed)
      } catch (e) {
        console.error('Failed to parse saved cart:', e)
      }
    }
    const savedName = localStorage.getItem('nextx-customer-name')
    const savedPhone = localStorage.getItem('nextx-customer-phone')
    if (savedName) setCustomerName(savedName)
    if (savedPhone) setCustomerPhone(savedPhone)
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('nextx-cart', JSON.stringify(cart))
    } else {
      localStorage.removeItem('nextx-cart')
    }
  }, [cart])

  // Save customer info to localStorage
  useEffect(() => {
    if (customerName) localStorage.setItem('nextx-customer-name', customerName)
    if (customerPhone) localStorage.setItem('nextx-customer-phone', customerPhone)
  }, [customerName, customerPhone])

  // Sync cart with items when items load (in case items have been updated/deleted)
  useEffect(() => {
    if (items.length > 0 && cart.length > 0) {
      const validCart = cart.filter(c => items.some(i => i.id === c.item.id))
      // Update cart items with latest item data
      const syncedCart = validCart.map(c => {
        const updatedItem = items.find(i => i.id === c.item.id)
        return updatedItem ? { ...c, item: updatedItem } : c
      }).filter(c => c.item !== undefined)
      
      if (syncedCart.length !== cart.length) {
        setCart(syncedCart)
      }
    }
  }, [items, cart])

  // Load data
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [categoriesRes, itemsRes, rateRes, settingsRes, comboItemsRes, locationsRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('items').select('*').eq('is_public', true).order('created_at', { ascending: false }),
        supabase.from('exchange_rates').select('*').eq('is_active', true).single(),
        supabase.from('store_settings').select('*'),
        // Load combo items with their child items
        supabase.from('items')
          .select(`
            *,
            combo_items!combo_items_parent_item_id_fkey (
              id,
              parent_item_id,
              child_item_id,
              quantity,
              items:child_item_id (*)
            )
          `)
          .eq('is_public', true)
          .eq('is_combo', true),
        supabase.from('locations').select('*').eq('is_active', true).order('name')
      ])
      
      if (categoriesRes.error) throw categoriesRes.error
      if (itemsRes.error) throw itemsRes.error
      
      if (categoriesRes.data) setCategories(categoriesRes.data)
      // Filter out combo items from regular items list
      if (itemsRes.data) {
        const nonComboItems = itemsRes.data.filter((item: Item) => !item.is_combo)
        setItems(nonComboItems)
      }
      // Set combo items separately
      if (comboItemsRes.data) {
        setComboItems(comboItemsRes.data as ItemWithCombo[])
      }
      if (locationsRes.data) {
        setLocations(locationsRes.data)
        // Auto-select first location if none selected
        if (!selectedLocation && locationsRes.data.length > 0) {
          setSelectedLocation(locationsRes.data[0].id)
        }
      }
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
    } catch (err) {
      console.error('Error loading catalog data:', err)
      setError('Er is een fout opgetreden bij het laden van de producten. Probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Price calculation
  const getPrice = (item: Item): number => {
    if (currency === 'USD') {
      return item.selling_price_usd || (item.selling_price_srd ? item.selling_price_srd / exchangeRate : 0)
    }
    return item.selling_price_srd || (item.selling_price_usd ? item.selling_price_usd * exchangeRate : 0)
  }

  // Cart functions
  const addToCart = (item: Item | ItemWithCombo) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id)
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { item: item as Item, quantity: 1 }]
    })
  }

  const addToCartById = (itemId: string) => {
    // Check both regular items and combos
    const item = items.find(i => i.id === itemId) || comboItems.find(i => i.id === itemId)
    if (item) addToCart(item)
  }

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(c => c.item.id !== itemId))
    } else {
      setCart(prev => prev.map(c => c.item.id === itemId ? { ...c, quantity } : c))
    }
  }

  const getCartCount = () => cart.reduce((sum, c) => sum + c.quantity, 0)
  const getCartTotal = () => cart.reduce((sum, c) => sum + (getPrice(c.item) * c.quantity), 0)

  // WhatsApp order
  const sendWhatsAppOrder = () => {
    if (cart.length === 0) return
    
    let message = `Hallo ${settings.store_name}!\n\n`
    message += `Ik wil graag bestellen:\n\n`
    
    cart.forEach((c, idx) => {
      const price = getPrice(c.item)
      message += `${idx + 1}. ${c.item.name}\n`
      message += `   ${c.quantity}× ${formatCurrency(price, currency)} = ${formatCurrency(price * c.quantity, currency)}\n\n`
    })
    
    message += `━━━━━━━━━━━━━━━━━━\n`
    message += `Totaal: ${formatCurrency(getCartTotal(), currency)}\n\n`
    
    if (customerName) message += `Naam: ${customerName}\n`
    if (customerPhone) message += `Tel: ${customerPhone}\n`
    if (customerNotes) message += `Opmerking: ${customerNotes}\n`
    
    const pickupLocation = locations.find(l => l.id === selectedLocation)
    message += `\n📍 Ophaallocatie: ${pickupLocation?.name || settings.store_address}\n`
    if (pickupLocation?.address) {
      message += `   ${pickupLocation.address}\n`
    }
    
    const whatsappNumber = settings.whatsapp_number.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
    
    // Clear cart after order is sent
    setCart([])
    setCustomerNotes('')
    setShowCart(false)
    localStorage.removeItem('nextx-cart')
  }

  // Helper functions
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null
    const cat = categories.find(c => c.id === categoryId)
    return cat?.name || null
  }

  const getCartItemQuantity = (itemId: string) => {
    const cartItem = cart.find(c => c.item.id === itemId)
    return cartItem?.quantity || 0
  }

  // Get newest products (last 10)
  const newestProducts = useMemo(() => {
    return items.slice(0, 10).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image_url: item.image_url,
      price: getPrice(item),
      category_name: getCategoryName(item.category_id)
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, currency, exchangeRate, categories])

  // Get products grouped by category
  const productsByCategory = useMemo(() => {
    const grouped: { category: Category; products: Item[] }[] = []
    
    categories.forEach(cat => {
      const categoryProducts = items.filter(item => item.category_id === cat.id)
      if (categoryProducts.length > 0) {
        grouped.push({ category: cat, products: categoryProducts })
      }
    })

    // Also add uncategorized products if any
    const uncategorized = items.filter(item => !item.category_id)
    if (uncategorized.length > 0) {
      grouped.push({ 
        category: { id: 'uncategorized', name: 'Overige', created_at: '', updated_at: '' },
        products: uncategorized 
      })
    }

    return grouped
  }, [items, categories])

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesSearch
    })
  }, [items, searchQuery])

  // Filtered items when category is selected
  const filteredItems = useMemo(() => {
    if (!selectedCategory) return []
    return items.filter(item => item.category_id === selectedCategory)
  }, [items, selectedCategory])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-500">Laden...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Er ging iets mis</h2>
          <p className="text-neutral-400 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-medium transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    )
  }

  // Determine what view to show
  const showSearchResults = searchQuery.trim().length > 0
  const showCategoryProducts = selectedCategory !== '' && !showSearchResults
  const showHomepage = !showSearchResults && !showCategoryProducts

  return (
    <div className="min-h-screen bg-neutral-950 text-white antialiased">
      {/* Header */}
      <Header
        storeName={settings.store_name}
        logoUrl={settings.store_logo_url}
        whatsappNumber={settings.whatsapp_number}
        currency={currency}
        onCurrencyChange={setCurrency}
        cartCount={getCartCount()}
        onCartClick={() => setShowCart(true)}
      />

      {/* Hero Section - Only show on homepage */}
      {showHomepage && (
        <HeroSection
          storeName={settings.store_name}
          heroTitle={settings.hero_title}
          heroSubtitle={settings.hero_subtitle}
          storeAddress={settings.store_address}
          whatsappNumber={settings.whatsapp_number}
        />
      )}

      {/* Category Navigation */}
      <CategorySlider
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={(catId) => {
          setSelectedCategory(catId)
          setSearchQuery('')
        }}
      />

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Zoek producten..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Search Results View */}
      {showSearchResults && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <ProductGridHeader 
            count={searchResults.length}
            categoryName={`Zoekresultaten voor "${searchQuery}"`}
          />
          <ProductGrid 
            isEmpty={searchResults.length === 0}
            onClearFilters={() => setSearchQuery('')}
          >
            {searchResults.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                imageUrl={item.image_url}
                price={getPrice(item)}
                currency={currency}
                categoryName={getCategoryName(item.category_id)}
                quantity={getCartItemQuantity(item.id)}
                onAddToCart={() => addToCart(item)}
                onUpdateQuantity={(qty) => updateCartQuantity(item.id, qty)}
                onViewDetail={() => setSelectedItem(item)}
              />
            ))}
          </ProductGrid>
        </main>
      )}

      {/* Category Products View */}
      {showCategoryProducts && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <ProductGridHeader 
            count={filteredItems.length}
            categoryName={getCategoryName(selectedCategory)}
          />
          <ProductGrid 
            isEmpty={filteredItems.length === 0}
            onClearFilters={() => setSelectedCategory('')}
          >
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                imageUrl={item.image_url}
                price={getPrice(item)}
                currency={currency}
                categoryName={getCategoryName(item.category_id)}
                quantity={getCartItemQuantity(item.id)}
                onAddToCart={() => addToCart(item)}
                onUpdateQuantity={(qty) => updateCartQuantity(item.id, qty)}
                onViewDetail={() => setSelectedItem(item)}
              />
            ))}
          </ProductGrid>
        </main>
      )}

      {/* Homepage View - Category Sections */}
      {showHomepage && (
        <main>
          {/* Combo Deals Section */}
          {comboItems.length > 0 && (
            <section className="py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      🎁 Combo Deals
                    </h2>
                    <p className="text-neutral-400 text-sm mt-1">Bespaar meer met onze speciale combinaties</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {comboItems.map((combo) => {
                    const comboPrice = getPrice(combo)
                    // Calculate original total price of all items in combo
                    const originalPrice = combo.combo_items?.reduce((sum, ci) => {
                      if (ci.items) {
                        const itemPrice = currency === 'USD' 
                          ? (ci.items.selling_price_usd || 0) 
                          : (ci.items.selling_price_srd || 0)
                        return sum + (itemPrice * ci.quantity)
                      }
                      return sum
                    }, 0) || 0
                    const savings = originalPrice - comboPrice
                    const savingsPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0
                    
                    return (
                      <div
                        key={combo.id}
                        className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-2xl border border-orange-500/30 overflow-hidden hover:border-orange-500/50 transition-all"
                      >
                        {/* Combo Image */}
                        <div className="relative aspect-square bg-neutral-900">
                          {combo.image_url ? (
                            <img
                              src={combo.image_url}
                              alt={combo.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl">🎁</div>
                          )}
                          {savingsPercent > 0 && (
                            <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              -{savingsPercent}%
                            </div>
                          )}
                          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            COMBO
                          </div>
                        </div>
                        
                        {/* Combo Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-white text-lg mb-2">{combo.name}</h3>
                          
                          {/* Items in combo */}
                          <div className="space-y-1 mb-3">
                            {combo.combo_items?.map((ci) => (
                              <div key={ci.id} className="text-sm text-neutral-400 flex items-center gap-2">
                                <span className="text-orange-400">•</span>
                                <span>{ci.quantity}× {ci.items?.name || 'Item'}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Pricing */}
                          <div className="flex items-baseline gap-2 mb-3">
                            {originalPrice > comboPrice && (
                              <span className="text-sm text-neutral-500 line-through">
                                {formatCurrency(originalPrice, currency)}
                              </span>
                            )}
                            <span className="text-xl font-bold text-orange-500">
                              {formatCurrency(comboPrice, currency)}
                            </span>
                          </div>
                          
                          {savings > 0 && (
                            <div className="text-sm text-emerald-400 mb-3">
                              💰 Bespaar {formatCurrency(savings, currency)}
                            </div>
                          )}
                          
                          {/* Add to Cart Button */}
                          <button
                            onClick={() => addToCart(combo)}
                            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            Toevoegen aan winkelwagen
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* New Products Section */}
          {newestProducts.length > 0 && (
            <ProductCarousel
              title="Nieuwste producten"
              products={newestProducts}
              currency={currency}
              onAddToCart={addToCartById}
            />
          )}

          {/* Products by Category */}
          {productsByCategory.map(({ category, products }) => (
            <ProductCarousel
              key={category.id}
              title={category.name}
              products={products.slice(0, 10).map(item => ({
                id: item.id,
                name: item.name,
                description: item.description,
                image_url: item.image_url,
                price: getPrice(item),
                category_name: category.name
              }))}
              currency={currency}
              onAddToCart={addToCartById}
            />
          ))}
        </main>
      )}

      {/* Footer */}
      <FooterSection
        storeName={settings.store_name}
        logoUrl={settings.store_logo_url}
        storeDescription={settings.store_description}
        storeAddress={settings.store_address}
        whatsappNumber={settings.whatsapp_number}
      />

      {/* Mobile WhatsApp FAB */}
      <a
        href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-105 transition-transform"
      >
        <MessageCircle size={24} className="text-white" strokeWidth={2} />
      </a>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        items={cart.map(c => ({
          id: c.item.id,
          name: c.item.name,
          imageUrl: c.item.image_url,
          price: getPrice(c.item),
          quantity: c.quantity
        }))}
        currency={currency}
        storeName={settings.store_name}
        whatsappNumber={settings.whatsapp_number}
        storeAddress={settings.store_address}
        locations={locations}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        onUpdateQuantity={updateCartQuantity}
        onAddOne={(itemId) => {
          const cartItem = cart.find(c => c.item.id === itemId)
          if (cartItem) addToCart(cartItem.item)
        }}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        customerPhone={customerPhone}
        onCustomerPhoneChange={setCustomerPhone}
        customerNotes={customerNotes}
        onCustomerNotesChange={setCustomerNotes}
        onSubmitOrder={sendWhatsAppOrder}
      />

      {/* Product Detail Modal */}
      {selectedItem && (
        <ProductDetailModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          id={selectedItem.id}
          name={selectedItem.name}
          description={selectedItem.description}
          imageUrl={selectedItem.image_url}
          price={getPrice(selectedItem)}
          currency={currency}
          categoryName={getCategoryName(selectedItem.category_id)}
          storeAddress={settings.store_address}
          whatsappNumber={settings.whatsapp_number}
          storeName={settings.store_name}
          onAddToCart={(quantity) => {
            // Add item to cart with specified quantity
            setCart(prev => {
              const existing = prev.find(c => c.item.id === selectedItem.id)
              if (existing) {
                return prev.map(c => c.item.id === selectedItem.id ? { ...c, quantity: c.quantity + quantity } : c)
              }
              return [...prev, { item: selectedItem, quantity }]
            })
          }}
        />
      )}
    </div>
  )
}
