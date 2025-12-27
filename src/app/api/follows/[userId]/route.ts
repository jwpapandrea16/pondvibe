import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken, extractToken } from '@/lib/auth/jwt'

type Params = Promise<{ userId: string }>

// POST /api/follows/[userId] - Toggle follow/unfollow
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { userId: targetUserId } = await params
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Can't follow yourself
    if (payload.userId === targetUserId) {
      return NextResponse.json(
        { error: 'You cannot follow yourself' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', payload.userId)
      .eq('following_id', targetUserId)
      .single()

    if (existingFollow) {
      // Unfollow - remove follow relationship
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', payload.userId)
        .eq('following_id', targetUserId)

      if (error) throw error

      return NextResponse.json({ following: false })
    } else {
      // Follow - create follow relationship
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: payload.userId,
          following_id: targetUserId,
        })

      if (error) throw error

      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error('Error in POST /api/follows/[userId]:', error)
    return NextResponse.json(
      { error: 'Failed to toggle follow' },
      { status: 500 }
    )
  }
}
