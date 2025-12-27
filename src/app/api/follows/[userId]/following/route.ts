import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = Promise<{ userId: string }>

// GET /api/follows/[userId]/following - Get users that this user follows
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
        following:users!follows_following_id_fkey (
          id,
          wallet_address,
          username,
          profile_image_url,
          has_plague_nft
        )
      `, { count: 'exact' })
      .eq('follower_id', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      following: data?.map(f => f.following) || [],
      total: count || 0,
      offset,
      limit,
    })
  } catch (error) {
    console.error('Error in GET /api/follows/[userId]/following:', error)
    return NextResponse.json(
      { error: 'Failed to fetch following' },
      { status: 500 }
    )
  }
}
