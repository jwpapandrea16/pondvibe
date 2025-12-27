import { alchemy } from './client'

// Plague NFT contract addresses
const PLAGUE_NFT_CONTRACT = process.env.NEXT_PUBLIC_PLAGUE_NFT_CONTRACT!.toLowerCase()
const EXODUS_PLAGUE_CONTRACT = process.env.NEXT_PUBLIC_EXODUS_PLAGUE_CONTRACT!.toLowerCase()

export interface NFTData {
  contractAddress: string
  tokenId: string
  collectionName: string
  collectionSlug: string
  imageUrl: string
  tokenType: string
}

/**
 * Fetch all NFTs owned by a wallet address
 */
export async function getUserNFTs(walletAddress: string): Promise<NFTData[]> {
  try {
    const nfts = await alchemy.nft.getNftsForOwner(walletAddress, {
      omitMetadata: false,
    })

    return nfts.ownedNfts.map((nft) => {
      // Safely access image data
      const imageUrl = nft.image?.thumbnailUrl || nft.image?.cachedUrl || nft.image?.originalUrl || ''

      return {
        contractAddress: nft.contract.address,
        tokenId: nft.tokenId,
        collectionName: nft.contract.name || 'Unknown',
        collectionSlug: nft.contract.symbol?.toLowerCase() || '',
        imageUrl,
        tokenType: nft.tokenType,
      }
    })
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    throw error
  }
}

/**
 * Check if wallet owns Plague OR Exodus Plague NFT
 */
export async function checkPlagueOwnership(walletAddress: string): Promise<boolean> {
  try {
    // Check for Plague NFT
    const plagueNFTs = await alchemy.nft.getNftsForOwner(walletAddress, {
      contractAddresses: [PLAGUE_NFT_CONTRACT],
    })

    if (plagueNFTs.ownedNfts.length > 0) {
      return true
    }

    // Check for Exodus Plague NFT
    const exodusNFTs = await alchemy.nft.getNftsForOwner(walletAddress, {
      contractAddresses: [EXODUS_PLAGUE_CONTRACT],
    })

    return exodusNFTs.ownedNfts.length > 0
  } catch (error) {
    console.error('Error checking Plague ownership:', error)
    return false
  }
}

/**
 * Check if wallet owns specific NFT collection
 */
export async function checkNFTOwnership(
  walletAddress: string,
  contractAddress: string
): Promise<boolean> {
  try {
    const nfts = await alchemy.nft.getNftsForOwner(walletAddress, {
      contractAddresses: [contractAddress.toLowerCase()],
    })
    return nfts.ownedNfts.length > 0
  } catch (error) {
    console.error('Error checking NFT ownership:', error)
    return false
  }
}
