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

// Plague NFT contract addresses
const PLAGUE_NFT_CONTRACT = process.env.NEXT_PUBLIC_PLAGUE_NFT_CONTRACT?.toLowerCase() || '0xc379e535caff250a01caa6c3724ed1359fe5c29b'
const EXODUS_PLAGUE_CONTRACT = process.env.NEXT_PUBLIC_EXODUS_PLAGUE_CONTRACT?.toLowerCase() || '0xacc8a2dd94da0e45fb36455dc3aa5d9a4a002139'

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

      // Filter to only show Plague and Exodus Plague NFTs
      const plagueNFTs = (data || []).filter(nft => {
        const contractLower = nft.contract_address.toLowerCase()
        return contractLower === PLAGUE_NFT_CONTRACT || contractLower === EXODUS_PLAGUE_CONTRACT
      })

      setNfts(plagueNFTs)
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
      <div className="p-12 rounded-xl bg-plague-lightGray border border-black/10 text-center">
        <p className="text-black/60 mb-4">No NFTs found</p>
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
            className="px-4 py-2 bg-black/5 text-black rounded-lg hover:bg-black/10 transition-colors disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : '🔄 Sync NFTs'}
          </button>
        </div>
      )}

      {/* NFT Collections */}
      {Object.entries(groupedNFTs).map(([collectionName, collectionNFTs]) => (
        <div key={collectionName}>
          <h3 className="text-xl font-bold text-black mb-4">
            {collectionName} <span className="text-black/40 text-base">({collectionNFTs.length})</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {collectionNFTs.map((nft) => (
              <div
                key={nft.id}
                className="aspect-square rounded-lg overflow-hidden bg-plague-lightGray border border-black/10"
              >
                {nft.image_url ? (
                  <img
                    src={nft.image_url}
                    alt={`${nft.collection_name} #${nft.token_id}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-black/40">No Image</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
