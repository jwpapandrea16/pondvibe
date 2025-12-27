'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface CreateReviewGuardProps {
  children: React.ReactNode
}

export function CreateReviewGuard({ children }: CreateReviewGuardProps) {
  const { isAuthenticated, canCreateReview } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="p-8 rounded-xl bg-plague-lightGray border border-white/10">
          <h2 className="text-2xl font-tanker text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-white/60 mb-6">
            You need to connect your Ethereum wallet to create reviews
          </p>
          <p className="text-white/40 text-sm">
            Click the "Connect Wallet" button in the header to get started
          </p>
        </div>
      </div>
    )
  }

  if (!canCreateReview) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="p-8 rounded-xl bg-plague-lightGray border border-plague-lime">
          <div className="text-6xl mb-4">🐸</div>
          <h2 className="text-2xl font-tanker text-white mb-4">
            Plague NFT Required
          </h2>
          <p className="text-white/80 mb-6">
            You need to own a <span className="text-plague-lime font-semibold">Plague</span> or{' '}
            <span className="text-plague-lime font-semibold">Exodus Plague NFT</span> to create reviews
          </p>
          <p className="text-white/60 mb-8 text-sm">
            This ensures quality content from verified community members
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://opensea.io/collection/the-plague"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-plague-lime text-black font-bold rounded-lg hover:bg-plague-yellow transition-all"
            >
              Get Plague NFT →
            </a>
            <a
              href="https://exodus.plaguebrands.io"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border-2 border-plague-lime text-plague-lime font-bold rounded-lg hover:bg-plague-lime/10 transition-colors"
            >
              Learn About Exodus
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
