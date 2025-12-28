'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { DiscordButton } from '@/components/auth/DiscordButton'

export function Header() {
  const { isAuthenticated, canCreateReview, user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <span className="text-2xl font-tanker text-plague-green">
                POND VIBE
              </span>
            </Link>
          </div>

          {/* Navigation - Absolutely Centered on Screen */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <Link
              href="/reviews"
              className="text-black/80 hover:text-plague-green transition-colors whitespace-nowrap"
            >
              Reviews
            </Link>
            <Link
              href="/users"
              className="text-black/80 hover:text-plague-green transition-colors whitespace-nowrap"
            >
              Users
            </Link>
            <Link
              href="/feed"
              className="text-black/80 hover:text-plague-green transition-colors whitespace-nowrap"
            >
              Feed
            </Link>
            {canCreateReview && (
              <Link
                href="/reviews/new"
                className="px-4 py-2 rounded-lg bg-plague-green text-white font-semibold hover:bg-plague-green/80 transition-colors whitespace-nowrap"
              >
                Write Review
              </Link>
            )}
          </nav>

          {/* Right side - Profile & Discord Button */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Link
                href={`/profile/${user?.wallet_address || user?.discord_id}`}
                className="flex items-center gap-2 text-black/80 hover:text-plague-green transition-colors"
              >
                {user?.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-plague-green object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-plague-green/20 border-2 border-plague-green flex items-center justify-center">
                    <span className="text-plague-green font-bold text-sm">
                      {user?.discord_username?.[0]?.toUpperCase() ||
                       user?.username?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <span className="font-semibold whitespace-nowrap">Profile</span>
              </Link>
            )}
            <DiscordButton />
          </div>
        </div>
      </div>
    </header>
  )
}
