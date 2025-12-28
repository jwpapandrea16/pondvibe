# Discord OAuth Setup Guide for PondVibe

This guide will help you set up Discord OAuth authentication to verify "Frog Holder" role in the "Plague Brands" Discord server.

## Prerequisites

- Access to "Plague Brands" Discord server
- Discord Developer Portal account
- Supabase project access

## Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "PondVibe" (or your preferred name)
4. Click "Create"

## Step 2: Configure OAuth2

1. In your Discord application, go to "OAuth2" → "General"
2. Copy your **Client ID** and **Client Secret**
3. Add the following Redirect URL:
   - For local development: `http://localhost:3000/api/auth/discord/callback`
   - For production: `https://pondvibe.com/api/auth/discord/callback`
4. Click "Save Changes"

## Step 3: Get Discord IDs

### Get Guild (Server) ID:
1. Open Discord and enable Developer Mode:
   - User Settings → Advanced → Developer Mode (toggle on)
2. Right-click on "Plague Brands" server icon
3. Click "Copy Server ID"
4. Save this ID

### Get Role ID:
1. In "Plague Brands" Discord, go to Server Settings → Roles
2. Find the "Frog Holder" role
3. Right-click the role name and select "Copy Role ID"
4. Save this ID

**Alternative method for Role ID:**
- Right-click on a user who has the "Frog Holder" role
- Their colored name indicates roles - right-click the color/role
- Select "Copy Role ID"

## Step 4: Update Environment Variables

Add the following to your `.env.local` file:

```env
# Discord OAuth Configuration
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here

# Plague Brands Discord Server Configuration
DISCORD_PLAGUE_BRANDS_GUILD_ID=your_guild_id_here
DISCORD_FROG_HOLDER_ROLE_ID=your_role_id_here
```

## Step 5: Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase_migration_discord.sql`
4. Paste and run the SQL commands
5. This adds `discord_id` and `discord_username` columns to the users table

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Click the "Login with Discord" button

4. You'll be redirected to Discord to authorize

5. After authorizing, you'll be redirected back to your site

6. If you have the "Frog Holder" role, you'll be logged in successfully!

## Troubleshooting

### "Missing role" error
- Verify you have the "Frog Holder" role in Plague Brands Discord
- Check that the Role ID is correct
- Ensure Developer Mode is enabled to copy IDs correctly

### "Discord authentication failed"
- Check that Client ID and Client Secret are correct
- Verify the Redirect URL matches exactly (including http/https)
- Ensure the Discord application has the correct OAuth2 scopes

### User can't write reviews after Discord login
- Verify the role check is working by checking server logs
- Ensure `has_plague_nft` is set to true for Discord-authenticated users
- Check that the Guild ID matches the "Plague Brands" server

## How It Works

1. User clicks "Login with Discord"
2. User is redirected to Discord OAuth page
3. User authorizes PondVibe to access their Discord info
4. Discord redirects back with authorization code
5. Backend exchanges code for access token
6. Backend checks if user has "Frog Holder" role in "Plague Brands"
7. If yes, user is created/updated and logged in
8. User can now write reviews!

## Security Notes

- **Never commit** `.env.local` to version control
- Keep your `DISCORD_CLIENT_SECRET` private
- The Discord OAuth flow uses industry-standard security practices
- Users only share their Discord ID, username, and roles - no sensitive data

## Production Deployment

When deploying to production:

1. Update the Redirect URL in Discord Developer Portal:
   ```
   https://pondvibe.com/api/auth/discord/callback
   ```

2. Add environment variables to your hosting platform (Vercel, etc.):
   - `NEXT_PUBLIC_DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_PLAGUE_BRANDS_GUILD_ID`
   - `DISCORD_FROG_HOLDER_ROLE_ID`

3. Update `NEXT_PUBLIC_APP_URL` to your production URL

## Support

If you encounter issues:
- Check Discord Developer Portal for application status
- Review server logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure Discord server IDs and role IDs are accurate
