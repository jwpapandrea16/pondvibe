import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken, extractToken } from '@/lib/auth/jwt'

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { username, bio, profile_image_url, interests } = body

    // Validate interests structure if provided
    if (interests !== undefined) {
      const validCategories = ['tv_show', 'movie', 'book', 'travel_destination']
      for (const category of Object.keys(interests)) {
        if (!validCategories.includes(category)) {
          return NextResponse.json(
            { error: `Invalid category: ${category}` },
            { status: 400 }
          )
        }
        if (!Array.isArray(interests[category])) {
          return NextResponse.json(
            { error: `Category ${category} must be an array` },
            { status: 400 }
          )
        }
      }
    }

    const supabase = await createClient()

    // Build update object conditionally
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (username !== undefined) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (profile_image_url !== undefined) updateData.profile_image_url = profile_image_url
    if (interests !== undefined) updateData.interests = interests

    // Update profile
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', payload.userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PATCH /api/user/profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
