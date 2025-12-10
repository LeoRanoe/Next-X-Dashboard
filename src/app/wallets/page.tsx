'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { Wallet, Plus, DollarSign } from 'lucide-react'
import { PageHeader, PageContainer, Button, Input, Select, EmptyState, LoadingSpinner, StatBox } from '@/components/UI'
import { WalletCard, Modal } from '@/components/PageCards'
import { formatCurrency, type Currency } from '@/lib/currency'

type WalletType = Database['public']['Tables']['wallets']['Row']

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [walletForm, setWalletForm] = useState({
    person_name: '',
    type: 'cash' as 'cash' | 'bank',
    currency: 'SRD' as Currency,
    balance: ''
  })
  const [transactionForm, setTransactionForm] = useState({
    type: 'add' as 'add' | 'remove',
    amount: ''
  })

  const loadWallets = async () => {
    setLoading(true)
    const { data } = await supabase.from('wallets').select('*').order('person_name')
    if (data) setWallets(data)
    setLoading(false)
  }

  useEffect(() => {
    loadWallets()
  }, [])

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await supabase.from('wallets').insert({
        person_name: walletForm.person_name,
        type: walletForm.type,
        currency: walletForm.currency,
        balance: parseFloat(walletForm.balance) || 0
      })
      setWalletForm({ person_name: '', type: 'cash', currency: 'SRD', balance: '' })
      setShowForm(false)
      loadWallets()
    } finally {
      setSubmitting(false)
    }
  }

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWallet || submitting) return
    
    setSubmitting(true)
    try {
      const amount = parseFloat(transactionForm.amount)
      const newBalance = transactionForm.type === 'add'
        ? selectedWallet.balance + amount
        : selectedWallet.balance - amount

      await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', selectedWallet.id)

      setTransactionForm({ type: 'add', amount: '' })
      setShowTransactionForm(false)
      setSelectedWallet(null)
      loadWallets()
    } finally {
      setSubmitting(false)
    }
  }

  const getTotalByType = (type: 'cash' | 'bank', currency: Currency) => {
    return wallets
      .filter(w => w.type === type && w.currency === currency)
      .reduce((sum, w) => sum + w.balance, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Wallets" subtitle="Manage cash and bank balances" />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <PageHeader 
        title="Wallets" 
        subtitle="Manage cash and bank balances"
        icon={<Wallet size={24} />}
        action={
          <Button onClick={() => setShowForm(true)} variant="primary">
            <Plus size={20} />
            <span className="hidden sm:inline">New Wallet</span>
          </Button>
        }
      />

      <PageContainer>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatBox 
            label="Cash SRD" 
            value={formatCurrency(getTotalByType('cash', 'SRD'), 'SRD')} 
            icon={<DollarSign size={20} />}
          />
          <StatBox 
            label="Cash USD" 
            value={formatCurrency(getTotalByType('cash', 'USD'), 'USD')} 
            icon={<DollarSign size={20} />}
          />
          <StatBox 
            label="Bank SRD" 
            value={formatCurrency(getTotalByType('bank', 'SRD'), 'SRD')} 
            icon={<DollarSign size={20} />}
          />
          <StatBox 
            label="Bank USD" 
            value={formatCurrency(getTotalByType('bank', 'USD'), 'USD')} 
            icon={<DollarSign size={20} />}
          />
        </div>

        {/* Wallet List */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Wallet size={18} className="text-primary" />
            All Wallets
          </h2>
          {wallets.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No wallets yet"
              description="Create your first wallet to get started!"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {wallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  personName={wallet.person_name}
                  type={wallet.type as 'cash' | 'bank'}
                  currency={wallet.currency as Currency}
                  balance={wallet.balance}
                  onClick={() => {
                    setSelectedWallet(wallet)
                    setShowTransactionForm(true)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </PageContainer>

      {/* Create Wallet Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create New Wallet">
        <form onSubmit={handleCreateWallet} className="space-y-4">
          <Input
            label="Person Name"
            type="text"
            value={walletForm.person_name}
            onChange={(e) => setWalletForm({ ...walletForm, person_name: e.target.value })}
            placeholder="Enter person name"
            required
          />
          <Select
            label="Type"
            value={walletForm.type}
            onChange={(e) => setWalletForm({ ...walletForm, type: e.target.value as 'cash' | 'bank' })}
          >
            <option value="cash">💵 Cash</option>
            <option value="bank">🏦 Bank</option>
          </Select>
          <Select
            label="Currency"
            value={walletForm.currency}
            onChange={(e) => setWalletForm({ ...walletForm, currency: e.target.value as Currency })}
          >
            <option value="SRD">SRD (Suriname Dollar)</option>
            <option value="USD">USD (US Dollar)</option>
          </Select>
          <Input
            label="Initial Balance"
            type="number"
            step="0.01"
            value={walletForm.balance}
            onChange={(e) => setWalletForm({ ...walletForm, balance: e.target.value })}
            placeholder="0.00"
          />
          <div className="flex gap-3">
            <Button type="submit" variant="primary" fullWidth loading={submitting}>
              Create Wallet
            </Button>
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Transaction Modal */}
      <Modal 
        isOpen={showTransactionForm && !!selectedWallet} 
        onClose={() => {
          setShowTransactionForm(false)
          setSelectedWallet(null)
        }} 
        title={selectedWallet ? `Transaction: ${selectedWallet.person_name}` : 'Transaction'}
      >
        {selectedWallet && (
          <form onSubmit={handleTransaction} className="space-y-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-5 rounded-xl border border-primary/20">
              <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(selectedWallet.balance, selectedWallet.currency as Currency)}
              </div>
              <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <span className="text-base">{selectedWallet.type === 'cash' ? '💵' : '🏦'}</span>
                <span className="font-medium">{selectedWallet.type === 'cash' ? 'Cash' : 'Bank'}</span>
                <span>•</span>
                <span>{selectedWallet.currency}</span>
              </div>
            </div>
            <div>
              <label className="input-label">Transaction Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTransactionForm({ ...transactionForm, type: 'add' })}
                  className={`py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 active:scale-98 ${
                    transactionForm.type === 'add'
                      ? 'bg-[hsl(var(--success))] text-white shadow-lg shadow-[hsl(var(--success))]/25'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  ➕ Add Money
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionForm({ ...transactionForm, type: 'remove' })}
                  className={`py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 active:scale-98 ${
                    transactionForm.type === 'remove'
                      ? 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  ➖ Remove Money
                </button>
              </div>
            </div>
            <Input
              label="Amount"
              type="number"
              step="0.01"
              value={transactionForm.amount}
              onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
              placeholder="0.00"
              required
            />
            <Button
              type="submit"
              variant={transactionForm.type === 'add' ? 'primary' : 'danger'}
              fullWidth
              size="lg"
              loading={submitting}
            >
              {transactionForm.type === 'add' ? '✓ Confirm Add' : '✓ Confirm Remove'}
            </Button>
          </form>
        )}
      </Modal>

    </div>
  )
}

