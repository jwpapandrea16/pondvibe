'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ReviewFilters } from '@/components/reviews/ReviewFilters'

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

function ReviewsContent() {
  const searchParams = useSearchParams()
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const category = searchParams.get('category') || ''
  const nftContract = searchParams.get('nftContract') || ''
  const sortBy = searchParams.get('sortBy') || 'recent'
  const offset = parseInt(searchParams.get('offset') || '0')
  const limit = 20

  useEffect(() => {
    fetchReviews()
  }, [category, nftContract, sortBy, offset])

  const fetchReviews = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy,
      })

      if (category) params.set('category', category)
      if (nftContract) params.set('nftContract', nftContract)

      const response = await fetch(`/api/reviews?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }

      const data = await response.json()
      setReviews(data.reviews)
      setTotal(data.total)
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError('Failed to load reviews. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryName = (slug: string) => {
    const categoryMap: Record<string, string> = {
      tv_show: 'TV Shows',
      movie: 'Movies',
      book: 'Books',
      sports_team: 'Sports Teams',
      travel_destination: 'Travel Destinations',
    }
    return categoryMap[slug] || 'All Reviews'
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-tanker text-white glow-lime mb-4">
              {category ? getCategoryName(category) : 'All Reviews'}
            </h1>
            <p className="text-white/60 text-lg">
              Discover authentic reviews from the Plague community
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-xl bg-plague-darkGray border border-white/10">
                <h2 className="text-xl font-tanker text-white mb-6">Filters</h2>
                <ReviewFilters />
              </div>
            </aside>

            {/* Reviews List */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-64 rounded-xl bg-plague-lightGray animate-pulse"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="p-8 rounded-xl bg-plague-lightGray border border-red-500">
                  <p className="text-red-500 text-center">{error}</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="p-12 rounded-xl bg-plague-lightGray border border-white/10 text-center">
                  <p className="text-white/60 text-lg mb-4">No reviews found</p>
                  <p className="text-white/40">
                    Try adjusting your filters or be the first to write a review!
                  </p>
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
                          href={`/reviews?${new URLSearchParams({
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
                          href={`/reviews?${new URLSearchParams({
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
