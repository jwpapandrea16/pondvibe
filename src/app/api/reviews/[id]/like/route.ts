import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken, extractToken } from '@/lib/auth/jwt'

type Params = Promise<{ id: string }>

// POST /api/reviews/[id]/like - Toggle like on review
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params
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

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('review_likes')
      .select('id')
      .eq('review_id', id)
      .eq('user_id', payload.userId)
      .single()

    if (existingLike) {
      // Unlike - remove like
      await supabase
        .from('review_likes')
        .delete()
        .eq('review_id', id)
        .eq('user_id', payload.userId)

      // Decrement likes_count
      await supabase.rpc('decrement_likes_count', { review_id: id })

      return NextResponse.json({ liked: false })
    } else {
      // Like - add like
      await supabase
        .from('review_likes')
        .insert({
          review_id: id,
          user_id: payload.userId,
        })

      // Increment likes_count
      await supabase.rpc('increment_likes_count', { review_id: id })

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error in POST /api/reviews/[id]/like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}
