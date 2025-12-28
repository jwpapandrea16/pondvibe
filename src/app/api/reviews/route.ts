import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken, extractToken } from '@/lib/auth/jwt'

// GET /api/reviews - List reviews with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const nftContract = searchParams.get('nftContract')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'recent'

    const supabase = await createClient()

    let query = supabase
      .from('reviews')
      .select(`
        *,
        users (
          id,
          wallet_address,
          discord_id,
          discord_username,
          username,
          profile_image_url,
          has_plague_nft
        )
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (nftContract) {
      query = query.eq('nft_gate_collection', nftContract)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    // Apply sorting
    if (sortBy === 'recent') {
      query = query.order('created_at', { ascending: false })
    } else if (sortBy === 'top_rated') {
      query = query.order('rating', { ascending: false })
    } else if (sortBy === 'most_liked') {
      query = query.order('likes_count', { ascending: false })
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch review counts for each unique user
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(r => r.user_id))]

      const reviewCountsPromises = userIds.map(async (userId) => {
        const { count } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
        return { userId, count: count || 0 }
      })

      const reviewCounts = await Promise.all(reviewCountsPromises)
      const reviewCountMap = Object.fromEntries(
        reviewCounts.map(({ userId, count }) => [userId, count])
      )

      // Add review_count to each user object
      data.forEach(review => {
        if (review.users) {
          (review.users as any).review_count = reviewCountMap[review.user_id] || 0
        }
      })
    }

    return NextResponse.json({
      reviews: data || [],
      total: count || 0,
      offset,
      limit,
    })
  } catch (error) {
    console.error('Error in GET /api/reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create new review
export async function POST(request: NextRequest) {
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

    // Check if user has Plague NFT
    if (!payload.hasPlagueNFT) {
      return NextResponse.json(
        { error: 'You need a Plague or Exodus Plague NFT to create reviews' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { category, title, content, rating, subject_name, subject_metadata, nft_gate_collection } = body

    // Validate required fields
    if (!category || !title || !content || rating === undefined || !subject_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate rating
    if (rating < 0 || rating > 10) {
      return NextResponse.json(
        { error: 'Rating must be between 0 and 10' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: payload.userId,
        category,
        title,
        content,
        rating,
        subject_name,
        subject_metadata: subject_metadata || null,
        nft_gate_collection: nft_gate_collection || null,
      })
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
      console.error('Error creating review:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/reviews:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
