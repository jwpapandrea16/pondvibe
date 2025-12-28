/**
 * Discord OAuth and Role Verification
 */

const DISCORD_API_BASE = 'https://discord.com/api/v10'
const DISCORD_OAUTH_BASE = 'https://discord.com/oauth2'

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
}

export interface DiscordGuildMember {
  user: DiscordUser
  roles: string[]
  nick: string | null
}

/**
 * Generate Discord OAuth authorization URL
 */
export function getDiscordAuthUrl(redirectUri: string): string {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
  if (!clientId) {
    throw new Error('Discord client ID not configured')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify guilds guilds.members.read',
  })

  return `${DISCORD_OAUTH_BASE}/authorize?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; token_type: string }> {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Discord credentials not configured')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  })

  const response = await fetch(`${DISCORD_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Discord token exchange failed: ${error}`)
  }

  return response.json()
}

/**
 * Get user information from Discord
 */
export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Discord user')
  }

  return response.json()
}

/**
 * Check if user has a specific role in a guild
 */
export async function checkUserRole(
  accessToken: string,
  guildId: string,
  roleId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${DISCORD_API_BASE}/users/@me/guilds/${guildId}/member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      // User not in guild or insufficient permissions
      return false
    }

    const member: DiscordGuildMember = await response.json()
    return member.roles.includes(roleId)
  } catch (error) {
    console.error('Error checking Discord role:', error)
    return false
  }
}

/**
 * Verify user has "Frog Holder" role in Plague Brands Discord
 */
export async function verifyPlagueBrandsRole(
  accessToken: string
): Promise<boolean> {
  const guildId = process.env.DISCORD_PLAGUE_BRANDS_GUILD_ID
  const roleId = process.env.DISCORD_FROG_HOLDER_ROLE_ID

  if (!guildId || !roleId) {
    throw new Error('Plague Brands Discord configuration missing')
  }

  return checkUserRole(accessToken, guildId, roleId)
}
