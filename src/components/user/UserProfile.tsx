'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { FollowButton } from './FollowButton'
import { UserInterests } from './UserInterests'

interface User {
  id: string
  wallet_address: string | null
  discord_id?: string | null
  discord_username?: string | null
  twitter_username?: string | null
  username: string | null
  bio: string | null
  profile_image_url: string | null
  has_plague_nft: boolean
  interests?: Record<string, string[]> | null
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
  const { token, updateUser } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: user.username || '',
    bio: user.bio || '',
    profile_image_url: user.profile_image_url || '',
    twitter_username: user.twitter_username || '',
    interests: user.interests || {},
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showSetupPrompt, setShowSetupPrompt] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Show setup prompt if user is owner and has no username
  useEffect(() => {
    if (isOwner && !user.username && !isEditing) {
      setShowSetupPrompt(true)
    }
  }, [isOwner, user.username, isEditing])

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error', 4000)
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be smaller than 2MB', 'error', 4000)
      return
    }

    setIsUploadingImage(true)

    try {
      // Create a canvas to resize the image
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        img.src = e.target?.result as string
      }

      img.onload = () => {
        // Resize to max 400x400 while maintaining aspect ratio
        const maxSize = 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to base64 (JPEG for better compression)
        const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85)

        // Update the form data
        setEditData(prev => ({ ...prev, profile_image_url: resizedBase64 }))
        showToast('Image uploaded! Click Save to update your profile.', 'success', 4000)
        setIsUploadingImage(false)
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      showToast('Failed to upload image', 'error', 4000)
      setIsUploadingImage(false)
    }
  }

  const handleSave = async () => {
    if (!token) return

    // Validate username
    if (editData.username.trim() && editData.username.length < 3) {
      showToast('Display name must be at least 3 characters', 'error', 4000)
      return
    }

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
        // Update the UI and auth context with new data
        user.username = updated.username
        user.bio = updated.bio
        user.profile_image_url = updated.profile_image_url
        user.twitter_username = updated.twitter_username
        user.interests = updated.interests
        updateUser(updated)
        setIsEditing(false)
        setShowSetupPrompt(false)
        showToast('Profile updated successfully!', 'success', 3000)
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast('Failed to update profile. Please try again.', 'error', 4000)
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-4">
      {/* Setup Prompt Banner */}
      {showSetupPrompt && !isEditing && (
        <div className="p-6 rounded-xl bg-plague-lime border-2 border-plague-green">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-tanker text-black mb-2">
                🎉 Welcome! Complete Your Profile
              </h3>
              <p className="text-black/70 text-sm mb-4">
                Set up your display name and profile picture to personalize your Pond Vibe experience.
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-plague-green text-white font-bold rounded-lg hover:bg-plague-green/80 transition-all"
              >
                Set Up Profile
              </button>
            </div>
            <button
              onClick={() => setShowSetupPrompt(false)}
              className="text-black/60 hover:text-black transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="p-8 rounded-xl bg-plague-darkGray border border-black/10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Avatar - Clickable in edit mode */}
          <div className="flex-shrink-0">
            <div
              onClick={handleImageClick}
              className={`relative ${isEditing ? 'cursor-pointer group' : ''}`}
            >
              {editData.profile_image_url || user.profile_image_url ? (
                <img
                  src={(editData.profile_image_url || user.profile_image_url) || ''}
                  alt={user.username || 'Profile'}
                  className="w-32 h-32 rounded-full object-cover border-4 border-plague-green"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-plague-green/20 border-4 border-plague-green flex items-center justify-center">
                  <span className="text-plague-green font-tanker text-5xl">
                    {user.username?.[0]?.toUpperCase() ||
                     user.discord_username?.[0]?.toUpperCase() ||
                     (user.wallet_address ? user.wallet_address.slice(2, 4).toUpperCase() : '?')}
                  </span>
                </div>
              )}

              {/* Upload overlay in edit mode */}
              {isEditing && (
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {isUploadingImage ? '⏳' : '📷 Upload'}
                  </span>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {isEditing && (
              <p className="text-xs text-black/50 text-center mt-2">
                Click to upload
              </p>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    placeholder="Enter your display name"
                    className="w-full px-4 py-2 bg-white border border-black/10 rounded-lg text-black placeholder:text-black/40 focus:border-plague-green focus:outline-none"
                    maxLength={30}
                  />
                  <p className="text-xs text-black/50 mt-1">At least 3 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                    rows={3}
                    className="w-full px-4 py-2 bg-white border border-black/10 rounded-lg text-black placeholder:text-black/40 focus:border-plague-green focus:outline-none resize-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-black/50 mt-1">{editData.bio.length}/200 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    X (Twitter) Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40">@</span>
                    <input
                      type="text"
                      value={editData.twitter_username}
                      onChange={(e) => {
                        // Remove @ symbol if user types it
                        const value = e.target.value.replace('@', '')
                        setEditData({ ...editData, twitter_username: value })
                      }}
                      placeholder="username"
                      className="w-full pl-8 pr-4 py-2 bg-white border border-black/10 rounded-lg text-black placeholder:text-black/40 focus:border-plague-green focus:outline-none"
                      maxLength={15}
                    />
                  </div>
                  <p className="text-xs text-black/50 mt-1">Your X (Twitter) handle without the @</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Interests
                  </label>
                  <UserInterests
                    interests={editData.interests}
                    isEditing={true}
                    onChange={(newInterests) => setEditData({ ...editData, interests: newInterests })}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-plague-green text-white font-bold rounded-lg hover:bg-plague-green/80 transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditData({
                        username: user.username || '',
                        bio: user.bio || '',
                        profile_image_url: user.profile_image_url || '',
                        twitter_username: user.twitter_username || '',
                        interests: user.interests || {},
                      })
                    }}
                    className="px-6 py-2 border-2 border-black/10 text-black rounded-lg hover:border-black/30 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-tanker text-black mb-2">
                      {user.username ||
                       user.discord_username ||
                       (user.wallet_address ? `Frog ${user.wallet_address.slice(2, 8)}` : 'Discord User')}
                    </h1>
                    {user.wallet_address && (
                      <p className="text-black/60 text-sm font-mono">
                        {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                      </p>
                    )}
                    {user.discord_id && !user.wallet_address && (
                      <p className="text-black/60 text-sm flex items-center gap-1">
                        <svg width="16" height="16" viewBox="0 0 71 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
                        </svg>
                        Discord User
                      </p>
                    )}
                  </div>
                  {isOwner ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-black/5 text-black rounded-lg hover:bg-black/10 transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <FollowButton userId={user.id} onFollowChange={onFollowToggle} />
                  )}
                </div>

                {user.bio && (
                  <p className="text-black/80 mb-4">{user.bio}</p>
                )}

                {/* Social Links */}
                {user.twitter_username && (
                  <div className="mb-4">
                    <a
                      href={`https://x.com/${user.twitter_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition-colors text-sm font-semibold"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      @{user.twitter_username}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-black/60">
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
          {user.wallet_address && (
            <div className="p-4 rounded-lg bg-plague-lightGray border border-black/10">
              <p className="text-2xl font-tanker text-plague-green">{user.stats.nfts}</p>
              <p className="text-black/60 text-sm">Pond Vibe NFTs</p>
            </div>
          )}
          <div className="p-4 rounded-lg bg-plague-lightGray border border-black/10">
            <p className="text-2xl font-tanker text-plague-green">{user.stats.reviews}</p>
            <p className="text-black/60 text-sm">Reviews</p>
          </div>
          <div className="p-4 rounded-lg bg-plague-lightGray border border-black/10">
            <p className="text-2xl font-tanker text-plague-green">{user.stats.followers}</p>
            <p className="text-black/60 text-sm">Followers</p>
          </div>
          <div className="p-4 rounded-lg bg-plague-lightGray border border-black/10">
            <p className="text-2xl font-tanker text-plague-green">{user.stats.following}</p>
            <p className="text-black/60 text-sm">Following</p>
          </div>
        </div>
      </div>
    </div>
  )
}
