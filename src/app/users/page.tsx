'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface User {
  id: string
  wallet_address: string
  username: string | null
  bio: string | null
  profile_image_url: string | null
  has_plague_nft: boolean
  created_at: string
  review_count: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users?limit=50')

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-tanker text-black mb-4">
              Community Members
            </h1>
            <p className="text-black/60 text-lg">
              Discover profiles of reviewers in the Plague community
            </p>
          </div>

          {/* Users Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-xl bg-plague-darkGray animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 rounded-xl bg-white border border-red-500">
              <p className="text-red-500 text-center">{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 rounded-xl bg-plague-darkGray border border-black/10 text-center">
              <p className="text-black/60 text-lg">No users found</p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-6 text-black/60">
                Showing {users.length} {users.length === 1 ? 'member' : 'members'}
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.wallet_address}`}
                    className="group"
                  >
                    <div className="p-6 rounded-xl bg-plague-darkGray border border-black/10 hover:border-plague-green transition-all hover:shadow-lg">
                      {/* Avatar */}
                      <div className="flex justify-center mb-4">
                        {user.profile_image_url ? (
                          <img
                            src={user.profile_image_url}
                            alt={user.username || 'Profile'}
                            className="w-24 h-24 rounded-full object-cover border-4 border-plague-green"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-plague-green/20 border-4 border-plague-green flex items-center justify-center">
                            <span className="text-plague-green font-tanker text-4xl">
                              {user.username?.[0]?.toUpperCase() || user.wallet_address.slice(2, 4).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="text-center">
                        <h3 className="text-xl font-tanker text-black mb-2 group-hover:text-plague-green transition-colors">
                          {user.username || `Frog ${user.wallet_address.slice(2, 8)}`}
                        </h3>

                        <p className="text-black/60 text-xs font-mono mb-3">
                          {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                        </p>

                        {user.bio && (
                          <p className="text-black/70 text-sm mb-4 line-clamp-2">
                            {user.bio}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-2xl font-tanker text-plague-green">{user.review_count}</span>
                            <span className="text-black/60">{user.review_count === 1 ? 'Review' : 'Reviews'}</span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center justify-center gap-2 mt-4">
                          {user.has_plague_nft && (
                            <span className="px-3 py-1 bg-plague-green/10 text-plague-green text-xs font-semibold rounded-full">
                              🐸 Plague Holder
                            </span>
                          )}
                        </div>

                        <p className="text-black/40 text-xs mt-4">
                          Joined {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
