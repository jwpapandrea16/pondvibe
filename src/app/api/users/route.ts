import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken, extractToken } from '@/lib/auth/jwt'

// GET /api/users - Get all users who have created reviews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check if user is authenticated (optional)
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader)
    let currentUserId: string | null = null
    let currentUserInterests: Record<string, string[]> | null = null

    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        currentUserId = payload.userId

        // Get current user's interests
        const supabase = await createClient()
        const { data: currentUser } = await supabase
          .from('users')
          .select('interests')
          .eq('id', currentUserId)
          .single()

        if (currentUser?.interests) {
          currentUserInterests = currentUser.interests as Record<string, string[]>
        }
      }
    }

    const supabase = await createClient()

    // Get all users who have created at least one review
    const { data: usersWithReviews, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        wallet_address,
        discord_id,
        discord_username,
        username,
        bio,
        profile_image_url,
        has_plague_nft,
        interests,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // For each user, get their review count and calculate similarity
    const usersWithStats = await Promise.all(
      (usersWithReviews || []).map(async (user) => {
        const { count: reviewCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        let similarityScore = 0

        // Calculate similarity score if current user is authenticated and has interests
        if (currentUserId && currentUserInterests && user.id !== currentUserId && user.interests) {
          const categories = ['tv_show', 'movie', 'book', 'travel_destination']
          const userInterests = user.interests as Record<string, string[]>

          categories.forEach(category => {
            const currentCatInterests = currentUserInterests[category] || []
            const userCatInterests = userInterests[category] || []

            const matches = currentCatInterests.filter(interest =>
              userCatInterests.includes(interest)
            )

            similarityScore += matches.length
          })
        }

        return {
          ...user,
          review_count: reviewCount || 0,
          similarity_score: similarityScore,
        }
      })
    )

    // Filter to only include users with at least one review
    const activeUsers = usersWithStats.filter(user => user.review_count > 0)

    // Sort by similarity score if user is authenticated with interests, otherwise by created_at
    if (currentUserId && currentUserInterests) {
      activeUsers.sort((a, b) => b.similarity_score - a.similarity_score)
    }

    // Apply pagination after sorting
    const paginatedUsers = activeUsers.slice(offset, offset + limit)

    // Get total count of users with reviews
    const { count: totalCount } = await supabase
      .from('reviews')
      .select('user_id', { count: 'exact', head: true })

    return NextResponse.json({
      users: paginatedUsers,
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
