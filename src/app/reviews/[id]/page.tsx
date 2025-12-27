'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'

interface Review {
  id: string
  title: string
  content: string
  rating: number
  category: string
  subject_name: string
  nft_gate_collection: string | null
  likes_count: number
  created_at: string
  updated_at: string
  users: {
    id: string
    wallet_address: string
    username: string | null
    profile_image_url: string | null
    has_plague_nft: boolean
  }
}

export default function ReviewDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token, isAuthenticated } = useAuth()

  const [review, setReview] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const reviewId = params.id as string

  useEffect(() => {
    fetchReview()
  }, [reviewId])

  const fetchReview = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/reviews/${reviewId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Review not found')
        }
        throw new Error('Failed to fetch review')
      }

      const data = await response.json()
      setReview(data)
      setLikesCount(data.likes_count)
    } catch (err) {
      console.error('Error fetching review:', err)
      setError(err instanceof Error ? err.message : 'Failed to load review')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated || !token) return

    try {
      const response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikesCount(prev => data.liked ? prev + 1 : prev - 1)
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push('/reviews')
      } else {
        throw new Error('Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      tv_show: '📺',
      movie: '🎬',
      book: '📚',
      sports_team: '⚽',
      travel_destination: '✈️',
    }
    return emojiMap[category] || '📝'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const isOwner = user?.id === review?.users.id

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="h-96 rounded-xl bg-plague-lightGray animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="p-12 rounded-xl bg-plague-lightGray border border-red-500 text-center">
              <h1 className="text-2xl font-tanker text-white mb-4">Review Not Found</h1>
              <p className="text-white/60 mb-6">{error || 'The review you are looking for does not exist.'}</p>
              <Link
                href="/reviews"
                className="inline-block px-6 py-3 bg-plague-lime text-black font-bold rounded-lg hover:bg-plague-yellow transition-all"
              >
                Back to Reviews
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-plague-lime hover:text-plague-yellow transition-colors mb-6"
          >
            ← Back to Reviews
          </Link>

          {/* Review Content */}
          <article className="p-8 rounded-xl bg-plague-darkGray border border-white/10">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <Link
                  href={`/profile/${review.users.wallet_address}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full bg-plague-lime/20 border-2 border-plague-lime flex items-center justify-center">
                    <span className="text-plague-lime font-bold">
                      {review.users.username?.[0]?.toUpperCase() || review.users.wallet_address.slice(2, 4).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {review.users.username || `${review.users.wallet_address.slice(0, 6)}...${review.users.wallet_address.slice(-4)}`}
                    </p>
                    <p className="text-white/40 text-sm">{formatDate(review.created_at)}</p>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCategoryEmoji(review.category)}</span>
                {isOwner && (
                  <div className="flex gap-2">
                    <Link
                      href={`/reviews/${review.id}/edit`}
                      className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-6xl font-tanker text-plague-lime">{review.rating.toFixed(1)}</span>
              <span className="text-white/60 text-2xl">/10</span>
            </div>

            {/* Title and Subject */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{review.title}</h1>
            <p className="text-xl text-white/80 mb-8">
              <span className="text-white/60">Reviewing:</span> {review.subject_name}
            </p>

            {/* Content */}
            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-white/90 text-lg leading-relaxed whitespace-pre-wrap">
                {review.content}
              </p>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <button
                onClick={handleLike}
                disabled={!isAuthenticated}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isLiked
                    ? 'bg-plague-lime/20 text-plague-lime'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span>{isLiked ? '❤️' : '🤍'}</span>
                <span className="font-semibold">{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
              </button>

              {review.updated_at !== review.created_at && (
                <p className="text-white/40 text-sm">
                  Last updated: {formatDate(review.updated_at)}
                </p>
              )}
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
