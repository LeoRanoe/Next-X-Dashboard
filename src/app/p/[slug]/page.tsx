'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

interface Page {
  id: string
  title: string
  slug: string
  content: string
  meta_description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

interface StoreSettings {
  store_name: string
  store_logo_url: string
  whatsapp_number: string
}

export default function PublicPage() {
  const params = useParams()
  const router = useRouter()
  const [page, setPage] = useState<Page | null>(null)
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: 'NextX',
    store_logo_url: '',
    whatsapp_number: ''
  })
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Load page
        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', params.slug)
          .eq('is_published', true)
          .single()

        if (pageError || !pageData) {
          setNotFound(true)
          return
        }

        setPage(pageData)

        // Load settings
        const { data: settingsData } = await supabase
          .from('store_settings')
          .select('*')

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
      } catch (err) {
        console.error('Error loading page:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      loadData()
    }
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-neutral-200 mb-4">404</h1>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Pagina niet gevonden</h2>
          <p className="text-neutral-500 mb-8">
            De pagina die je zoekt bestaat niet of is niet meer beschikbaar.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug
            </button>
            <Link
              href="/catalog"
              className="flex items-center gap-2 px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              Naar Shop
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/catalog" className="flex items-center gap-3">
              {settings.store_logo_url ? (
                <img 
                  src={settings.store_logo_url} 
                  alt={settings.store_name}
                  className="h-8 w-auto"
                />
              ) : (
                <span className="text-xl font-bold text-neutral-900">
                  {settings.store_name}
                </span>
              )}
            </Link>
            <nav className="flex items-center gap-6">
              <Link 
                href="/catalog"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Shop
              </Link>
              <Link 
                href="/blog"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Blog
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
            {page.title}
          </h1>
          
          {/* Page Content - Render HTML safely */}
          <div 
            className="prose prose-neutral max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>

        {/* Back to Shop */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar shop
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-50 border-t border-neutral-200 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} {settings.store_name}
            </p>
            <nav className="flex items-center gap-6">
              <Link 
                href="/p/over-ons"
                className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                Over Ons
              </Link>
              <Link 
                href="/p/contact"
                className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                Contact
              </Link>
              <Link 
                href="/p/privacy-policy"
                className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
