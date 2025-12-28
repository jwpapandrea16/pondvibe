'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { SimilarUser } from '@/types/database'
import Link from 'next/link'
import { INTEREST_CATEGORIES } from '@/lib/constants/interests'

export function SimilarUsers() {
  const { token, isAuthenticated } = useAuth()
  const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsLoading(false)
      return
    }

    fetchSimilarUsers()
  }, [token, isAuthenticated])

  const fetchSimilarUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/similar', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch similar users')
      }

      const data = await response.json()
      setSimilarUsers(data)
    } catch (err) {
      console.error('Error fetching similar users:', err)
      setError(err instanceof Error ? err.message : 'Failed to load similar users')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="p-8 rounded-xl bg-plague-darkGray border border-black/10">
        <div className="h-48 rounded-xl bg-plague-lightGray animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 rounded-xl bg-plague-darkGray border border-black/10">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    )
  }

  if (similarUsers.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-plague-darkGray border border-black/10">
        <h3 className="text-xl font-tanker text-black mb-2">Similar Users</h3>
        <p className="text-black/60 text-center">
          No users found with 3+ matching interests. Add more interests to find similar users!
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 rounded-xl bg-plague-darkGray border border-black/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-tanker text-black">
          Similar Users ({similarUsers.length})
        </h3>
        <p className="text-sm text-black/60">Based on shared interests</p>
      </div>

      <div className="space-y-4">
        {similarUsers.map(user => {
          const displayName = user.username || user.discord_username ||
            (user.wallet_address ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}` : 'Anonymous')

          const profileLink = user.wallet_address
            ? `/profile/${user.wallet_address}`
            : `/profile/${user.id}`

          return (
            <Link
              key={user.id}
              href={profileLink}
              className="block p-4 rounded-lg bg-plague-lightGray border border-black/10 hover:border-plague-green transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.profile_image_url ? (
                    <img
                      src={user.profile_image_url}
                      alt={displayName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-plague-green"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-plague-green/20 border-2 border-plague-green flex items-center justify-center">
                      <span className="text-plague-green font-tanker text-lg">
                        {displayName[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-black truncate">{displayName}</h4>
                    <span className="text-plague-green font-semibold text-sm">
                      {user.match_count} matches
                    </span>
                  </div>

                  {user.bio && (
                    <p className="text-black/60 text-sm mb-2 line-clamp-2">{user.bio}</p>
                  )}

                  {/* Shared Interests */}
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(user.shared_interests).map(([category, interests]) => {
                      if (interests.length === 0) return null

                      const categoryData = INTEREST_CATEGORIES[category as keyof typeof INTEREST_CATEGORIES]

                      return interests.map(interest => (
                        <span
                          key={`${category}-${interest}`}
                          className="text-xs px-2 py-1 rounded bg-plague-green/10 text-plague-green border border-plague-green/30"
                        >
                          {categoryData.emoji} {interest}
                        </span>
                      ))
                    })}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
