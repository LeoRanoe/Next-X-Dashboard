'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { Plus, Target, TrendingUp, Calendar, Wallet } from 'lucide-react'
import { PageHeader, Button, Badge } from '@/components/UI'

type BudgetCategory = Database['public']['Tables']['budget_categories']['Row']
type Budget = Database['public']['Tables']['budgets']['Row']
type Goal = Database['public']['Tables']['goals']['Row']

interface BudgetWithCategory extends Budget {
  budget_categories?: BudgetCategory
}

type TabType = 'budgets' | 'goals' | 'categories'

export default function BudgetsGoalsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('budgets')
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([])
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [showBudgetCategoryForm, setShowBudgetCategoryForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [budgetCategoryForm, setBudgetCategoryForm] = useState({
    name: '',
    type: 'custom' as 'marketing' | 'trips' | 'orders' | 'custom'
  })
  const [budgetForm, setBudgetForm] = useState({
    category_id: '',
    amount_allowed: '',
    period: 'monthly' as 'monthly' | 'yearly' | 'custom',
    start_date: '',
    end_date: ''
  })
  const [goalForm, setGoalForm] = useState({
    name: '',
    target_amount: '',
    deadline: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [categoriesRes, budgetsRes, goalsRes] = await Promise.all([
      supabase.from('budget_categories').select('*').order('name'),
      supabase.from('budgets').select('*, budget_categories(*)').order('created_at', { ascending: false }),
      supabase.from('goals').select('*').order('created_at', { ascending: false })
    ])
    
    if (categoriesRes.data) setBudgetCategories(categoriesRes.data)
    if (budgetsRes.data) setBudgets(budgetsRes.data as any)
    if (goalsRes.data) setGoals(goalsRes.data)
  }

  const handleCreateBudgetCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('budget_categories').insert({
      name: budgetCategoryForm.name,
      type: budgetCategoryForm.type
    })
    setBudgetCategoryForm({ name: '', type: 'custom' })
    setShowBudgetCategoryForm(false)
    loadData()
  }

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('budgets').insert({
      category_id: budgetForm.category_id,
      amount_allowed: parseFloat(budgetForm.amount_allowed),
      amount_spent: 0,
      period: budgetForm.period,
      start_date: budgetForm.start_date,
      end_date: budgetForm.end_date || null
    })
    setBudgetForm({ category_id: '', amount_allowed: '', period: 'monthly', start_date: '', end_date: '' })
    setShowBudgetForm(false)
    loadData()
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('goals').insert({
      name: goalForm.name,
      target_amount: parseFloat(goalForm.target_amount),
      current_amount: 0,
      deadline: goalForm.deadline || null
    })
    setGoalForm({ name: '', target_amount: '', deadline: '' })
    setShowGoalForm(false)
    loadData()
  }

  const handleUpdateGoalProgress = async (goalId: string, currentAmount: number) => {
    const amount = prompt('Add amount to goal:')
    if (!amount) return
    
    const newAmount = currentAmount + parseFloat(amount)
    await supabase
      .from('goals')
      .update({ current_amount: newAmount })
      .eq('id', goalId)
    loadData()
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getTotalBudget = () => {
    return budgets.reduce((sum, b) => sum + b.amount_allowed, 0)
  }

  const getTotalSpent = () => {
    return budgets.reduce((sum, b) => sum + b.amount_spent, 0)
  }

  const getTotalGoalProgress = () => {
    if (goals.length === 0) return 0
    const totalProgress = goals.reduce((sum, g) => {
      return sum + getProgressPercentage(g.current_amount, g.target_amount)
    }, 0)
    return totalProgress / goals.length
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <PageHeader 
        title="Budgets & Goals" 
        subtitle="Track spending and financial objectives"
        icon={<Wallet className="w-6 h-6" />}
      />

      {/* Stats Overview */}
      <div className="px-4 lg:px-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card-premium group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-caption text-gray-600 mb-1">Total Budget</p>
                <p className="text-3xl lg:text-4xl font-bold tracking-tight">${getTotalBudget().toFixed(2)}</p>
                <p className="text-caption text-gray-500 mt-1">Across all categories</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-sm">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card-premium group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-caption text-gray-600 mb-1">Total Spent</p>
                <p className="text-3xl lg:text-4xl font-bold tracking-tight">${getTotalSpent().toFixed(2)}</p>
                <p className="text-caption text-gray-500 mt-1">This period</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="card-premium group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-caption text-gray-600 mb-1">Goal Progress</p>
                <p className="text-3xl lg:text-4xl font-bold tracking-tight">{getTotalGoalProgress().toFixed(0)}%</p>
                <p className="text-caption text-gray-500 mt-1">Average completion</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 flex items-center justify-center shadow-sm">
                <Target className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-white rounded-xl shadow-sm border border-gray-200/60">
          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
              activeTab === 'budgets'
                ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp size={18} />
              <span>Budgets</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
              activeTab === 'goals'
                ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Target size={18} />
              <span>Goals</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar size={18} />
              <span>Categories</span>
            </div>
          </button>
        </div>
      </div>

      <div className="px-4 lg:px-6 space-y-6">
        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-headline font-semibold tracking-tight">Budget Categories</h2>
            <Button onClick={() => setShowBudgetCategoryForm(true)} className="!px-4">
              <Plus size={18} />
              <span>Add Category</span>
            </Button>
          </div>

          {showBudgetCategoryForm && (
            <form onSubmit={handleCreateBudgetCategory} className="card-premium mb-4">
              <input
                type="text"
                value={budgetCategoryForm.name}
                onChange={(e) => setBudgetCategoryForm({ ...budgetCategoryForm, name: e.target.value })}
                placeholder="Category name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3 text-body focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
              <select
                value={budgetCategoryForm.type}
                onChange={(e) => setBudgetCategoryForm({ ...budgetCategoryForm, type: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 text-body focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="marketing">Marketing</option>
                <option value="trips">Trips</option>
                <option value="orders">Orders</option>
                <option value="custom">Custom</option>
              </select>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">Save Category</Button>
                <button
                  type="button"
                  onClick={() => setShowBudgetCategoryForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetCategories.map((category) => (
              <div key={category.id} className="card-premium group hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-title font-semibold tracking-tight">{category.name}</h3>
                    <Badge variant={category.type === 'custom' ? 'default' : 'orange'} className="mt-2">
                      {category.type}
                    </Badge>
                  </div>
                  <Calendar className="w-8 h-8 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-headline font-semibold tracking-tight">Active Budgets</h2>
            <Button onClick={() => setShowBudgetForm(true)} className="!px-4">
              <Plus size={18} />
              <span>Add Budget</span>
            </Button>
          </div>

          {showBudgetForm && (
            <form onSubmit={handleCreateBudget} className="card-premium mb-4">
              <select
                value={budgetForm.category_id}
                onChange={(e) => setBudgetForm({ ...budgetForm, category_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3 text-body focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select Category</option>
                {budgetCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                value={budgetForm.amount_allowed}
                onChange={(e) => setBudgetForm({ ...budgetForm, amount_allowed: e.target.value })}
                placeholder="Budget amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3 text-body focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
              <select
                value={budgetForm.period}
                onChange={(e) => setBudgetForm({ ...budgetForm, period: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3 text-body focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
              <input
                type="date"
                value={budgetForm.start_date}
                onChange={(e) => setBudgetForm({ ...budgetForm, start_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3 text-body focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="date"
                value={budgetForm.end_date}
                onChange={(e) => setBudgetForm({ ...budgetForm, end_date: e.target.value })}
                placeholder="End date (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3 text-body focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">Create Budget</Button>
                <button
                  type="button"
                  onClick={() => setShowBudgetForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {budgets.map((budget) => {
              const percentage = getProgressPercentage(budget.amount_spent, budget.amount_allowed)
              const isOverBudget = budget.amount_spent > budget.amount_allowed

              return (
                <div key={budget.id} className="card-premium group hover:shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-title font-semibold tracking-tight mb-1">{budget.budget_categories?.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={budget.period === 'monthly' ? 'orange' : 'default'}>
                          {budget.period}
                        </Badge>
                        <span className="text-caption text-gray-500">
                          {new Date(budget.start_date).toLocaleDateString()}
                          {budget.end_date && ` - ${new Date(budget.end_date).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold tracking-tight ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                        ${budget.amount_spent.toFixed(2)}
                      </div>
                      <div className="text-caption text-gray-500">of ${budget.amount_allowed.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar with Glass Effect */}
                  <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                        isOverBudget 
                          ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 shadow-lg shadow-red-500/30' 
                          : percentage > 80 
                            ? 'bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 shadow-lg shadow-yellow-500/30'
                            : 'bg-gradient-to-r from-green-500 via-green-600 to-green-700 shadow-lg shadow-green-500/30'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20"></div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-caption text-gray-600">{percentage.toFixed(1)}% used</span>
                    {isOverBudget && (
                      <Badge variant="danger">Over Budget</Badge>
                    )}
                    {!isOverBudget && percentage > 80 && (
                      <Badge variant="warning">Warning</Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-headline font-semibold tracking-tight">Financial Goals</h2>
            <Button onClick={() => setShowGoalForm(true)} className="!px-4">
              <Plus size={18} />
              <span>Add Goal</span>
            </Button>
          </div>

          {showGoalForm && (
            <form onSubmit={handleCreateGoal} className="card-premium mb-4">
              <input
                type="text"
                value={goalForm.name}
                onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                placeholder="Goal name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3 text-body focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="number"
                step="0.01"
                value={goalForm.target_amount}
                onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
                placeholder="Target amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3 text-body focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="date"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 text-body focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              <div className="flex gap-3">
                <Button type="submit" className="flex-1">Create Goal</Button>
                <button
                  type="button"
                  onClick={() => setShowGoalForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {goals.map((goal) => {
              const percentage = getProgressPercentage(goal.current_amount, goal.target_amount)
              const isComplete = goal.current_amount >= goal.target_amount

              return (
                <div
                  key={goal.id}
                  onClick={() => handleUpdateGoalProgress(goal.id, goal.current_amount)}
                  className="card-premium group hover:shadow-xl cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-title font-semibold tracking-tight">{goal.name}</h3>
                        {isComplete && <Badge variant="success">Complete</Badge>}
                      </div>
                      {goal.deadline && (
                        <p className="text-caption text-gray-600">
                          Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold tracking-tight ${isComplete ? 'text-green-600' : 'text-gray-900'}`}>
                        ${goal.current_amount.toFixed(2)}
                      </div>
                      <div className="text-caption text-gray-500">of ${goal.target_amount.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar with Glass Effect */}
                  <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                        isComplete 
                          ? 'bg-gradient-to-r from-green-500 via-green-600 to-green-700 shadow-lg shadow-green-500/30'
                          : 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 shadow-lg shadow-orange-500/30'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20"></div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-caption text-gray-600">{percentage.toFixed(1)}% complete</span>
                    <span className="text-caption text-gray-500">Click to add progress</span>
                  </div>
                </div>
              )
            })}
          </div>
          </div>
        )}
      </div>
    </div>
  )
}
