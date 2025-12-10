'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { ShoppingCart, Plus, Minus, Check, MapPin, Package } from 'lucide-react'
import { PageHeader, PageContainer, Button, Select, CurrencyToggle, EmptyState, LoadingSpinner } from '@/components/UI'
import { formatCurrency, type Currency } from '@/lib/currency'

type Item = Database['public']['Tables']['items']['Row']
type Location = Database['public']['Tables']['locations']['Row']
type ExchangeRate = Database['public']['Tables']['exchange_rates']['Row']
type Stock = Database['public']['Tables']['stock']['Row']

interface CartItem {
  item: Item
  quantity: number
  availableStock: number
}

export default function SalesPage() {
  const [items, setItems] = useState<Item[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [currency, setCurrency] = useState<Currency>('SRD')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('cash')
  const [currentRate, setCurrentRate] = useState<ExchangeRate | null>(null)
  const [stockMap, setStockMap] = useState<Map<string, number>>(new Map())
  const [reservationsMap, setReservationsMap] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const [itemsRes, locationsRes, ratesRes] = await Promise.all([
      supabase.from('items').select('*').order('name'),
      supabase.from('locations').select('*').order('name'),
      supabase.from('exchange_rates').select('*').eq('is_active', true).single()
    ])
    
    if (itemsRes.data) setItems(itemsRes.data)
    if (locationsRes.data) setLocations(locationsRes.data)
    if (ratesRes.data) setCurrentRate(ratesRes.data)
    setLoading(false)
  }

  const loadStock = async (locationId: string) => {
    const { data } = await supabase
      .from('stock')
      .select('*')
      .eq('location_id', locationId)
    
    if (data) {
      const map = new Map<string, number>()
      data.forEach((stock: Stock) => {
        map.set(stock.item_id, stock.quantity)
      })
      setStockMap(map)
    }
  }

  const loadReservations = async (locationId: string) => {
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .eq('location_id', locationId)
      .eq('status', 'pending')
    
    if (data) {
      const map = new Map<string, number>()
      data.forEach((reservation) => {
        const current = map.get(reservation.item_id) || 0
        map.set(reservation.item_id, current + reservation.quantity)
      })
      setReservationsMap(map)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedLocation) {
      loadStock(selectedLocation)
      loadReservations(selectedLocation)
    }
  }, [selectedLocation])

  const getAvailableStock = (itemId: string) => {
    const totalStock = stockMap.get(itemId) || 0
    const reserved = reservationsMap.get(itemId) || 0
    return totalStock - reserved
  }

  const addToCart = (item: Item) => {
    const availableStock = getAvailableStock(item.id)
    if (availableStock <= 0) return

    const existing = cart.find(c => c.item.id === item.id)
    if (existing) {
      if (existing.quantity >= availableStock) return
      setCart(cart.map(c => 
        c.item.id === item.id 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ))
    } else {
      setCart([...cart, { item, quantity: 1, availableStock }])
    }
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.item.id === itemId) {
        const newQty = c.quantity + delta
        if (newQty <= 0) return c
        if (newQty > c.availableStock) return c
        return { ...c, quantity: newQty }
      }
      return c
    }).filter(c => c.quantity > 0))
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(c => c.item.id !== itemId))
  }

  const calculateTotal = () => {
    return cart.reduce((sum, cartItem) => {
      const price = currency === 'SRD' 
        ? (cartItem.item.selling_price_srd || 0)
        : (cartItem.item.selling_price_usd || 0)
      return sum + (price * cartItem.quantity)
    }, 0)
  }

  const handleCompleteSale = async () => {
    if (!selectedLocation || cart.length === 0 || submitting) return

    setSubmitting(true)
    const total = calculateTotal()
    
    try {
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          location_id: selectedLocation,
          currency,
          exchange_rate: currentRate?.usd_to_srd || null,
          total_amount: total,
          payment_method: paymentMethod
        })
        .select()
        .single()

      if (saleError || !sale) {
        alert('Error creating sale')
        return
      }

      for (const cartItem of cart) {
        const price = currency === 'SRD'
          ? (cartItem.item.selling_price_srd || 0)
          : (cartItem.item.selling_price_usd || 0)
        
        await supabase.from('sale_items').insert({
          sale_id: sale.id,
          item_id: cartItem.item.id,
          quantity: cartItem.quantity,
          unit_price: price,
          subtotal: price * cartItem.quantity
        })

        const { data: stock } = await supabase
          .from('stock')
          .select('*')
          .eq('item_id', cartItem.item.id)
          .eq('location_id', selectedLocation)
          .single()

        if (stock) {
          await supabase
            .from('stock')
            .update({ quantity: stock.quantity - cartItem.quantity })
            .eq('id', stock.id)
        }
      }

      setCart([])
      loadStock(selectedLocation)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Sales" subtitle="Process new sales" />
        <LoadingSpinner />
      </div>
    )
  }

  const availableItems = items.filter(item => {
    const stock = getAvailableStock(item.id)
    const price = currency === 'SRD' ? item.selling_price_srd : item.selling_price_usd
    return stock > 0 && price
  })

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <PageHeader 
        title="Sales" 
        subtitle="Process new sales"
        icon={<ShoppingCart size={24} />}
      />

      <PageContainer>
        {/* Location Selection */}
        <div className="mb-6">
          <Select
            label="Select Location"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">Choose a location...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </Select>
        </div>

        {!selectedLocation ? (
          <EmptyState
            icon={MapPin}
            title="Select a Location"
            description="Choose a location to see available items and start a sale."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Item Selection */}
            <div className="lg:col-span-2 space-y-4">
              {/* Currency & Payment Toggle */}
              <div className="bg-card rounded-2xl border border-border p-4 lg:p-5">
                <div className="grid grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="input-label">Currency</label>
                    <CurrencyToggle value={currency} onChange={setCurrency} />
                  </div>
                  <div>
                    <label className="input-label">Payment Method</label>
                    <div className="currency-toggle">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`currency-toggle-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                      >
                        Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank')}
                        className={`currency-toggle-btn ${paymentMethod === 'bank' ? 'active' : ''}`}
                      >
                        Bank
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Items */}
              <div className="bg-card rounded-2xl border border-border p-4 lg:p-5">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Package size={18} className="text-primary" />
                  Available Items
                </h3>
                {availableItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-12">
                    No items available at this location
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableItems.map((item) => {
                      const stock = getAvailableStock(item.id)
                      const price = currency === 'SRD' ? item.selling_price_srd : item.selling_price_usd
                      const inCart = cart.find(c => c.item.id === item.id)
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => addToCart(item)}
                          disabled={inCart && inCart.quantity >= stock}
                          className="w-full p-3.5 bg-muted/50 hover:bg-muted rounded-xl text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group border border-transparent hover:border-primary/20"
                        >
                          <div className="flex justify-between items-center">
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{item.name}</div>
                              <div className="text-sm text-muted-foreground mt-0.5">
                                Stock: <span className="font-medium text-foreground">{stock}</span> • {formatCurrency(price || 0, currency)}
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all ml-3">
                              <Plus size={16} className="text-primary group-hover:text-white" />
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Cart */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-4 lg:p-5 sticky top-24">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <ShoppingCart size={18} className="text-primary" />
                  Cart
                  {cart.length > 0 && (
                    <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {cart.length}
                    </span>
                  )}
                </h3>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm">Cart is empty</p>
                    <p className="text-muted-foreground text-xs mt-1">Add items to get started</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-1">
                      {cart.map((cartItem) => {
                        const price = currency === 'SRD'
                          ? (cartItem.item.selling_price_srd || 0)
                          : (cartItem.item.selling_price_usd || 0)
                        
                        return (
                          <div key={cartItem.item.id} className="p-3.5 bg-muted/50 rounded-xl border border-border/50">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-foreground truncate">{cartItem.item.name}</div>
                                <div className="text-sm text-muted-foreground mt-0.5">
                                  {formatCurrency(price, currency)} × {cartItem.quantity}
                                </div>
                              </div>
                              <div className="font-bold text-foreground ml-3 text-right">
                                {formatCurrency(price * cartItem.quantity, currency)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(cartItem.item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center bg-secondary hover:bg-secondary/80 rounded-lg transition-all duration-200 active:scale-95"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center font-bold text-foreground">{cartItem.quantity}</span>
                              <button
                                onClick={() => updateQuantity(cartItem.item.id, 1)}
                                disabled={cartItem.quantity >= cartItem.availableStock}
                                className="w-8 h-8 flex items-center justify-center bg-secondary hover:bg-secondary/80 rounded-lg transition-all duration-200 disabled:opacity-50 active:scale-95"
                              >
                                <Plus size={14} />
                              </button>
                              <button
                                onClick={() => removeFromCart(cartItem.item.id)}
                                className="ml-auto text-sm text-destructive hover:text-destructive/80 font-medium transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-muted-foreground">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(calculateTotal(), currency)}
                        </span>
                      </div>
                      <Button
                        onClick={handleCompleteSale}
                        disabled={submitting || cart.length === 0}
                        loading={submitting}
                        variant="primary"
                        size="lg"
                        fullWidth
                      >
                        <Check size={20} />
                        Complete Sale
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  )
}

