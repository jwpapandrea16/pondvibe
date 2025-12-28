import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken, extractToken } from '@/lib/auth/jwt'

// GET /api/feed - Activity feed from followed users
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')
    const nftContract = searchParams.get('nftContract')
    const followingOnly = searchParams.get('followingOnly') === 'true'

    const supabase = await createClient()

    // Build the base query for all reviews
    let query = supabase
      .from('reviews')
      .select(`
        *,
        users (
          id,
          wallet_address,
          username,
          profile_image_url,
          has_plague_nft
        )
      `, { count: 'exact' })

    // If followingOnly filter is enabled, filter to followed users
    if (followingOnly) {
      // Get list of users that current user follows
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', payload.userId)

      const followingIds = followingData?.map(f => f.following_id) || []

      // Include current user's own reviews in the feed
      const feedUserIds = [...followingIds, payload.userId]

      query = query.in('user_id', feedUserIds)
    }

    // Continue with pagination and ordering
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (nftContract) {
      query = query.eq('nft_gate_collection', nftContract)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching feed:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      reviews: data || [],
      total: count || 0,
      offset,
      limit,
    })
  } catch (error) {
    console.error('Error in GET /api/feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    )
  }
}
