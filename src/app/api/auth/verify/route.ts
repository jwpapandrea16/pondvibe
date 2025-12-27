import { NextRequest, NextResponse } from 'next/server'
import { verifySiweMessage } from '@/lib/auth/siwe'
import { generateToken } from '@/lib/auth/jwt'
import { createClient } from '@/lib/supabase/server'
import { getUserNFTs, checkPlagueOwnership } from '@/lib/alchemy/getNFTs'

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json()

    if (!message || !signature) {
      return NextResponse.json(
        { error: 'Message and signature are required' },
        { status: 400 }
      )
    }

    // Verify SIWE signature
    console.log('Verifying SIWE signature...')
    const verified = await verifySiweMessage(message, signature)

    if (!verified) {
      console.error('SIWE signature verification failed')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const walletAddress = verified.address.toLowerCase()
    console.log('Wallet verified:', walletAddress)

    // Check Plague NFT ownership
    console.log('Checking Plague NFT ownership...')
    const hasPlagueNFT = await checkPlagueOwnership(walletAddress)
    console.log('Has Plague NFT:', hasPlagueNFT)

    // Fetch all user NFTs
    console.log('Fetching user NFTs...')
    const nfts = await getUserNFTs(walletAddress)
    console.log('NFTs found:', nfts.length)

    // Get Supabase client
    console.log('Connecting to Supabase...')
    const supabase = await createClient()

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    let user

    if (existingUser) {
      console.log('Updating existing user...')
      // Update existing user
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          has_plague_nft: hasPlagueNFT,
          nfts_last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', walletAddress)
        .select()
        .single()

      if (error) {
        console.error('Error updating user:', error)
        throw error
      }
      user = updatedUser
    } else {
      console.log('Creating new user...')
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          has_plague_nft: hasPlagueNFT,
          nfts_last_synced_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        throw error
      }
      user = newUser
    }

    // Delete old NFTs
    await supabase
      .from('user_nfts')
      .delete()
      .eq('user_id', user.id)

    // Insert new NFTs
    if (nfts.length > 0) {
      await supabase.from('user_nfts').insert(
        nfts.map((nft) => ({
          user_id: user.id,
          contract_address: nft.contractAddress,
          token_id: nft.tokenId,
          collection_name: nft.collectionName,
          collection_slug: nft.collectionSlug,
          image_url: nft.imageUrl,
        }))
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      walletAddress: user.wallet_address,
      hasPlagueNFT: user.has_plague_nft,
    })

    console.log('Authentication successful for:', walletAddress)
    return NextResponse.json({
      token,
      user,
      hasPlagueNFT: user.has_plague_nft,
    })
  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { error: 'Authentication failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
