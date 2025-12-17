'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { 
  ChevronLeft, 
  Star, 
  Check, 
  X as XIcon, 
  Eye, 
  EyeOff,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  User,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { PageContainer, LoadingSpinner, Modal, Badge } from '@/components/UI'

interface Review {
  id: string
  item_id: string
  name: string
  email: string | null
  rating: number
  title: string | null
  content: string | null
  is_verified: boolean
  is_approved: boolean
  created_at: string
  item?: {
    id: string
    name: string
    image_url: string | null
  }
}

export default function ReviewsManagementPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadReviews()
    }
  }, [user])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, item:items(id, name, image_url)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (err) {
      console.error('Error loading reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const approveReview = async (review: Review) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', review.id)
      if (error) throw error
      loadReviews()
    } catch (err) {
      console.error('Error approving review:', err)
    }
  }

  const rejectReview = async (review: Review) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: false })
        .eq('id', review.id)
      if (error) throw error
      loadReviews()
    } catch (err) {
      console.error('Error rejecting review:', err)
    }
  }

  const deleteReview = async (review: Review) => {
    if (!confirm('Delete this review permanently?')) return

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', review.id)
      if (error) throw error
      loadReviews()
    } catch (err) {
      console.error('Error deleting review:', err)
    }
  }

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.content && r.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.item?.name && r.item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !r.is_approved) ||
      (statusFilter === 'approved' && r.is_approved)
    const matchesRating = ratingFilter === null || r.rating === ratingFilter
    return matchesSearch && matchesStatus && matchesRating
  })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (authLoading || loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </PageContainer>
    )
  }

  const pendingCount = reviews.filter(r => !r.is_approved).length
  const approvedCount = reviews.filter(r => r.is_approved).length
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '-'

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/cms" className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors">
          <ChevronLeft size={20} className="text-neutral-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Product Reviews</h1>
          <p className="text-neutral-400 text-sm">Manage customer reviews and ratings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <MessageSquare size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{reviews.length}</p>
              <p className="text-xs text-neutral-500">Total Reviews</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Star size={20} className="text-amber-400 fill-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{avgRating}</p>
              <p className="text-xs text-neutral-500">Avg Rating</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Eye size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
              <p className="text-xs text-neutral-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Check size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{approvedCount}</p>
              <p className="text-xs text-neutral-500">Approved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved')}
          className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
        <select
          value={ratingFilter || ''}
          onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
          className="px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-orange-500"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900 rounded-2xl border border-neutral-800">
          <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={24} className="text-neutral-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchQuery || statusFilter !== 'all' || ratingFilter ? 'No reviews found' : 'No reviews yet'}
          </h3>
          <p className="text-neutral-400">
            {searchQuery || statusFilter !== 'all' || ratingFilter 
              ? 'Try adjusting your filters' 
              : 'Reviews will appear here when customers leave feedback'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-neutral-900 rounded-2xl border overflow-hidden ${
                review.is_approved 
                  ? 'border-neutral-800' 
                  : 'border-amber-500/30 bg-amber-500/5'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded-xl bg-neutral-800 flex-shrink-0 overflow-hidden">
                    {review.item?.image_url ? (
                      <img 
                        src={review.item.image_url} 
                        alt={review.item?.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} className="text-neutral-600" />
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{review.name}</span>
                          {review.is_verified && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                              Verified
                            </span>
                          )}
                          {!review.is_approved && (
                            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500">
                          on <span className="text-neutral-300">{review.item?.name || 'Unknown Product'}</span>
                          {' · '}{formatDate(review.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!review.is_approved && (
                          <button
                            onClick={() => approveReview(review)}
                            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            title="Approve"
                          >
                            <ThumbsUp size={16} />
                          </button>
                        )}
                        {review.is_approved && (
                          <button
                            onClick={() => rejectReview(review)}
                            className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-amber-400 transition-colors"
                            title="Hide"
                          >
                            <EyeOff size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteReview(review)}
                          className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <XIcon size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= review.rating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-neutral-700'
                          }
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    {review.title && (
                      <h4 className="font-medium text-white mb-1">{review.title}</h4>
                    )}
                    {review.content && (
                      <p className="text-neutral-300 text-sm">{review.content}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
