'use client'

import { useEffect, useState } from 'react'
import { ReviewCard } from '@/components/reviews/ReviewCard'

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

interface UserReviewsProps {
  userId: string
  tab: 'reviews' | 'liked'
}

export function UserReviews({ userId, tab }: UserReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [userId, tab])

  const fetchReviews = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/reviews?userId=${userId}&limit=50`)

      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }

      const data = await response.json()
      setReviews(data.reviews)
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError('Failed to load reviews')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-plague-lightGray animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 rounded-xl bg-plague-lightGray border border-red-500 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="p-12 rounded-xl bg-plague-lightGray border border-white/10 text-center">
        <p className="text-white/60 text-lg">
          {tab === 'reviews' ? 'No reviews yet' : 'No liked reviews yet'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}
