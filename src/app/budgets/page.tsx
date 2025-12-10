'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { Plus, Target, TrendingUp, Calendar, Wallet } from 'lucide-react'
import { PageHeader, PageContainer, Button, Badge, Input, Select, StatBox, LoadingSpinner, EmptyState } from '@/components/UI'
import { Modal } from '@/components/PageCards'

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
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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

  const loadData = async () => {
    try {
      setLoading(true)
      const [categoriesRes, budgetsRes, goalsRes] = await Promise.all([
        supabase.from('budget_categories').select('*').order('name'),
        supabase.from('budgets').select('*, budget_categories(*)').order('created_at', { ascending: false }),
        supabase.from('goals').select('*').order('created_at', { ascending: false })
      ])
      
      if (categoriesRes.data) setBudgetCategories(categoriesRes.data)
      if (budgetsRes.data) setBudgets(budgetsRes.data as BudgetWithCategory[])
      if (goalsRes.data) setGoals(goalsRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateBudgetCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await supabase.from('budget_categories').insert({
        name: budgetCategoryForm.name,
        type: budgetCategoryForm.type
      })
      setBudgetCategoryForm({ name: '', type: 'custom' })
      setShowBudgetCategoryForm(false)
      loadData()
    } catch (error) {
      console.error('Error creating category:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
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
    } catch (error) {
      console.error('Error creating budget:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await supabase.from('goals').insert({
        name: goalForm.name,
        target_amount: parseFloat(goalForm.target_amount),
        current_amount: 0,
        deadline: goalForm.deadline || null
      })
      setGoalForm({ name: '', target_amount: '', deadline: '' })
      setShowGoalForm(false)
      loadData()
    } catch (error) {
      console.error('Error creating goal:', error)
    } finally {
      setSubmitting(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader 
        title="Budgets & Goals" 
        subtitle="Track spending and financial objectives"
        icon={<Wallet className="w-6 h-6" />}
      />

      <PageContainer>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatBox
            label="Total Budget"
            value={`${getTotalBudget().toFixed(2)} SRD`}
            icon={<Wallet size={24} />}
          />
          <StatBox
            label="Total Spent"
            value={`${getTotalSpent().toFixed(2)} SRD`}
            icon={<TrendingUp size={24} />}
            variant="warning"
          />
          <StatBox
            label="Goal Progress"
            value={`${getTotalGoalProgress().toFixed(0)}%`}
            icon={<Target size={24} />}
            variant="success"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1.5 bg-card rounded-2xl border border-border">
          {[
            { id: 'budgets', label: 'Budgets', icon: TrendingUp },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'categories', label: 'Categories', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Budget Categories
              </h2>
              <Button onClick={() => setShowBudgetCategoryForm(true)} variant="primary" size="sm">
                <Plus size={18} />
                Add Category
              </Button>
            </div>

            {budgetCategories.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No categories yet"
                description="Create budget categories to organize your spending."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgetCategories.map((category) => (
                  <div key={category.id} className="bg-card p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                        <Badge variant={category.type === 'custom' ? 'default' : 'orange'} className="mt-2">
                          {category.type}
                        </Badge>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                Active Budgets
              </h2>
              <Button onClick={() => setShowBudgetForm(true)} variant="primary" size="sm">
                <Plus size={18} />
                Add Budget
              </Button>
            </div>

            {budgets.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No budgets yet"
                description="Create a budget to start tracking your spending."
              />
            ) : (
              <div className="space-y-4">
                {budgets.map((budget) => {
                  const percentage = getProgressPercentage(budget.amount_spent, budget.amount_allowed)
                  const isOverBudget = budget.amount_spent > budget.amount_allowed

                  return (
                    <div key={budget.id} className="bg-card p-5 lg:p-6 rounded-2xl border border-border hover:shadow-md transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground mb-2">{budget.budget_categories?.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant={budget.period === 'monthly' ? 'orange' : 'default'}>
                              {budget.period}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(budget.start_date).toLocaleDateString()}
                              {budget.end_date && ` - ${new Date(budget.end_date).toLocaleDateString()}`}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                            ${budget.amount_spent.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">of ${budget.amount_allowed.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                            isOverBudget 
                              ? 'bg-destructive' 
                              : percentage > 80 
                                ? 'bg-warning'
                                : 'bg-success'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">{percentage.toFixed(1)}% used</span>
                        {isOverBudget && <Badge variant="danger">Over Budget</Badge>}
                        {!isOverBudget && percentage > 80 && <Badge variant="warning">Warning</Badge>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Target size={18} className="text-primary" />
                Financial Goals
              </h2>
              <Button onClick={() => setShowGoalForm(true)} variant="primary" size="sm">
                <Plus size={18} />
                Add Goal
              </Button>
            </div>

            {goals.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No goals yet"
                description="Create a financial goal to start saving."
              />
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const percentage = getProgressPercentage(goal.current_amount, goal.target_amount)
                  const isComplete = goal.current_amount >= goal.target_amount

                  return (
                    <div
                      key={goal.id}
                      onClick={() => handleUpdateGoalProgress(goal.id, goal.current_amount)}
                      className="bg-card p-5 lg:p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{goal.name}</h3>
                            {isComplete && <Badge variant="success">Complete</Badge>}
                          </div>
                          {goal.deadline && (
                            <p className="text-sm text-muted-foreground">
                              Deadline: {new Date(goal.deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${isComplete ? 'text-success' : 'text-foreground'}`}>
                            ${goal.current_amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">of ${goal.target_amount.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                            isComplete ? 'bg-success' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">{percentage.toFixed(1)}% complete</span>
                        <span className="text-xs text-muted-foreground">Click to add progress</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </PageContainer>

      {/* Category Modal */}
      <Modal isOpen={showBudgetCategoryForm} onClose={() => setShowBudgetCategoryForm(false)} title="Add Category">
        <form onSubmit={handleCreateBudgetCategory} className="space-y-4">
          <Input
            label="Category Name"
            value={budgetCategoryForm.name}
            onChange={(e) => setBudgetCategoryForm({ ...budgetCategoryForm, name: e.target.value })}
            placeholder="Enter category name"
            required
          />
          <Select
            label="Type"
            value={budgetCategoryForm.type}
            onChange={(e) => setBudgetCategoryForm({ ...budgetCategoryForm, type: e.target.value as 'marketing' | 'trips' | 'orders' | 'custom' })}
          >
            <option value="marketing">Marketing</option>
            <option value="trips">Trips</option>
            <option value="orders">Orders</option>
            <option value="custom">Custom</option>
          </Select>
          <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
            Save Category
          </Button>
        </form>
      </Modal>

      {/* Budget Modal */}
      <Modal isOpen={showBudgetForm} onClose={() => setShowBudgetForm(false)} title="Add Budget">
        <form onSubmit={handleCreateBudget} className="space-y-4">
          <Select
            label="Category"
            value={budgetForm.category_id}
            onChange={(e) => setBudgetForm({ ...budgetForm, category_id: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {budgetCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>
          <Input
            label="Budget Amount"
            type="number"
            step="0.01"
            value={budgetForm.amount_allowed}
            onChange={(e) => setBudgetForm({ ...budgetForm, amount_allowed: e.target.value })}
            placeholder="Enter amount"
            required
          />
          <Select
            label="Period"
            value={budgetForm.period}
            onChange={(e) => setBudgetForm({ ...budgetForm, period: e.target.value as 'monthly' | 'yearly' | 'custom' })}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </Select>
          <Input
            label="Start Date"
            type="date"
            value={budgetForm.start_date}
            onChange={(e) => setBudgetForm({ ...budgetForm, start_date: e.target.value })}
            required
          />
          <Input
            label="End Date (Optional)"
            type="date"
            value={budgetForm.end_date}
            onChange={(e) => setBudgetForm({ ...budgetForm, end_date: e.target.value })}
          />
          <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
            Create Budget
          </Button>
        </form>
      </Modal>

      {/* Goal Modal */}
      <Modal isOpen={showGoalForm} onClose={() => setShowGoalForm(false)} title="Add Goal">
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Goal Name"
            value={goalForm.name}
            onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
            placeholder="Enter goal name"
            required
          />
          <Input
            label="Target Amount"
            type="number"
            step="0.01"
            value={goalForm.target_amount}
            onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
            placeholder="Enter target amount"
            required
          />
          <Input
            label="Deadline (Optional)"
            type="date"
            value={goalForm.deadline}
            onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
          />
          <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
            Create Goal
          </Button>
        </form>
      </Modal>
    </div>
  )
}

