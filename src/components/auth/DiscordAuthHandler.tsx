'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { useSearchParams, useRouter } from 'next/navigation'

export function DiscordAuthHandler() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get('token')
    const auth = searchParams.get('auth')
    const error = searchParams.get('error')
    const message = searchParams.get('message')

    if (error) {
      // Handle Discord auth errors
      if (error === 'missing_role') {
        showToast(
          message || 'You need the "Frog Holder" role in Plague Brands Discord.',
          'error',
          8000
        )
      } else {
        showToast('Discord authentication failed. Please try again.', 'error', 5000)
      }

      // Clean up URL
      router.replace('/')
      return
    }

    if (token && auth === 'discord') {
      // Decode and verify JWT token to get user data
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))

        // Create user object from JWT payload
        const user = {
          id: payload.userId,
          discord_id: payload.discordId,
          has_plague_nft: payload.hasPlagueNFT,
          // Add other fields as needed
        }

        login(token, user as any)
        showToast(
          'Successfully logged in with Discord! You can now write reviews.',
          'success',
          6000
        )

        // Clean up URL
        router.replace('/')
      } catch (error) {
        console.error('Failed to parse Discord auth token:', error)
        showToast('Authentication failed. Please try again.', 'error', 5000)
        router.replace('/')
      }
    }
  }, [searchParams, login, showToast, router])

  return null
}
