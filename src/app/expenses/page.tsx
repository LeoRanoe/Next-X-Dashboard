'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { Plus, Tag, Receipt } from 'lucide-react'
import { PageHeader, PageContainer, Button, Input, Select, Textarea, EmptyState, LoadingSpinner, StatBox, Badge } from '@/components/UI'
import { Modal } from '@/components/PageCards'
import { formatCurrency, type Currency } from '@/lib/currency'

type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']
type Expense = Database['public']['Tables']['expenses']['Row']
type Wallet = Database['public']['Tables']['wallets']['Row']

interface ExpenseWithDetails extends Expense {
  expense_categories?: ExpenseCategory | null
  wallets?: Wallet
}

export default function ExpensesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [expenseForm, setExpenseForm] = useState({
    category_id: '',
    wallet_id: '',
    amount: '',
    currency: 'SRD' as Currency,
    description: ''
  })

  const loadData = async () => {
    setLoading(true)
    const [categoriesRes, expensesRes, walletsRes] = await Promise.all([
      supabase.from('expense_categories').select('*').order('name'),
      supabase.from('expenses').select('*, expense_categories(*), wallets(*)').order('created_at', { ascending: false }),
      supabase.from('wallets').select('*').order('person_name')
    ])
    
    if (categoriesRes.data) setCategories(categoriesRes.data)
    if (expensesRes.data) setExpenses(expensesRes.data as ExpenseWithDetails[])
    if (walletsRes.data) setWallets(walletsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await supabase.from('expense_categories').insert({ name: categoryName })
      setCategoryName('')
      setShowCategoryForm(false)
      loadData()
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    
    const amount = parseFloat(expenseForm.amount)
    const wallet = wallets.find(w => w.id === expenseForm.wallet_id)
    
    if (!wallet) {
      alert('Select a wallet')
      return
    }

    if (wallet.balance < amount) {
      alert('Insufficient balance')
      return
    }

    setSubmitting(true)
    try {
      await supabase.from('expenses').insert({
        category_id: expenseForm.category_id || null,
        wallet_id: expenseForm.wallet_id,
        amount,
        currency: expenseForm.currency,
        description: expenseForm.description || null
      })

      await supabase
        .from('wallets')
        .update({ balance: wallet.balance - amount })
        .eq('id', wallet.id)

      setExpenseForm({ category_id: '', wallet_id: '', amount: '', currency: 'SRD', description: '' })
      setShowExpenseForm(false)
      loadData()
    } finally {
      setSubmitting(false)
    }
  }

  const getTotalExpenses = (currency: Currency) => {
    return expenses
      .filter(e => e.currency === currency)
      .reduce((sum, e) => sum + e.amount, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Expenses" subtitle="Track business expenses and categories" />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <PageHeader 
        title="Expenses" 
        subtitle="Track business expenses and categories"
        icon={<Receipt size={24} />}
        action={
          <Button onClick={() => setShowExpenseForm(true)} variant="primary">
            <Plus size={20} />
            <span className="hidden sm:inline">New Expense</span>
          </Button>
        }
      />

      <PageContainer>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatBox 
            label="Total SRD" 
            value={formatCurrency(getTotalExpenses('SRD'), 'SRD')} 
            icon={<Receipt size={20} />}
          />
          <StatBox 
            label="Total USD" 
            value={formatCurrency(getTotalExpenses('USD'), 'USD')} 
            icon={<Receipt size={20} />}
          />
        </div>

        {/* Categories */}
        <div className="bg-card rounded-2xl border border-border p-4 lg:p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <Tag size={18} className="text-primary" />
              Categories
            </h2>
            <Button onClick={() => setShowCategoryForm(true)} variant="secondary" size="sm">
              <Plus size={16} />
              Add
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center w-full">No categories yet</p>
            ) : (
              categories.map((category) => (
                <Badge key={category.id} variant="default">
                  {category.name}
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div>
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Receipt size={18} className="text-primary" />
            Recent Expenses
          </h2>
          {expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Record your first expense to start tracking."
            />
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="bg-card p-4 lg:p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {expense.expense_categories?.name || 'Uncategorized'}
                      </div>
                      {expense.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">{expense.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-sm">{expense.wallets?.type === 'cash' ? '💵' : '🏦'}</span>
                          {expense.wallets?.person_name}
                        </span>
                        <span>•</span>
                        <span>{new Date(expense.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-destructive ml-4">
                      -{formatCurrency(expense.amount, expense.currency as Currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>

      {/* Create Category Modal */}
      <Modal isOpen={showCategoryForm} onClose={() => setShowCategoryForm(false)} title="New Category">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Name"
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
            required
          />
          <div className="flex gap-3">
            <Button type="submit" variant="primary" fullWidth loading={submitting}>
              Create
            </Button>
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowCategoryForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Expense Modal */}
      <Modal isOpen={showExpenseForm} onClose={() => setShowExpenseForm(false)} title="Record Expense">
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <Select
            label="Category"
            value={expenseForm.category_id}
            onChange={(e) => setExpenseForm({ ...expenseForm, category_id: e.target.value })}
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>
          <Select
            label="Wallet"
            value={expenseForm.wallet_id}
            onChange={(e) => {
              const wallet = wallets.find(w => w.id === e.target.value)
              setExpenseForm({ 
                ...expenseForm, 
                wallet_id: e.target.value,
                currency: (wallet?.currency as Currency) || 'SRD'
              })
            }}
            required
          >
            <option value="">Select Wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.person_name} - {wallet.type} ({formatCurrency(wallet.balance, wallet.currency as Currency)})
              </option>
            ))}
          </Select>
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            placeholder="0.00"
            required
          />
          <Textarea
            label="Description"
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            placeholder="Optional description"
            rows={2}
          />
          <div className="flex gap-3">
            <Button type="submit" variant="danger" fullWidth loading={submitting}>
              Record Expense
            </Button>
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowExpenseForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

