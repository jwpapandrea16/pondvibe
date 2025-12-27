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
    wallet_address: string
    username: string | null
    profile_image_url: string | null
    has_plague_nft: boolean
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
      whileHover={{ scale: 1.02, borderColor: 'rgba(200, 255, 0, 0.5)' }}
      transition={{ duration: 0.3 }}
      className="group p-6 rounded-xl bg-plague-lightGray border border-white/10"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/profile/${review.users.wallet_address}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-plague-lime/20 border-2 border-plague-lime flex items-center justify-center">
              <span className="text-plague-lime font-bold text-sm">
                {review.users.username?.[0]?.toUpperCase() || review.users.wallet_address.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                {review.users.username || `${review.users.wallet_address.slice(0, 6)}...${review.users.wallet_address.slice(-4)}`}
              </p>
              <p className="text-white/40 text-xs">{formatDate(review.created_at)}</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryEmoji(review.category)}</span>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-4xl font-tanker text-plague-lime">{review.rating.toFixed(1)}</span>
        <span className="text-white/60 text-lg">/10</span>
      </div>

      {/* Content */}
      <Link href={`/reviews/${review.id}`} className="block mb-4">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-plague-lime transition-colors">
          {review.title}
        </h3>
        <p className="text-white/80 text-sm mb-2">
          <span className="text-white/60">Reviewing:</span> {review.subject_name}
        </p>
        <p className="text-white/70 text-sm leading-relaxed">
          {truncateContent(review.content)}
        </p>
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <Link
          href={`/reviews/${review.id}`}
          className="text-plague-lime text-sm font-semibold hover:text-plague-yellow transition-colors"
        >
          Read full review →
        </Link>

        <button
          onClick={handleLike}
          disabled={!isAuthenticated || isLiking}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            isLiked
              ? 'bg-plague-lime/20 text-plague-lime'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
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
