import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = Promise<{ address: string }>

// GET /api/user/profile/[address] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { address } = await params
    const supabase = await createClient()

    // Fetch user profile - check both wallet_address and discord_id
    let query = supabase
      .from('users')
      .select('*')

    // Try to find by wallet address first (if it looks like an address)
    if (address.startsWith('0x')) {
      query = query.eq('wallet_address', address.toLowerCase())
    } else {
      // Otherwise search by discord_id
      query = query.eq('discord_id', address)
    }

    const { data: user, error: userError } = await query.single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Count user's Plague NFTs (approved collections only)
    const PLAGUE_NFT_CONTRACT = process.env.NEXT_PUBLIC_PLAGUE_NFT_CONTRACT?.toLowerCase() || '0xc379e535caff250a01caa6c3724ed1359fe5c29b'
    const EXODUS_PLAGUE_CONTRACT = process.env.NEXT_PUBLIC_EXODUS_PLAGUE_CONTRACT?.toLowerCase() || '0xacc8a2dd94da0e45fb36455dc3aa5d9a4a002139'

    const { data: userNfts } = await supabase
      .from('user_nfts')
      .select('contract_address')
      .eq('user_id', user.id)

    // Filter to only Plague collections
    const plagueNfts = (userNfts || []).filter(nft => {
      const contractLower = nft.contract_address.toLowerCase()
      return contractLower === PLAGUE_NFT_CONTRACT || contractLower === EXODUS_PLAGUE_CONTRACT
    })
    const nftCount = plagueNfts.length

    // Count user's reviews
    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Count followers
    const { count: followerCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user.id)

    // Count following
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user.id)

    return NextResponse.json({
      ...user,
      stats: {
        nfts: nftCount || 0,
        reviews: reviewCount || 0,
        followers: followerCount || 0,
        following: followingCount || 0,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/user/profile/[address]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}
