// Currency formatting utilities for SRD & USD
export type Currency = 'SRD' | 'USD'

export const CURRENCY_CONFIG = {
  SRD: {
    symbol: 'SRD',
    code: 'SRD',
    locale: 'en-SR',
    decimals: 2,
    position: 'after' as const,
  },
  USD: {
    symbol: '$',
    code: 'USD',
    locale: 'en-US',
    decimals: 2,
    position: 'before' as const,
  },
}

/**
 * Format a number as currency with proper symbol placement
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const config = CURRENCY_CONFIG[currency]
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(Math.abs(amount))

  const sign = amount < 0 ? '-' : ''
  
  if (currency === 'USD') {
    return `${sign}$${formattedNumber}`
  }
  return `${sign}${formattedNumber} SRD`
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Parse a currency string to number
 */
export function parseCurrencyInput(value: string): number {
  // Remove currency symbols and thousand separators
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return currency === 'USD' ? '$' : 'SRD'
}

/**
 * Validate currency amount
 */
export function isValidCurrencyAmount(value: string): boolean {
  const num = parseCurrencyInput(value)
  return !isNaN(num) && num >= 0
}
