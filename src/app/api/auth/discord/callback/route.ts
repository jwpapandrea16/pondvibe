import { NextRequest, NextResponse } from 'next/server'
import {
  exchangeCodeForToken,
  getDiscordUser,
  verifyPlagueBrandsRole,
} from '@/lib/auth/discord'
import { generateToken } from '@/lib/auth/jwt'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('Discord OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}?error=discord_auth_failed`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}?error=missing_code`
      )
    }

    // Exchange code for access token
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`
    console.log('=== Discord OAuth Debug ===')
    console.log('Redirect URI:', redirectUri)
    console.log('Client ID:', process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID)
    console.log('Has Client Secret:', !!process.env.DISCORD_CLIENT_SECRET)
    console.log('Authorization code:', code?.substring(0, 10) + '...')

    const { access_token } = await exchangeCodeForToken(code, redirectUri)

    // Get Discord user information
    const discordUser = await getDiscordUser(access_token)
    console.log('Discord user authenticated:', discordUser.username)

    // Verify user has "Frog Holder" role in Plague Brands
    // Users can still create profiles without the role, but cannot write reviews
    const hasFrogHolderRole = await verifyPlagueBrandsRole(access_token)
    console.log('Has Frog Holder role:', hasFrogHolderRole)

    // Get Supabase client
    const supabase = await createClient()

    // Check if user exists by Discord ID
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('discord_id', discordUser.id)
      .single()

    let user

    if (existingUser) {
      console.log('Updating existing Discord user...')
      // Update existing user
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          discord_username: discordUser.discriminator !== '0'
            ? `${discordUser.username}#${discordUser.discriminator}`
            : discordUser.username,
          has_plague_nft: hasFrogHolderRole, // Only true if verified via Discord role
          updated_at: new Date().toISOString(),
        })
        .eq('discord_id', discordUser.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating Discord user:', error)
        throw error
      }
      user = updatedUser
    } else {
      console.log('Creating new Discord user...')
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          discord_id: discordUser.id,
          discord_username: discordUser.discriminator !== '0'
            ? `${discordUser.username}#${discordUser.discriminator}`
            : discordUser.username,
          has_plague_nft: hasFrogHolderRole, // Only true if verified via Discord role
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating Discord user:', error)
        throw error
      }
      user = newUser
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      discordId: discordUser.id,
      hasPlagueNFT: hasFrogHolderRole, // Reflects actual role status
    })

    // Redirect to home with token
    const redirectUrl = new URL(process.env.NEXT_PUBLIC_APP_URL!)
    redirectUrl.searchParams.set('token', token)
    redirectUrl.searchParams.set('auth', 'discord')

    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error('Discord OAuth callback error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?error=discord_callback_failed&message=${encodeURIComponent(
        errorMessage
      )}`
    )
  }
}
