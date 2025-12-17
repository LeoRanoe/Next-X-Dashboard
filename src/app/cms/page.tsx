'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  FileText, Image, MessageSquare, Tag, Star, Users, 
  BookOpen, Megaphone, HelpCircle, ChevronRight, Plus, 
  TrendingUp, Eye, Calendar, Layout, Settings
} from 'lucide-react'
import Link from 'next/link'
import { PageHeader, PageContainer, LoadingSpinner } from '@/components/UI'

interface CMSStats {
  blogPosts: number
  publishedPosts: number
  banners: number
  pages: number
  collections: number
  reviews: number
  pendingReviews: number
  subscribers: number
  faqs: number
  testimonials: number
}

interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}

export default function CMSPage() {
  const [stats, setStats] = useState<CMSStats>({
    blogPosts: 0,
    publishedPosts: 0,
    banners: 0,
    pages: 0,
    collections: 0,
    reviews: 0,
    pendingReviews: 0,
    subscribers: 0,
    faqs: 0,
    testimonials: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [
        blogPostsRes,
        publishedPostsRes,
        bannersRes,
        pagesRes,
        collectionsRes,
        reviewsRes,
        pendingReviewsRes,
        subscribersRes,
        faqsRes,
        testimonialsRes
      ] = await Promise.all([
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('banners').select('id', { count: 'exact', head: true }),
        supabase.from('pages').select('id', { count: 'exact', head: true }),
        supabase.from('collections').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('subscribers').select('id', { count: 'exact', head: true }),
        supabase.from('faqs').select('id', { count: 'exact', head: true }),
        supabase.from('testimonials').select('id', { count: 'exact', head: true })
      ])

      setStats({
        blogPosts: blogPostsRes.count || 0,
        publishedPosts: publishedPostsRes.count || 0,
        banners: bannersRes.count || 0,
        pages: pagesRes.count || 0,
        collections: collectionsRes.count || 0,
        reviews: reviewsRes.count || 0,
        pendingReviews: pendingReviewsRes.count || 0,
        subscribers: subscribersRes.count || 0,
        faqs: faqsRes.count || 0,
        testimonials: testimonialsRes.count || 0
      })
    } catch (error) {
      console.error('Error loading CMS stats:', error)
    }
    setLoading(false)
  }

  const quickActions: QuickAction[] = [
    {
      title: 'New Blog Post',
      description: 'Write and publish articles',
      icon: <Plus size={20} />,
      href: '/cms/blog/new',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Add Banner',
      description: 'Create homepage banners',
      icon: <Image size={20} />,
      href: '/cms/banners/new',
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'New Collection',
      description: 'Curate product collections',
      icon: <Layout size={20} />,
      href: '/cms/collections/new',
      color: 'from-orange-500 to-red-600'
    },
    {
      title: 'Create Page',
      description: 'Build static pages',
      icon: <FileText size={20} />,
      href: '/cms/pages/new',
      color: 'from-emerald-500 to-teal-600'
    }
  ]

  const managementSections = [
    {
      title: 'Blog',
      description: 'Manage articles, categories, and tags',
      icon: <BookOpen size={24} />,
      href: '/cms/blog',
      stats: [
        { label: 'Total Posts', value: stats.blogPosts },
        { label: 'Published', value: stats.publishedPosts }
      ],
      color: 'bg-blue-500'
    },
    {
      title: 'Banners',
      description: 'Homepage sliders and promotions',
      icon: <Megaphone size={24} />,
      href: '/cms/banners',
      stats: [
        { label: 'Active Banners', value: stats.banners }
      ],
      color: 'bg-purple-500'
    },
    {
      title: 'Collections',
      description: 'Curated product collections',
      icon: <Layout size={24} />,
      href: '/cms/collections',
      stats: [
        { label: 'Collections', value: stats.collections }
      ],
      color: 'bg-orange-500'
    },
    {
      title: 'Pages',
      description: 'About, FAQ, Terms, etc.',
      icon: <FileText size={24} />,
      href: '/cms/pages',
      stats: [
        { label: 'Pages', value: stats.pages }
      ],
      color: 'bg-emerald-500'
    },
    {
      title: 'Reviews',
      description: 'Customer reviews and ratings',
      icon: <Star size={24} />,
      href: '/cms/reviews',
      stats: [
        { label: 'Total', value: stats.reviews },
        { label: 'Pending', value: stats.pendingReviews }
      ],
      color: 'bg-amber-500'
    },
    {
      title: 'Testimonials',
      description: 'Customer testimonials',
      icon: <MessageSquare size={24} />,
      href: '/cms/testimonials',
      stats: [
        { label: 'Testimonials', value: stats.testimonials }
      ],
      color: 'bg-pink-500'
    },
    {
      title: 'FAQ',
      description: 'Frequently asked questions',
      icon: <HelpCircle size={24} />,
      href: '/cms/faq',
      stats: [
        { label: 'Questions', value: stats.faqs }
      ],
      color: 'bg-cyan-500'
    },
    {
      title: 'Subscribers',
      description: 'Newsletter subscribers',
      icon: <Users size={24} />,
      href: '/cms/subscribers',
      stats: [
        { label: 'Subscribers', value: stats.subscribers }
      ],
      color: 'bg-indigo-500'
    }
  ]

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
      <PageHeader
        title="Content Management"
        subtitle="Manage your store's content, blog, and pages"
        icon={<Settings size={28} />}
      />

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 p-5 hover:border-neutral-700 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-4`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-white mb-1">{action.title}</h3>
              <p className="text-sm text-neutral-400">{action.description}</p>
              <ChevronRight 
                size={18} 
                className="absolute top-5 right-5 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" 
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Management Sections */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Content Sections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {managementSections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="group bg-neutral-900 rounded-2xl border border-neutral-800 p-5 hover:border-neutral-700 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center text-white`}>
                  {section.icon}
                </div>
                <ChevronRight 
                  size={18} 
                  className="text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" 
                />
              </div>
              <h3 className="font-semibold text-white mb-1">{section.title}</h3>
              <p className="text-sm text-neutral-400 mb-4">{section.description}</p>
              <div className="flex gap-4">
                {section.stats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-neutral-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Store Settings Link */}
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white mb-1">Store Settings</h3>
            <p className="text-sm text-neutral-400">Configure store info, hero section, and more</p>
          </div>
          <Link
            href="/settings"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    </PageContainer>
  )
}
