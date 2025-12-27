import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = Promise<{ userId: string }>

// GET /api/follows/[userId]/followers - Get user's followers
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { userId } = await params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    const { data, error, count } = await supabase
      .from('follows')
      .select(`
        id,
        created_at,
        follower:users!follows_follower_id_fkey (
          id,
          wallet_address,
          username,
          profile_image_url,
          has_plague_nft
        )
      `, { count: 'exact' })
      .eq('following_id', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      followers: data?.map(f => f.follower) || [],
      total: count || 0,
      offset,
      limit,
    })
  } catch (error) {
    console.error('Error in GET /api/follows/[userId]/followers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch followers' },
      { status: 500 }
    )
  }
}
