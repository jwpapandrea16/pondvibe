import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/reviews/subjects?category=tv_show - Get distinct subject names for a category
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get distinct subject names for the category, ordered by most recent
    const { data, error } = await supabase
      .from('reviews')
      .select('subject_name')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subjects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get unique subject names (remove duplicates)
    const uniqueSubjects = Array.from(
      new Set(data.map(item => item.subject_name))
    ).slice(0, 20) // Limit to 20 most recent unique subjects

    return NextResponse.json({ subjects: uniqueSubjects })
  } catch (error) {
    console.error('Error in GET /api/reviews/subjects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}
