import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken, extractToken } from '@/lib/auth/jwt'

type Params = Promise<{ id: string }>

// GET /api/reviews/[id] - Get single review
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
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
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/reviews/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

// PATCH /api/reviews/[id] - Update review
export async function PATCH(
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

    const body = await request.json()
    const { title, content, rating } = body

    const supabase = await createClient()

    // Check ownership
    const { data: review } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!review || review.user_id !== payload.userId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own reviews' },
        { status: 403 }
      )
    }

    // Update review
    const { data, error } = await supabase
      .from('reviews')
      .update({
        title,
        content,
        rating,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        users (
          id,
          wallet_address,
          username,
          profile_image_url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PATCH /api/reviews/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(
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

    // Check ownership
    const { data: review } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!review || review.user_id !== payload.userId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own reviews' },
        { status: 403 }
      )
    }

    // Delete review
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/reviews/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
