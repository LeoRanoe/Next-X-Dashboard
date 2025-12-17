'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { 
  ChevronLeft, 
  Plus, 
  HelpCircle, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  ChevronDown,
  ChevronUp,
  Search,
  FolderOpen
} from 'lucide-react'
import Link from 'next/link'
import { PageContainer, LoadingSpinner, Modal } from '@/components/UI'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  position: number
  is_active: boolean
  created_at: string
}

export default function FAQManagementPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    is_active: true
  })

  const defaultCategories = [
    'Ordering',
    'Shipping',
    'Returns',
    'Payment',
    'Products',
    'Account',
    'Other'
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadFaqs()
    }
  }, [user])

  const loadFaqs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('position')

      if (error) throw error
      setFaqs(data || [])
    } catch (err) {
      console.error('Error loading FAQs:', err)
    } finally {
      setLoading(false)
    }
  }

  const openNewEditor = () => {
    setEditingFaq(null)
    setFormData({
      question: '',
      answer: '',
      category: '',
      is_active: true
    })
    setShowEditor(true)
  }

  const openEditEditor = (faq: FAQ) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      is_active: faq.is_active
    })
    setShowEditor(true)
  }

  const saveFaq = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) return
    setSaving(true)

    try {
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category.trim() || null,
        is_active: formData.is_active,
        position: editingFaq ? editingFaq.position : faqs.length
      }

      if (editingFaq) {
        const { error } = await supabase
          .from('faqs')
          .update(payload)
          .eq('id', editingFaq.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert(payload)
        if (error) throw error
      }

      await loadFaqs()
      setShowEditor(false)
    } catch (err) {
      console.error('Error saving FAQ:', err)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (faq: FAQ) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .update({ is_active: !faq.is_active })
        .eq('id', faq.id)
      if (error) throw error
      loadFaqs()
    } catch (err) {
      console.error('Error toggling active:', err)
    }
  }

  const deleteFaq = async (faq: FAQ) => {
    if (!confirm('Delete this FAQ?')) return

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', faq.id)
      if (error) throw error
      loadFaqs()
    } catch (err) {
      console.error('Error deleting FAQ:', err)
    }
  }

  // Get unique categories from FAQs
  const existingCategories = [...new Set(faqs.map(f => f.category).filter(Boolean))]
  const allCategories = [...new Set([...defaultCategories, ...existingCategories])]

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Group FAQs by category
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    const cat = faq.category || 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(faq)
    return acc
  }, {} as Record<string, FAQ[]>)

  if (authLoading || loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/cms" className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
          <ChevronLeft size={20} className="text-neutral-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">FAQ Management</h1>
          <p className="text-neutral-400 text-sm">Manage frequently asked questions</p>
        </div>
        <button
          onClick={openNewEditor}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          <Plus size={18} />
          Add FAQ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <HelpCircle size={20} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{faqs.length}</p>
              <p className="text-xs text-neutral-500">Total FAQs</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Eye size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{faqs.filter(f => f.is_active).length}</p>
              <p className="text-xs text-neutral-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FolderOpen size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{existingCategories.length}</p>
              <p className="text-xs text-neutral-500">Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <EyeOff size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{faqs.filter(f => !f.is_active).length}</p>
              <p className="text-xs text-neutral-500">Hidden</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
        >
          <option value="">All Categories</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* FAQs List */}
      {filteredFaqs.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900 rounded-2xl border border-neutral-800">
          <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={24} className="text-neutral-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchQuery || selectedCategory ? 'No FAQs found' : 'No FAQs yet'}
          </h3>
          <p className="text-neutral-400 mb-4">
            {searchQuery || selectedCategory ? 'Try a different search or filter' : 'Add frequently asked questions'}
          </p>
          {!searchQuery && !selectedCategory && (
            <button
              onClick={openNewEditor}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-medium"
            >
              <Plus size={18} />
              Add First FAQ
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
            <div key={category} className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
              <div className="px-5 py-3 bg-neutral-800/50 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <FolderOpen size={16} className="text-neutral-500" />
                  <span className="font-medium text-white">{category}</span>
                  <span className="text-xs text-neutral-500">({categoryFaqs.length})</span>
                </div>
              </div>
              <div className="divide-y divide-neutral-800">
                {categoryFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`${!faq.is_active ? 'opacity-60' : ''}`}
                  >
                    <div 
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-neutral-800/30 transition-colors"
                      onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <HelpCircle size={16} className="text-cyan-400 flex-shrink-0" />
                          <span className="font-medium text-white truncate">{faq.question}</span>
                          {!faq.is_active && (
                            <span className="bg-neutral-700 text-neutral-400 text-xs px-2 py-0.5 rounded">Hidden</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleActive(faq) }}
                          className={`p-2 rounded-lg transition-colors ${
                            faq.is_active
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'
                          }`}
                        >
                          {faq.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditEditor(faq) }}
                          className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteFaq(faq) }}
                          className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        {expandedId === faq.id ? (
                          <ChevronUp size={16} className="text-neutral-500" />
                        ) : (
                          <ChevronDown size={16} className="text-neutral-500" />
                        )}
                      </div>
                    </div>
                    {expandedId === faq.id && (
                      <div className="px-4 pb-4 pl-10">
                        <p className="text-neutral-300 text-sm whitespace-pre-wrap">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <Modal isOpen={showEditor} onClose={() => setShowEditor(false)} title={editingFaq ? 'Edit FAQ' : 'New FAQ'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Question *</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              placeholder="What do customers ask?"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Answer *</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
              placeholder="Provide a helpful answer..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">Select category...</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-neutral-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${formData.is_active ? 'translate-x-6' : ''}`} />
            </button>
            <span className="text-sm text-neutral-300">Active</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
          <button onClick={() => setShowEditor(false)} className="px-4 py-2 text-neutral-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={saveFaq}
            disabled={saving || !formData.question.trim() || !formData.answer.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save
              </>
            )}
          </button>
        </div>
      </Modal>
    </PageContainer>
  )
}
