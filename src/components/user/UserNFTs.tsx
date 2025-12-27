'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface NFT {
  id: string
  contract_address: string
  token_id: string
  collection_name: string | null
  collection_slug: string | null
  image_url: string | null
}

interface UserNFTsProps {
  userId: string
  walletAddress: string
}

export function UserNFTs({ userId, walletAddress }: UserNFTsProps) {
  const { token } = useAuth()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNFTs()
  }, [userId])

  const fetchNFTs = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data, error: nftError } = await supabase
        .from('user_nfts')
        .select('*')
        .eq('user_id', userId)
        .order('synced_at', { ascending: false })

      if (nftError) throw nftError

      setNfts(data || [])
    } catch (err) {
      console.error('Error fetching NFTs:', err)
      setError('Failed to load NFTs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    if (!token) return

    setIsSyncing(true)

    try {
      const response = await fetch('/api/user/nfts/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchNFTs()
      } else {
        throw new Error('Failed to sync NFTs')
      }
    } catch (err) {
      console.error('Error syncing NFTs:', err)
      alert('Failed to sync NFTs. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  // Group NFTs by collection
  const groupedNFTs = nfts.reduce((acc, nft) => {
    const key = nft.collection_name || nft.contract_address
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(nft)
    return acc
  }, {} as Record<string, NFT[]>)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-plague-lightGray animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 rounded-xl bg-plague-lightGray border border-red-500 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="p-12 rounded-xl bg-plague-lightGray border border-white/10 text-center">
        <p className="text-white/60 mb-4">No NFTs found</p>
        {token && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-6 py-3 bg-plague-lime text-black font-bold rounded-lg hover:bg-plague-yellow transition-all disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync NFTs'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Sync Button */}
      {token && (
        <div className="flex justify-end">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : '🔄 Sync NFTs'}
          </button>
        </div>
      )}

      {/* NFT Collections */}
      {Object.entries(groupedNFTs).map(([collectionName, collectionNFTs]) => (
        <div key={collectionName}>
          <h3 className="text-xl font-bold text-white mb-4">
            {collectionName} <span className="text-white/40 text-base">({collectionNFTs.length})</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {collectionNFTs.map((nft) => (
              <div
                key={nft.id}
                className="group aspect-square rounded-lg overflow-hidden bg-plague-lightGray border border-white/10 hover:border-plague-lime transition-all"
              >
                {nft.image_url ? (
                  <img
                    src={nft.image_url}
                    alt={`${nft.collection_name} #${nft.token_id}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/40">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-semibold">#{nft.token_id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
