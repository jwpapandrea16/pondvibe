'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
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
  const { token, updateUser } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: user.username || '',
    bio: user.bio || '',
    profile_image_url: user.profile_image_url || '',
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
                    {user.username?.[0]?.toUpperCase() || user.wallet_address.slice(2, 4).toUpperCase()}
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
                      {user.username || `Frog ${user.wallet_address.slice(2, 8)}`}
                    </h1>
                    <p className="text-black/60 text-sm font-mono">
                      {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                    </p>
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
          <div className="p-4 rounded-lg bg-plague-lightGray border border-black/10">
            <p className="text-2xl font-tanker text-plague-green">{user.stats.nfts}</p>
            <p className="text-black/60 text-sm">Pond Vibe NFTs</p>
          </div>
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
