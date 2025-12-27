'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface FollowButtonProps {
  userId: string
  initialFollowing?: boolean
  onFollowChange?: (following: boolean) => void
}

export function FollowButton({ userId, initialFollowing = false, onFollowChange }: FollowButtonProps) {
  const { token, user, isAuthenticated } = useAuth()
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)

  // Don't show button if viewing own profile
  if (user?.id === userId) {
    return null
  }

  const handleToggleFollow = async () => {
    if (!isAuthenticated || !token) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/follows/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.following)
        onFollowChange?.(data.following)
      } else {
        throw new Error('Failed to toggle follow')
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <button
        disabled
        className="px-6 py-2 bg-white/5 text-white/40 rounded-lg cursor-not-allowed"
      >
        Connect to Follow
      </button>
    )
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={`px-6 py-2 font-bold rounded-lg transition-all disabled:opacity-50 ${
        isFollowing
          ? 'bg-white/5 text-white hover:bg-white/10 border-2 border-white/10'
          : 'bg-plague-lime text-black hover:bg-plague-yellow'
      }`}
    >
      {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
