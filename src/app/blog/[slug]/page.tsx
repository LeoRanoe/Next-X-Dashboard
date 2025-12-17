'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  ArrowLeft, Calendar, Clock, Eye, Tag, Share2, 
  Twitter, Facebook, Linkedin, Copy, Check, ChevronRight
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
  meta_title: string | null
  meta_description: string | null
  published_at: string | null
  created_at: string
  category?: {
    id: string
    name: string
    slug: string
    color: string | null
  } | null
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  published_at: string | null
  created_at: string
}

interface StoreSettings {
  store_name: string
  store_logo_url: string
  whatsapp_number: string
}

export default function BlogPostPage() {
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([])
  const [settings, setSettings] = useState<StoreSettings>({ 
    store_name: 'NextX', 
    store_logo_url: '',
    whatsapp_number: ''
  })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadPost()
  }, [params.slug])

  const loadPost = async () => {
    try {
      // Load post
      const { data: postData } = await supabase
        .from('blog_posts')
        .select('*, category:blog_categories(id, name, slug, color)')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single()

      if (postData) {
        setPost(postData)
        
        // Increment view count
        await supabase
          .from('blog_posts')
          .update({ view_count: (postData.view_count || 0) + 1 })
          .eq('id', postData.id)

        // Load related posts
        const { data: related } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, cover_image, published_at, created_at')
          .eq('status', 'published')
          .neq('id', postData.id)
          .limit(3)
          .order('published_at', { ascending: false })

        if (related) setRelatedPosts(related)
      }

      // Load settings
      const { data: settingsData } = await supabase.from('store_settings').select('*')
      if (settingsData) {
        const settingsMap: Record<string, string> = {}
        settingsData.forEach((s: { key: string; value: string }) => {
          settingsMap[s.key] = s.value
        })
        setSettings({
          store_name: settingsMap.store_name || 'NextX',
          store_logo_url: settingsMap.store_logo_url || '',
          whatsapp_number: settingsMap.whatsapp_number || ''
        })
      }
    } catch (error) {
      console.error('Error loading post:', error)
    }
    setLoading(false)
  }

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

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post?.title || '')}`, '_blank')
  }

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  // Simple markdown to HTML (basic)
  const renderContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, i) => {
        // Headers
        if (paragraph.startsWith('### ')) {
          return <h3 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-4">{paragraph.slice(4)}</h3>
        }
        if (paragraph.startsWith('## ')) {
          return <h2 key={i} className="text-2xl font-bold text-slate-900 mt-10 mb-4">{paragraph.slice(3)}</h2>
        }
        if (paragraph.startsWith('# ')) {
          return <h1 key={i} className="text-3xl font-bold text-slate-900 mt-10 mb-4">{paragraph.slice(2)}</h1>
        }
        // Lists
        if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
          const items = paragraph.split('\n').filter(line => line.startsWith('- ') || line.startsWith('* '))
          return (
            <ul key={i} className="list-disc list-inside space-y-2 my-4 text-slate-700">
              {items.map((item, j) => <li key={j}>{item.slice(2)}</li>)}
            </ul>
          )
        }
        // Bold and italic
        let text = paragraph
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
        
        return <p key={i} className="text-slate-700 leading-relaxed my-4" dangerouslySetInnerHTML={{ __html: text }} />
      })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Post not found</h1>
          <Link href="/blog" className="text-orange-600 hover:text-orange-700">
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/blog" className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors">
              <ArrowLeft size={18} />
              <span className="font-medium">Back to Blog</span>
            </Link>
            <Link href="/catalog" className="flex items-center gap-3">
              {settings.store_logo_url ? (
                <img src={settings.store_logo_url} alt={settings.store_name} className="h-8" />
              ) : (
                <span className="text-xl font-bold text-slate-900">{settings.store_name}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.cover_image && (
        <div className="w-full aspect-[21/9] bg-slate-200 overflow-hidden">
          <img 
            src={post.cover_image} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/blog" className="hover:text-orange-600 transition-colors">Blog</Link>
          {post.category && (
            <>
              <ChevronRight size={14} />
              <Link 
                href={`/blog?category=${post.category.id}`}
                className="hover:text-orange-600 transition-colors"
              >
                {post.category.name}
              </Link>
            </>
          )}
        </nav>

        {/* Category Badge */}
        {post.category && (
          <span 
            className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
            style={{ 
              backgroundColor: (post.category.color || '#3B82F6') + '15', 
              color: post.category.color || '#3B82F6' 
            }}
          >
            {post.category.name}
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-200">
          <span className="flex items-center gap-1.5">
            <Calendar size={16} />
            {formatDate(post.published_at || post.created_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={16} />
            {estimateReadTime(post.content)} min read
          </span>
          <span className="flex items-center gap-1.5">
            <Eye size={16} />
            {post.view_count} views
          </span>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-slate-600 leading-relaxed mb-8 font-medium">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div className="prose prose-slate prose-lg max-w-none">
          {renderContent(post.content)}
        </div>

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-slate-600 font-medium flex items-center gap-2">
              <Share2 size={18} />
              Share this article
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={shareOnTwitter}
                className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-colors"
                title="Share on Twitter"
              >
                <Twitter size={18} />
              </button>
              <button
                onClick={shareOnFacebook}
                className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#4267B2] hover:text-white transition-colors"
                title="Share on Facebook"
              >
                <Facebook size={18} />
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#0077B5] hover:text-white transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin size={18} />
              </button>
              <button
                onClick={handleCopyLink}
                className={`p-2.5 rounded-xl transition-colors ${
                  copied 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="Copy link"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-white border-t border-slate-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relPost) => (
                <Link
                  key={relPost.id}
                  href={`/blog/${relPost.slug}`}
                  className="group bg-slate-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="aspect-[16/10] bg-slate-200 overflow-hidden">
                    {relPost.cover_image ? (
                      <img 
                        src={relPost.cover_image} 
                        alt={relPost.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center">
                        <Tag size={24} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {relPost.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                      {relPost.excerpt || 'Click to read more...'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
