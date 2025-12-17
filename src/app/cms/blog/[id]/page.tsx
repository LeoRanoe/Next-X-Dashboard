'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ChevronLeft, Save, Eye, EyeOff, Star, Image as ImageIcon,
  Calendar, Tag, X, Upload, Loader2, Globe, FileText
} from 'lucide-react'
import Link from 'next/link'
import { PageContainer, LoadingSpinner } from '@/components/UI'
import { ImageUpload } from '@/components/ImageUpload'
import { logActivity } from '@/lib/activityLog'

interface BlogCategory {
  id: string
  name: string
  slug: string
  color: string | null
}

interface BlogTag {
  id: string
  name: string
  slug: string
}

export default function BlogPostEditorPage() {
  const router = useRouter()
  const params = useParams()
  const isEditing = params.id !== 'new'

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState('')

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    category_id: '',
    status: 'draft',
    is_featured: false,
    meta_title: '',
    meta_description: ''
  })

  const [showSeoPanel, setShowSeoPanel] = useState(false)

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      // Load categories and tags
      const [categoriesRes, tagsRes] = await Promise.all([
        supabase.from('blog_categories').select('*').order('name'),
        supabase.from('blog_tags').select('*').order('name')
      ])

      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (tagsRes.data) setTags(tagsRes.data)

      // Load post if editing
      if (isEditing) {
        const { data: post } = await supabase
          .from('blog_posts')
          .select('*, blog_post_tags(tag_id)')
          .eq('id', params.id)
          .single()

        if (post) {
          setForm({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            content: post.content,
            cover_image: post.cover_image || '',
            category_id: post.category_id || '',
            status: post.status,
            is_featured: post.is_featured,
            meta_title: post.meta_title || '',
            meta_description: post.meta_description || ''
          })
          setSelectedTags(post.blog_post_tags?.map((t: { tag_id: string }) => t.tag_id) || [])
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setForm({
      ...form,
      title,
      slug: form.slug || generateSlug(title)
    })
  }

  const handleSave = async (publish = false) => {
    if (!form.title || !form.content) {
      alert('Title and content are required')
      return
    }

    setSaving(true)
    try {
      const postData = {
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        excerpt: form.excerpt || null,
        content: form.content,
        cover_image: form.cover_image || null,
        category_id: form.category_id || null,
        status: publish ? 'published' : form.status,
        is_featured: form.is_featured,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        published_at: publish ? new Date().toISOString() : null
      }

      let postId = params.id as string

      if (isEditing) {
        await supabase.from('blog_posts').update(postData).eq('id', params.id)
      } else {
        const { data } = await supabase.from('blog_posts').insert(postData).select('id').single()
        if (data) postId = data.id
      }

      // Update tags
      await supabase.from('blog_post_tags').delete().eq('post_id', postId)
      if (selectedTags.length > 0) {
        await supabase.from('blog_post_tags').insert(
          selectedTags.map(tagId => ({ post_id: postId, tag_id: tagId }))
        )
      }

      await logActivity({
        action: isEditing ? 'update' : 'create',
        entityType: 'blog_post',
        entityId: postId,
        entityName: form.title,
        details: `${isEditing ? 'Updated' : 'Created'} blog post`
      })

      router.push('/cms/blog')
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Failed to save post')
    }
    setSaving(false)
  }

  const handleAddTag = async () => {
    if (!newTagInput.trim()) return
    
    try {
      // Check if tag exists
      let tag = tags.find(t => t.name.toLowerCase() === newTagInput.toLowerCase())
      
      if (!tag) {
        // Create new tag
        const { data } = await supabase.from('blog_tags').insert({
          name: newTagInput,
          slug: generateSlug(newTagInput)
        }).select().single()
        
        if (data) {
          tag = data
          setTags([...tags, data])
        }
      }

      if (tag && !selectedTags.includes(tag.id)) {
        setSelectedTags([...selectedTags, tag.id])
      }
      
      setNewTagInput('')
    } catch (error) {
      console.error('Error adding tag:', error)
    }
  }

  const handleImageUpload = (url: string) => {
    setForm({ ...form, cover_image: url })
  }

  if (loading) {
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/cms/blog" className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
            <ChevronLeft size={20} className="text-neutral-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h1>
            <p className="text-neutral-400 text-sm">
              {form.status === 'published' ? 'Published' : 'Draft'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSeoPanel(!showSeoPanel)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              showSeoPanel ? 'bg-blue-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            <Globe size={18} />
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title..."
              className="w-full text-3xl font-bold bg-transparent text-white placeholder-neutral-600 focus:outline-none"
            />
          </div>

          {/* Slug */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500">Permalink:</span>
            <span className="text-neutral-400">/blog/</span>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="flex-1 px-2 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Brief summary of the post..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your post content here... (Markdown supported)"
              rows={20}
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 resize-none font-mono text-sm leading-relaxed"
            />
            <p className="mt-2 text-xs text-neutral-500">Markdown formatting supported</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
            <h3 className="font-semibold text-white mb-3">Cover Image</h3>
            {form.cover_image ? (
              <div className="relative">
                <img 
                  src={form.cover_image} 
                  alt="Cover" 
                  className="w-full aspect-video object-cover rounded-xl"
                />
                <button
                  onClick={() => setForm({ ...form, cover_image: '' })}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <ImageUpload
                value={null}
                onChange={handleImageUpload}
                folder="blog"
                className="w-full aspect-video"
              />
            )}
          </div>

          {/* Category */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
            <h3 className="font-semibold text-white mb-3">Category</h3>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">No category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
            <h3 className="font-semibold text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map(tagId => {
                const tag = tags.find(t => t.id === tagId)
                if (!tag) return null
                return (
                  <span 
                    key={tag.id}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-800 text-sm text-neutral-300"
                  >
                    {tag.name}
                    <button 
                      onClick={() => setSelectedTags(selectedTags.filter(id => id !== tag.id))}
                      className="text-neutral-500 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-2 rounded-lg bg-orange-500 text-white text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
            <h3 className="font-semibold text-white mb-3">Options</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-neutral-300">Featured post</span>
              <Star size={16} className={form.is_featured ? 'text-amber-500 fill-amber-500' : 'text-neutral-500'} />
            </label>
          </div>

          {/* SEO Panel */}
          {showSeoPanel && (
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4">
              <h3 className="font-semibold text-white mb-3">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    placeholder={form.title || 'Page title'}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Meta Description</label>
                  <textarea
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder="Brief description for search engines..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
