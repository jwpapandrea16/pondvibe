import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/users - Get all users who have created reviews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    // Get all users who have created at least one review
    const { data: usersWithReviews, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        wallet_address,
        username,
        bio,
        profile_image_url,
        has_plague_nft,
        created_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // For each user, get their review count
    const usersWithStats = await Promise.all(
      (usersWithReviews || []).map(async (user) => {
        const { count: reviewCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        return {
          ...user,
          review_count: reviewCount || 0,
        }
      })
    )

    // Filter to only include users with at least one review
    const activeUsers = usersWithStats.filter(user => user.review_count > 0)

    // Get total count of users with reviews
    const { count: totalCount } = await supabase
      .from('reviews')
      .select('user_id', { count: 'exact', head: true })

    return NextResponse.json({
      users: activeUsers,
      total: activeUsers.length,
      offset,
      limit,
    })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
