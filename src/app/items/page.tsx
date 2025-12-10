'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { Plus, Trash2, Package, Tag, Search } from 'lucide-react'
import { PageHeader, PageContainer, Button, Input, Select, EmptyState, LoadingSpinner } from '@/components/UI'
import { ItemCard, Modal } from '@/components/PageCards'
import { ImageUpload } from '@/components/ImageUpload'

type Category = Database['public']['Tables']['categories']['Row']
type Item = Database['public']['Tables']['items']['Row']

export default function ItemsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [itemForm, setItemForm] = useState({
    name: '',
    category_id: '',
    purchase_price_usd: '',
    selling_price_srd: '',
    selling_price_usd: '',
    image_url: ''
  })

  const loadData = async () => {
    setLoading(true)
    const [categoriesRes, itemsRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('items').select('*').order('name')
    ])
    if (categoriesRes.data) setCategories(categoriesRes.data)
    if (itemsRes.data) setItems(itemsRes.data)
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
      await supabase.from('categories').insert({ name: categoryName })
      setCategoryName('')
      setShowCategoryForm(false)
      loadData()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Delete this category?')) {
      await supabase.from('categories').delete().eq('id', id)
      loadData()
    }
  }

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const data = {
        name: itemForm.name,
        category_id: itemForm.category_id || null,
        purchase_price_usd: parseFloat(itemForm.purchase_price_usd),
        selling_price_srd: itemForm.selling_price_srd ? parseFloat(itemForm.selling_price_srd) : null,
        selling_price_usd: itemForm.selling_price_usd ? parseFloat(itemForm.selling_price_usd) : null,
        image_url: itemForm.image_url || null
      }

      if (editingItem) {
        await supabase.from('items').update(data).eq('id', editingItem.id)
      } else {
        await supabase.from('items').insert(data)
      }

      setItemForm({ name: '', category_id: '', purchase_price_usd: '', selling_price_srd: '', selling_price_usd: '', image_url: '' })
      setShowItemForm(false)
      setEditingItem(null)
      loadData()
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      category_id: item.category_id || '',
      purchase_price_usd: item.purchase_price_usd.toString(),
      selling_price_srd: item.selling_price_srd?.toString() || '',
      selling_price_usd: item.selling_price_usd?.toString() || '',
      image_url: item.image_url || ''
    })
    setShowItemForm(true)
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm('Delete this item?')) {
      await supabase.from('items').delete().eq('id', id)
      loadData()
    }
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'No Category'
    return categories.find(c => c.id === categoryId)?.name || 'Unknown'
  }

  // Filter items and categories
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCategoryName(item.category_id).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Items & Categories" subtitle="Manage products and categories" />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <PageHeader 
        title="Items & Categories" 
        subtitle="Manage products and categories"
        icon={<Package size={24} />}
        action={
          <Button 
            onClick={() => {
              if (activeTab === 'items') {
                setEditingItem(null)
                setItemForm({ name: '', category_id: '', purchase_price_usd: '', selling_price_srd: '', selling_price_usd: '', image_url: '' })
                setShowItemForm(true)
              } else {
                setShowCategoryForm(true)
              }
            }} 
            variant="primary"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">{activeTab === 'items' ? 'New Item' : 'New Category'}</span>
          </Button>
        }
      />

      <PageContainer>
        {/* Search and Tabs */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search items or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <div className="flex gap-1 p-1.5 bg-card rounded-2xl border border-border">
            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'items'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Package size={18} />
              Items ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'categories'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Tag size={18} />
              Categories ({categories.length})
            </button>
          </div>
        </div>

        {/* Items Section */}
        {activeTab === 'items' && (
          <div>
            {filteredItems.length === 0 ? (
              <EmptyState
                icon={Package}
                title={searchQuery ? 'No items found' : 'No items yet'}
                description={searchQuery ? 'Try a different search term.' : 'Create your first item to get started!'}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    name={item.name}
                    categoryName={getCategoryName(item.category_id)}
                    purchasePrice={item.purchase_price_usd}
                    sellingPriceSRD={item.selling_price_srd}
                    sellingPriceUSD={item.selling_price_usd}
                    imageUrl={item.image_url}
                    onEdit={() => handleEditItem(item)}
                    onDelete={() => handleDeleteItem(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories Section */}
        {activeTab === 'categories' && (
        <div>
            {filteredCategories.length === 0 ? (
              <EmptyState
                icon={Tag}
                title={searchQuery ? 'No categories found' : 'No categories yet'}
                description={searchQuery ? 'Try a different search term.' : 'Create categories to organize your items.'}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => {
                  const itemCount = items.filter(i => i.category_id === category.id).length
                  return (
                    <div key={category.id} className="bg-card p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Tag className="text-primary" size={20} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleDeleteCategory(category.id)} 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={16} />
                        </Button>
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
      <Modal isOpen={showCategoryForm} onClose={() => setShowCategoryForm(false)} title="Create Category">
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
              Create Category
            </Button>
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowCategoryForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Item Modal */}
      <Modal 
        isOpen={showItemForm} 
        onClose={() => {
          setShowItemForm(false)
          setEditingItem(null)
        }} 
        title={editingItem ? 'Edit Item' : 'Create Item'}
      >
        <form onSubmit={handleSubmitItem} className="space-y-4">
          <Input
            label="Item Name"
            type="text"
            value={itemForm.name}
            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
            placeholder="Enter item name"
            required
          />
          <Select
            label="Category"
            value={itemForm.category_id}
            onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>
          <Input
            label="Purchase Price (USD)"
            type="number"
            step="0.01"
            value={itemForm.purchase_price_usd}
            onChange={(e) => setItemForm({ ...itemForm, purchase_price_usd: e.target.value })}
            placeholder="0.00"
            prefix="$"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Selling Price (SRD)"
              type="number"
              step="0.01"
              value={itemForm.selling_price_srd}
              onChange={(e) => setItemForm({ ...itemForm, selling_price_srd: e.target.value })}
              placeholder="0.00"
              suffix="SRD"
            />
            <Input
              label="Selling Price (USD)"
              type="number"
              step="0.01"
              value={itemForm.selling_price_usd}
              onChange={(e) => setItemForm({ ...itemForm, selling_price_usd: e.target.value })}
              placeholder="0.00"
              prefix="$"
            />
          </div>
          <ImageUpload
            value={itemForm.image_url}
            onChange={(url) => setItemForm({ ...itemForm, image_url: url || '' })}
            folder="items"
            label="Product Image"
          />
          <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
            {editingItem ? 'Update Item' : 'Create Item'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}

