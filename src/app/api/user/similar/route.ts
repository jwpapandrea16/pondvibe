import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken, extractToken } from '@/lib/auth/jwt'

// GET /api/user/similar - Find users with similar interests
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

    const supabase = await createClient()

    // Get current user's interests
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('interests')
      .eq('id', payload.userId)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If no interests set, return empty array
    if (!currentUser.interests || Object.keys(currentUser.interests).length === 0) {
      return NextResponse.json([])
    }

    // Get all other users with interests
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, username, profile_image_url, wallet_address, discord_username, bio, interests')
      .neq('id', payload.userId)
      .not('interests', 'is', null)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // Calculate match counts in application code
    const currentInterests = currentUser.interests as Record<string, string[]>
    const categories = ['tv_show', 'movie', 'book', 'travel_destination']

    const similarUsers = (allUsers || [])
      .map(user => {
        const userInterests = user.interests as Record<string, string[]> || {}

        let matchCount = 0
        const sharedInterests: Record<string, string[]> = {
          tv_show: [],
          movie: [],
          book: [],
          travel_destination: []
        }

        // Calculate matches per category
        categories.forEach(category => {
          const currentCatInterests = currentInterests[category] || []
          const userCatInterests = userInterests[category] || []

          const matches = currentCatInterests.filter(interest =>
            userCatInterests.includes(interest)
          )

          matchCount += matches.length
          sharedInterests[category] = matches
        })

        return {
          id: user.id,
          username: user.username,
          profile_image_url: user.profile_image_url,
          wallet_address: user.wallet_address,
          discord_username: user.discord_username,
          bio: user.bio,
          match_count: matchCount,
          shared_interests: sharedInterests
        }
      })
      .filter(user => user.match_count >= 3) // Only users with 3+ matches
      .sort((a, b) => b.match_count - a.match_count) // Sort by match count
      .slice(0, 20) // Limit to top 20

    return NextResponse.json(similarUsers)
  } catch (error) {
    console.error('Error in GET /api/user/similar:', error)
    return NextResponse.json(
      { error: 'Failed to fetch similar users' },
      { status: 500 }
    )
  }
}
