'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  BookOpen,
  Users,
  Rss,
  User,
  PenSquare,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export function MobileRibbon() {
  const pathname = usePathname()
  const { isAuthenticated, canCreateReview, user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  const isActive = (path: string) => pathname === path || pathname.startsWith(path)

  const navItems = [
    {
      href: '/reviews',
      label: 'Reviews',
      icon: BookOpen,
      active: isActive('/reviews')
    },
    {
      href: '/users',
      label: 'Users',
      icon: Users,
      active: isActive('/users')
    },
    {
      href: '/feed',
      label: 'Feed',
      icon: Rss,
      active: isActive('/feed')
    },
  ]

  const profileItem = {
    href: isAuthenticated
      ? `/profile/${user?.wallet_address || user?.discord_id}`
      : '/profile',
    label: 'Profile',
    icon: User,
    active: isActive('/profile')
  }

  return (
    <>
      {/* Mobile Bottom Navigation - Main Items */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10 safe-area-bottom">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  item.active
                    ? 'text-plague-green'
                    : 'text-black/60 hover:text-plague-green'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* Profile with picture */}
          <Link
            href={profileItem.href}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              profileItem.active
                ? 'text-plague-green'
                : 'text-black/60 hover:text-plague-green'
            }`}
          >
            {isAuthenticated && user?.profile_image_url ? (
              <div className="relative">
                <img
                  src={user.profile_image_url}
                  alt="Profile"
                  className={`w-6 h-6 rounded-full object-cover ${
                    profileItem.active
                      ? 'ring-2 ring-plague-green'
                      : 'ring-1 ring-black/20'
                  }`}
                />
              </div>
            ) : isAuthenticated ? (
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                profileItem.active
                  ? 'bg-plague-green text-white'
                  : 'bg-plague-green/20 text-plague-green'
              }`}>
                <span className="text-xs font-bold">
                  {user?.discord_username?.[0]?.toUpperCase() ||
                   user?.username?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            ) : (
              <User className="w-5 h-5" />
            )}
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>

        {/* Floating Action Button for Write Review - Only on mobile if user can create reviews */}
        {canCreateReview && (
          <Link
            href="/reviews/new"
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-plague-green text-white flex items-center justify-center shadow-lg hover:bg-plague-green/90 transition-all hover:scale-105"
            aria-label="Write Review"
          >
            <PenSquare className="w-6 h-6" />
          </Link>
        )}
      </nav>

      {/* Add padding to bottom of page to prevent content from being hidden behind ribbon */}
      <div className="md:hidden h-16" aria-hidden="true" />
    </>
  )
}
