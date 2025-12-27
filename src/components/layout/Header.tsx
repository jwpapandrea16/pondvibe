'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import { SiweMessage } from 'siwe'
import { useSignMessage } from 'wagmi'

export function Header() {
  const { isAuthenticated, canCreateReview, login } = useAuth()
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { showToast } = useToast()

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && address && !isAuthenticated) {
      handleAuth()
    }
  }, [isConnected, address, isAuthenticated])

  const handleAuth = async () => {
    if (!address) return

    try {
      // Get nonce
      const nonceRes = await fetch('/api/auth/nonce', { method: 'POST' })
      const { nonce } = await nonceRes.json()

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Pond Vibe with your Ethereum wallet',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce,
      })

      const preparedMessage = message.prepareMessage()

      // Sign message
      const signature = await signMessageAsync({ message: preparedMessage })

      // Verify and login
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: preparedMessage, signature }),
      })

      const { token, user } = await verifyRes.json()
      login(token, user)
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }

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
          {isAuthenticated && (
            <>
              <Link
                href="/feed"
                className="text-black/80 hover:text-plague-green transition-colors"
              >
                Feed
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

        {/* Wallet Connect Button */}
        <div className="flex items-center gap-4">
          <ConnectButton
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
            showBalance={{
              smallScreen: false,
              largeScreen: false,
            }}
          />
        </div>
      </div>
    </header>
  )
}
