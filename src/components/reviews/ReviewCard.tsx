'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'

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
    wallet_address: string | null
    discord_id?: string | null
    discord_username?: string | null
    username: string | null
    profile_image_url: string | null
    has_plague_nft: boolean
    review_count?: number
  }
}

interface ReviewCardProps {
  review: Review
  onLikeToggle?: (reviewId: string, liked: boolean) => void
}

export function ReviewCard({ review, onLikeToggle }: ReviewCardProps) {
  const { isAuthenticated, token } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(review.likes_count)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (!isAuthenticated || !token) return

    setIsLiking(true)
    try {
      const response = await fetch(`/api/reviews/${review.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikesCount(prev => data.liked ? prev + 1 : prev - 1)
        onLikeToggle?.(review.id, data.liked)
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    } finally {
      setIsLiking(false)
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const truncateContent = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, borderColor: 'rgba(72, 144, 78, 0.5)' }}
      transition={{ duration: 0.3 }}
      className="group p-6 rounded-xl bg-plague-darkGray border border-black/10"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/profile/${review.users.wallet_address || review.users.discord_id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {review.users.profile_image_url ? (
              <img
                src={review.users.profile_image_url}
                alt={review.users.username || 'Profile'}
                className="w-10 h-10 rounded-full object-cover border-2 border-plague-green"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-plague-green/20 border-2 border-plague-green flex items-center justify-center">
                <span className="text-plague-green font-bold text-sm">
                  {review.users.username?.[0]?.toUpperCase() ||
                   review.users.discord_username?.[0]?.toUpperCase() ||
                   (review.users.wallet_address ? review.users.wallet_address.slice(2, 4).toUpperCase() : '?')}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-black font-semibold text-sm">
                  {review.users.username || review.users.discord_username ||
                   (review.users.wallet_address ? `${review.users.wallet_address.slice(0, 6)}...${review.users.wallet_address.slice(-4)}` : 'Anonymous')}
                </p>
                {review.users.review_count !== undefined && review.users.review_count > 0 && (
                  <span className="px-2 py-0.5 bg-plague-green/20 text-plague-green text-xs font-bold rounded-full">
                    {review.users.review_count} {review.users.review_count === 1 ? 'review' : 'reviews'}
                  </span>
                )}
              </div>
              <p className="text-black/40 text-xs">{formatDate(review.created_at)}</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryEmoji(review.category)}</span>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-4xl font-tanker text-plague-green">{review.rating.toFixed(1)}</span>
        <span className="text-black/60 text-lg">/10</span>
      </div>

      {/* Content */}
      <Link href={`/reviews/${review.id}`} className="block mb-4">
        <h3 className="text-xl font-bold text-black mb-2 group-hover:text-plague-green transition-colors">
          {review.title}
        </h3>
        <p className="text-black/80 text-sm mb-2">
          <span className="text-black/60">Reviewing:</span> {review.subject_name}
        </p>
        <p className="text-black/70 text-sm leading-relaxed">
          {truncateContent(review.content)}
        </p>
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-black/10">
        <Link
          href={`/reviews/${review.id}`}
          className="text-plague-green text-sm font-semibold hover:text-plague-green/80 transition-colors"
        >
          Read full review →
        </Link>

        <button
          onClick={handleLike}
          disabled={!isAuthenticated || isLiking}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            isLiked
              ? 'bg-plague-green/20 text-plague-green'
              : 'bg-black/5 text-black/60 hover:bg-black/10'
          } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span className={isLiked ? '❤️' : '🤍'}>
            {isLiked ? '❤️' : '🤍'}
          </span>
          <span className="text-sm font-semibold">{likesCount}</span>
        </button>
      </div>
    </motion.div>
  )
}
