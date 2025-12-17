'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  ArrowRight, Calendar, Clock, Eye, Tag, ChevronLeft,
  ChevronRight, Search, User
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  status: string
  is_featured: boolean
  view_count: number
  published_at: string | null
  created_at: string
  category?: {
    id: string
    name: string
    slug: string
    color: string | null
  } | null
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  color: string | null
}

interface StoreSettings {
  store_name: string
  store_logo_url: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [settings, setSettings] = useState<StoreSettings>({ store_name: 'NextX', store_logo_url: '' })
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 9

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [postsRes, categoriesRes, settingsRes] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('*, category:blog_categories(id, name, slug, color)')
          .eq('status', 'published')
          .order('published_at', { ascending: false }),
        supabase.from('blog_categories').select('*').order('name'),
        supabase.from('store_settings').select('*')
      ])

      if (postsRes.data) {
        setPosts(postsRes.data)
        setFeaturedPosts(postsRes.data.filter(p => p.is_featured).slice(0, 3))
      }
      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (settingsRes.data) {
        const settingsMap: Record<string, string> = {}
        settingsRes.data.forEach((s: { key: string; value: string }) => {
          settingsMap[s.key] = s.value
        })
        setSettings({
          store_name: settingsMap.store_name || 'NextX',
          store_logo_url: settingsMap.store_logo_url || ''
        })
      }
    } catch (error) {
      console.error('Error loading blog data:', error)
    }
    setLoading(false)
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || post.category?.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', day: 'numeric', year: 'numeric' 
    })
  }

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    return Math.max(1, Math.ceil(words / wordsPerMinute))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/catalog" className="flex items-center gap-3">
              {settings.store_logo_url ? (
                <img src={settings.store_logo_url} alt={settings.store_name} className="h-8" />
              ) : (
                <span className="text-xl font-bold text-slate-900">
                  {settings.store_name}
                </span>
              )}
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 font-medium">Blog</span>
            </Link>
            <Link 
              href="/catalog"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
            >
              Back to Store
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Featured Articles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Featured */}
              {featuredPosts[0] && (
                <Link 
                  href={`/blog/${featuredPosts[0].slug}`}
                  className="lg:col-span-2 group relative aspect-[16/9] rounded-2xl overflow-hidden"
                >
                  {featuredPosts[0].cover_image ? (
                    <img 
                      src={featuredPosts[0].cover_image} 
                      alt={featuredPosts[0].title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                    {featuredPosts[0].category && (
                      <span 
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-3"
                        style={{ backgroundColor: featuredPosts[0].category.color || '#3B82F6' }}
                      >
                        {featuredPosts[0].category.name}
                      </span>
                    )}
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
                      {featuredPosts[0].title}
                    </h3>
                    <p className="text-slate-300 line-clamp-2 mb-4">{featuredPosts[0].excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(featuredPosts[0].published_at || featuredPosts[0].created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {estimateReadTime(featuredPosts[0].content)} min read
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Side Featured */}
              <div className="space-y-6">
                {featuredPosts.slice(1, 3).map((post) => (
                  <Link 
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex gap-4"
                  >
                    <div className="w-24 h-24 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0">
                      {post.cover_image ? (
                        <img 
                          src={post.cover_image} 
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {post.category && (
                        <span 
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1"
                          style={{ 
                            backgroundColor: (post.category.color || '#3B82F6') + '20', 
                            color: post.category.color || '#3B82F6' 
                          }}
                        >
                          {post.category.name}
                        </span>
                      )}
                      <h4 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {post.title}
                      </h4>
                      <span className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {estimateReadTime(post.content)} min read
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500'
              }`}
            >
              All Posts
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500'
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color || '#3B82F6' } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {paginatedPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Tag size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No articles found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
                >
                  {/* Cover Image */}
                  <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                    {post.cover_image ? (
                      <img 
                        src={post.cover_image} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center">
                        <Tag size={32} className="text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      {post.category && (
                        <span 
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: (post.category.color || '#3B82F6') + '15', 
                            color: post.category.color || '#3B82F6' 
                          }}
                        >
                          {post.category.name}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {estimateReadTime(post.content)} min
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                      {post.excerpt || 'Click to read more...'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(post.published_at || post.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {post.view_count} views
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-orange-100 mb-8">
            Subscribe to our newsletter for the latest articles, tips, and exclusive deals.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:bg-white/20"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-white text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} {settings.store_name}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/catalog" className="text-sm text-slate-500 hover:text-orange-500 transition-colors">
                Store
              </Link>
              <Link href="/blog" className="text-sm text-slate-500 hover:text-orange-500 transition-colors">
                Blog
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
