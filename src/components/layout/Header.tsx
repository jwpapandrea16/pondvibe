'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { DiscordLoginButton } from '@/components/auth/DiscordLoginButton'

export function Header() {
  const { isAuthenticated, canCreateReview, user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <span className="text-2xl font-tanker text-plague-green">
            POND VIBE
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/reviews"
            className="text-black/80 hover:text-plague-green transition-colors"
          >
            Reviews
          </Link>
          <Link
            href="/users"
            className="text-black/80 hover:text-plague-green transition-colors"
          >
            Users
          </Link>
          <Link
            href="/feed"
            className="text-black/80 hover:text-plague-green transition-colors"
          >
            Feed
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href={`/profile/${user?.wallet_address || user?.discord_id}`}
                className="text-black/80 hover:text-plague-green transition-colors"
              >
                Profile
              </Link>
              {canCreateReview && (
                <Link
                  href="/reviews/new"
                  className="px-4 py-2 rounded-lg bg-plague-green text-white font-semibold hover:bg-plague-green/80 transition-colors"
                >
                  Write Review
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Discord Login Button */}
        <div className="flex items-center gap-3">
          {!isAuthenticated && <DiscordLoginButton />}
        </div>
      </div>
    </header>
  )
}
