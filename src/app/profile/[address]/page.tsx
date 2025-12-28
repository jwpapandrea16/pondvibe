'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { UserProfile } from '@/components/user/UserProfile'
import { UserNFTs } from '@/components/user/UserNFTs'
import { UserReviews } from '@/components/user/UserReviews'
import { UserInterests } from '@/components/user/UserInterests'
import { SimilarUsers } from '@/components/user/SimilarUsers'
import { useAuth } from '@/contexts/AuthContext'

interface User {
  id: string
  wallet_address: string | null
  discord_id?: string | null
  discord_username?: string | null
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

type Tab = 'nfts' | 'reviews'

export default function ProfilePage() {
  const params = useParams()
  const { user: currentUser } = useAuth()

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('reviews')

  const address = params.address as string
  const isOwner = (currentUser?.wallet_address?.toLowerCase() === address.toLowerCase()) ||
                  (currentUser?.discord_id === address)

  useEffect(() => {
    fetchUserProfile()
  }, [address])

  const fetchUserProfile = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user/profile/${address}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found')
        }
        throw new Error('Failed to fetch user profile')
      }

      const data = await response.json()
      setUser(data)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="h-96 rounded-xl bg-plague-lightGray animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="p-12 rounded-xl bg-plague-lightGray border border-red-500 text-center">
              <h1 className="text-2xl font-tanker text-black mb-4">Profile Not Found</h1>
              <p className="text-black/60">{error || 'The user you are looking for does not exist.'}</p>
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
        <div className="container mx-auto max-w-6xl space-y-8">
          {/* User Profile */}
          <UserProfile user={user} isOwner={isOwner} />

          {/* Interests Section */}
          <div className="space-y-6">
            {/* User's Interests */}
            {user.interests && Object.keys(user.interests).length > 0 && (
              <div className="p-8 rounded-xl bg-plague-darkGray border border-black/10">
                <UserInterests
                  interests={user.interests}
                  isEditing={false}
                  onChange={() => {}}
                />
              </div>
            )}

            {/* Similar Users - Only show on own profile */}
            {isOwner && <SimilarUsers />}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-black/10">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'reviews'
                  ? 'text-plague-green border-b-2 border-plague-green'
                  : 'text-black/60 hover:text-black'
              }`}
            >
              Reviews ({user.stats.reviews})
            </button>
            {user.wallet_address && (
              <button
                onClick={() => setActiveTab('nfts')}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === 'nfts'
                    ? 'text-plague-green border-b-2 border-plague-green'
                    : 'text-black/60 hover:text-black'
                }`}
              >
                Pond Vibe NFTs ({user.stats.nfts})
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'reviews' && <UserReviews userId={user.id} tab="reviews" />}
            {activeTab === 'nfts' && user.wallet_address && (
              <UserNFTs userId={user.id} walletAddress={user.wallet_address} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
