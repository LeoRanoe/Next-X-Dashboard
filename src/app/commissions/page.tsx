'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { Plus, CheckCircle, Users } from 'lucide-react'
import { PageHeader, PageContainer, Button, Input, EmptyState, LoadingSpinner, Badge } from '@/components/UI'
import { Modal } from '@/components/PageCards'
import { formatCurrency } from '@/lib/currency'

type Seller = Database['public']['Tables']['sellers']['Row']
type Commission = Database['public']['Tables']['commissions']['Row']
type Sale = Database['public']['Tables']['sales']['Row']

interface CommissionWithDetails extends Commission {
  sellers?: Seller
  sales?: Sale
}

export default function CommissionsPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [commissions, setCommissions] = useState<CommissionWithDetails[]>([])
  const [showSellerForm, setShowSellerForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sellerForm, setSellerForm] = useState({
    name: '',
    commission_rate: ''
  })

  const loadData = async () => {
    setLoading(true)
    const [sellersRes, commissionsRes] = await Promise.all([
      supabase.from('sellers').select('*').order('name'),
      supabase.from('commissions').select('*, sellers(*), sales(*)').order('created_at', { ascending: false })
    ])
    
    if (sellersRes.data) setSellers(sellersRes.data)
    if (commissionsRes.data) setCommissions(commissionsRes.data as CommissionWithDetails[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await supabase.from('sellers').insert({
        name: sellerForm.name,
        commission_rate: parseFloat(sellerForm.commission_rate)
      })
      setSellerForm({ name: '', commission_rate: '' })
      setShowSellerForm(false)
      loadData()
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkPaid = async (commissionId: string) => {
    await supabase
      .from('commissions')
      .update({ paid: true })
      .eq('id', commissionId)
    loadData()
  }

  const getTotalCommission = (sellerId: string, paid: boolean) => {
    return commissions
      .filter(c => c.seller_id === sellerId && c.paid === paid)
      .reduce((sum, c) => sum + c.commission_amount, 0)
  }

  const getTotalSales = (sellerId: string) => {
    return commissions
      .filter(c => c.seller_id === sellerId)
      .length
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Commissions" subtitle="Track sales commissions and payouts" />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <PageHeader 
        title="Commissions" 
        subtitle="Track sales commissions and payouts"
        icon={<Users size={24} />}
        action={
          <Button onClick={() => setShowSellerForm(true)} variant="primary">
            <Plus size={20} />
            <span className="hidden sm:inline">New Seller</span>
          </Button>
        }
      />

      <PageContainer>
        <div className="space-y-6">
          {/* Sellers Section */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Sellers
            </h2>
            {sellers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No sellers yet"
                description="Add sellers to track their commissions."
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sellers.map((seller) => {
                  const unpaid = getTotalCommission(seller.id, false)
                  const paid = getTotalCommission(seller.id, true)
                  const totalSales = getTotalSales(seller.id)

                  return (
                    <div key={seller.id} className="bg-card p-4 lg:p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{seller.name}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span className="font-medium text-foreground">{seller.commission_rate}%</span> rate
                            </span>
                            <span>•</span>
                            <span><span className="font-medium text-foreground">{totalSales}</span> sales</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[hsl(var(--warning-muted))] p-3.5 rounded-xl border border-[hsl(var(--warning))]/20">
                          <div className="text-xs text-muted-foreground mb-1 font-medium">Unpaid</div>
                          <div className="text-lg font-bold text-[hsl(var(--warning))]">
                            {formatCurrency(unpaid, 'USD')}
                          </div>
                        </div>
                        <div className="bg-[hsl(var(--success-muted))] p-3.5 rounded-xl border border-[hsl(var(--success))]/20">
                          <div className="text-xs text-muted-foreground mb-1 font-medium">Paid</div>
                          <div className="text-lg font-bold text-[hsl(var(--success))]">
                            {formatCurrency(paid, 'USD')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Commission History */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-primary" />
              Commission History
            </h2>
            {commissions.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No commissions yet"
                description="Commissions will appear here when sales are made."
              />
            ) : (
              <div className="space-y-3">
                {commissions.map((commission) => (
                  <div key={commission.id} className="bg-card p-4 lg:p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">{commission.sellers?.name}</div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>Sale: <span className="font-medium text-foreground">{formatCurrency(commission.sales?.total_amount || 0, 'USD')}</span></span>
                          <span>•</span>
                          <span>{new Date(commission.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-[hsl(var(--success))] mb-2">
                          {formatCurrency(commission.commission_amount, 'USD')}
                        </div>
                        {commission.paid ? (
                          <Badge variant="success">
                            <CheckCircle size={14} />
                            Paid
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => handleMarkPaid(commission.id)}
                            variant="primary"
                            size="sm"
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      {/* Create Seller Modal */}
      <Modal isOpen={showSellerForm} onClose={() => setShowSellerForm(false)} title="New Seller">
        <form onSubmit={handleCreateSeller} className="space-y-4">
          <Input
            label="Seller Name"
            type="text"
            value={sellerForm.name}
            onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })}
            placeholder="Enter seller name"
            required
          />
          <Input
            label="Commission Rate (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={sellerForm.commission_rate}
            onChange={(e) => setSellerForm({ ...sellerForm, commission_rate: e.target.value })}
            placeholder="e.g., 10"
            suffix="%"
            required
          />
          <div className="flex gap-3">
            <Button type="submit" variant="primary" fullWidth loading={submitting}>
              Create Seller
            </Button>
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowSellerForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

