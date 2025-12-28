import { NextResponse } from 'next/server'
import { getDiscordAuthUrl } from '@/lib/auth/discord'

export async function GET() {
  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`
    const authUrl = getDiscordAuthUrl(redirectUri)

    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error('Error generating Discord auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate Discord authorization URL' },
      { status: 500 }
    )
  }
}
