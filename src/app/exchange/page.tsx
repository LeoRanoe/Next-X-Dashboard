'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { DollarSign, TrendingUp, ArrowRightLeft, History, RefreshCw } from 'lucide-react'

type ExchangeRate = Database['public']['Tables']['exchange_rates']['Row']

export default function ExchangeRatePage() {
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [currentRate, setCurrentRate] = useState<ExchangeRate | null>(null)
  const [newRate, setNewRate] = useState('')
  const [usdAmount, setUsdAmount] = useState('')
  const [srdAmount, setSrdAmount] = useState('')

  useEffect(() => {
    loadRates()
  }, [])

  const loadRates = async () => {
    const { data } = await supabase
      .from('exchange_rates')
      .select('*')
      .order('set_at', { ascending: false })
    
    if (data) {
      setRates(data)
      const active = data.find(r => r.is_active)
      setCurrentRate(active || null)
    }
  }

  const handleSetRate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await supabase
      .from('exchange_rates')
      .update({ is_active: false })
      .eq('is_active', true)

    await supabase.from('exchange_rates').insert({
      usd_to_srd: parseFloat(newRate),
      is_active: true
    })

    setNewRate('')
    loadRates()
  }

  const convertUsdToSrd = (usd: number) => {
    if (!currentRate) return 0
    return usd * currentRate.usd_to_srd
  }

  const convertSrdToUsd = (srd: number) => {
    if (!currentRate) return 0
    return srd / currentRate.usd_to_srd
  }

  const handleUsdChange = (value: string) => {
    setUsdAmount(value)
    const result = convertUsdToSrd(parseFloat(value) || 0)
    setSrdAmount(result.toFixed(2))
  }

  const handleSrdChange = (value: string) => {
    setSrdAmount(value)
    const result = convertSrdToUsd(parseFloat(value) || 0)
    setUsdAmount(result.toFixed(2))
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] px-4 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[hsl(var(--foreground))]">Exchange Rate</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Manage currency exchange rates</p>
            </div>
            <button 
              onClick={loadRates}
              className="lg:flex hidden items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        {/* Current Rate Card */}
        {currentRate && (
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 lg:p-8 rounded-2xl shadow-xl mb-6 lg:mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-orange-100 text-sm">Current Exchange Rate</p>
                  <p className="text-xs text-orange-200 mt-1">
                    Updated {new Date(currentRate.set_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Active</span>
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl lg:text-6xl font-bold">1</span>
              <span className="text-2xl lg:text-3xl font-semibold">USD</span>
              <span className="text-2xl lg:text-3xl mx-2">=</span>
              <span className="text-5xl lg:text-6xl font-bold">{currentRate.usd_to_srd}</span>
              <span className="text-2xl lg:text-3xl font-semibold">SRD</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Set New Rate */}
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">Set New Rate</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Update exchange rate</p>
              </div>
            </div>
            <form onSubmit={handleSetRate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
                  Exchange Rate (1 USD equals)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    placeholder="0.0000"
                    className="w-full px-4 py-3 bg-[hsl(var(--input))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded-xl text-lg font-semibold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] font-medium">
                    SRD
                  </span>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
              >
                Update Rate
              </button>
            </form>
          </div>

          {/* Quick Converter */}
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <ArrowRightLeft size={20} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">Quick Converter</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Convert currencies instantly</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">USD Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={usdAmount}
                    onChange={(e) => handleUsdChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-[hsl(var(--input))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded-xl text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] font-medium">
                    $
                  </span>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-[hsl(var(--muted))] rounded-full flex items-center justify-center">
                  <ArrowRightLeft size={18} className="text-[hsl(var(--muted-foreground))]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">SRD Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={srdAmount}
                    onChange={(e) => handleSrdChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-[hsl(var(--input))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded-xl text-lg font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    SRD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rate History */}
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-[hsl(var(--border))] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <History size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">Rate History</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Previous exchange rates</p>
            </div>
          </div>
          <div className="space-y-3">
            {rates.length > 0 ? (
              rates.map((rate) => (
                <div
                  key={rate.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    rate.is_active 
                      ? 'border-orange-500 bg-orange-500/10' 
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-[hsl(var(--foreground))]">
                          1 USD = {rate.usd_to_srd} SRD
                        </span>
                        {rate.is_active && (
                          <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(rate.set_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign size={48} className="mx-auto mb-2 opacity-50" />
                <p>No rate history available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
