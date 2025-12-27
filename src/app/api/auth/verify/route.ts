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
    const verified = await verifySiweMessage(message, signature)

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const walletAddress = verified.address.toLowerCase()

    // Check Plague NFT ownership
    const hasPlagueNFT = await checkPlagueOwnership(walletAddress)

    // Fetch all user NFTs
    const nfts = await getUserNFTs(walletAddress)

    // Get Supabase client
    const supabase = await createClient()

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    let user

    if (existingUser) {
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

      if (error) throw error
      user = updatedUser
    } else {
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

      if (error) throw error
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

    return NextResponse.json({
      token,
      user,
      hasPlagueNFT: user.has_plague_nft,
    })
  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
