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

    // Fetch user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', address.toLowerCase())
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Count user's NFTs
    const { count: nftCount } = await supabase
      .from('user_nfts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

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
