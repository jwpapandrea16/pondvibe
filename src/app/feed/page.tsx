'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ReviewFilters } from '@/components/reviews/ReviewFilters'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface Review {
  id: string
  title: string
  content: string
  rating: number
  category: string
  subject_name: string
  likes_count: number
  created_at: string
  users: {
    id: string
    wallet_address: string
    username: string | null
    profile_image_url: string | null
    has_plague_nft: boolean
  }
}

function FeedContent() {
  const { token, isAuthenticated } = useAuth()
  const searchParams = useSearchParams()
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const category = searchParams.get('category') || ''
  const nftContract = searchParams.get('nftContract') || ''
  const offset = parseInt(searchParams.get('offset') || '0')
  const limit = 20

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchFeed()
    } else {
      setIsLoading(false)
    }
  }, [category, nftContract, offset, isAuthenticated, token])

  const fetchFeed = async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (category) params.set('category', category)
      if (nftContract) params.set('nftContract', nftContract)

      const response = await fetch(`/api/feed?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch feed')
      }

      const data = await response.json()
      setReviews(data.reviews)
      setTotal(data.total)
    } catch (err) {
      console.error('Error fetching feed:', err)
      setError('Failed to load feed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="p-12 rounded-xl bg-plague-darkGray border border-black/10 text-center">
              <h1 className="text-3xl font-tanker text-black mb-4">Connect Your Wallet</h1>
              <p className="text-black/60 mb-6">
                You need to connect your wallet to view your personalized activity feed
              </p>
              <p className="text-black/40 text-sm">
                Click the "Connect Wallet" button in the header to get started
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-tanker text-black mb-4">
              Activity Feed
            </h1>
            <p className="text-black/60 text-lg">
              Reviews from Plague holders you follow
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-xl bg-plague-darkGray border border-black/10">
                <h2 className="text-xl font-tanker text-black mb-6">Filters</h2>
                <ReviewFilters />
              </div>
            </aside>

            {/* Feed List */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-64 rounded-xl bg-plague-darkGray animate-pulse"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="p-8 rounded-xl bg-white border border-red-500">
                  <p className="text-red-500 text-center">{error}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="p-12 rounded-xl bg-plague-darkGray border border-black/10 text-center">
                  <p className="text-black/60 text-lg mb-4">No reviews in your feed</p>
                  <p className="text-black/40 mb-6">
                    Follow other Plague holders to see their reviews here
                  </p>
                  <Link
                    href="/reviews"
                    className="inline-block px-6 py-3 bg-plague-green text-white font-bold rounded-lg hover:bg-plague-green/80 transition-all"
                  >
                    Explore Reviews
                  </Link>
                </div>
              ) : (
                <>
                  {/* Results Count */}
                  <div className="mb-6 text-white/60">
                    Showing {offset + 1} - {Math.min(offset + limit, total)} of {total} reviews
                  </div>

                  {/* Reviews Grid */}
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {total > limit && (
                    <div className="flex justify-center gap-4 mt-12">
                      {offset > 0 && (
                        <a
                          href={`/feed?${new URLSearchParams({
                            ...Object.fromEntries(searchParams.entries()),
                            offset: (offset - limit).toString(),
                          }).toString()}`}
                          className="px-6 py-3 bg-plague-lime text-black font-bold rounded-lg hover:bg-plague-yellow transition-all"
                        >
                          ← Previous
                        </a>
                      )}
                      {offset + limit < total && (
                        <a
                          href={`/feed?${new URLSearchParams({
                            ...Object.fromEntries(searchParams.entries()),
                            offset: (offset + limit).toString(),
                          }).toString()}`}
                          className="px-6 py-3 bg-plague-lime text-black font-bold rounded-lg hover:bg-plague-yellow transition-all"
                        >
                          Next →
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="p-12 rounded-xl bg-plague-darkGray text-center">
              <p className="text-black/60">Loading feed...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <FeedContent />
    </Suspense>
  )
}
