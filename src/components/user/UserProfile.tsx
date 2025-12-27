'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { FollowButton } from './FollowButton'

interface User {
  id: string
  wallet_address: string
  username: string | null
  bio: string | null
  profile_image_url: string | null
  has_plague_nft: boolean
  created_at: string
  stats: {
    nfts: number
    reviews: number
    followers: number
    following: number
  }
}

interface UserProfileProps {
  user: User
  isOwner: boolean
  onFollowToggle?: () => void
}

export function UserProfile({ user, isOwner, onFollowToggle }: UserProfileProps) {
  const { token } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: user.username || '',
    bio: user.bio || '',
    profile_image_url: user.profile_image_url || '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!token) return

    setIsSaving(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        const updated = await response.json()
        // Update the UI with new data
        user.username = updated.username
        user.bio = updated.bio
        user.profile_image_url = updated.profile_image_url
        setIsEditing(false)
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="p-8 rounded-xl bg-plague-darkGray border border-white/10">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.profile_image_url ? (
            <img
              src={user.profile_image_url}
              alt={user.username || 'Profile'}
              className="w-32 h-32 rounded-full object-cover border-4 border-plague-lime"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-plague-lime/20 border-4 border-plague-lime flex items-center justify-center">
              <span className="text-plague-lime font-tanker text-5xl">
                {user.username?.[0]?.toUpperCase() || user.wallet_address.slice(2, 4).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editData.username}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                placeholder="Username"
                className="w-full px-4 py-2 bg-plague-lightGray border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-plague-lime focus:outline-none"
              />
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                placeholder="Bio"
                rows={3}
                className="w-full px-4 py-2 bg-plague-lightGray border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-plague-lime focus:outline-none resize-none"
              />
              <input
                type="text"
                value={editData.profile_image_url}
                onChange={(e) => setEditData({ ...editData, profile_image_url: e.target.value })}
                placeholder="Profile image URL"
                className="w-full px-4 py-2 bg-plague-lightGray border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:border-plague-lime focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-plague-lime text-black font-bold rounded-lg hover:bg-plague-yellow transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border-2 border-white/10 text-white rounded-lg hover:border-white/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-tanker text-white mb-2">
                    {user.username || `Frog ${user.wallet_address.slice(2, 8)}`}
                  </h1>
                  <p className="text-white/60 text-sm font-mono">
                    {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                  </p>
                </div>
                {isOwner ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <FollowButton userId={user.id} onFollowChange={onFollowToggle} />
                )}
              </div>

              {user.bio && (
                <p className="text-white/80 mb-4">{user.bio}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-white/60">
                {user.has_plague_nft && (
                  <span className="flex items-center gap-1">
                    <span>🐸</span>
                    Plague Holder
                  </span>
                )}
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-plague-lightGray border border-white/10">
          <p className="text-2xl font-tanker text-plague-lime">{user.stats.nfts}</p>
          <p className="text-white/60 text-sm">NFTs</p>
        </div>
        <div className="p-4 rounded-lg bg-plague-lightGray border border-white/10">
          <p className="text-2xl font-tanker text-plague-lime">{user.stats.reviews}</p>
          <p className="text-white/60 text-sm">Reviews</p>
        </div>
        <div className="p-4 rounded-lg bg-plague-lightGray border border-white/10">
          <p className="text-2xl font-tanker text-plague-lime">{user.stats.followers}</p>
          <p className="text-white/60 text-sm">Followers</p>
        </div>
        <div className="p-4 rounded-lg bg-plague-lightGray border border-white/10">
          <p className="text-2xl font-tanker text-plague-lime">{user.stats.following}</p>
          <p className="text-white/60 text-sm">Following</p>
        </div>
      </div>
    </div>
  )
}
