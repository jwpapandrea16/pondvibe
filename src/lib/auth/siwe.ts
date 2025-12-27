import { SiweMessage } from 'siwe'

/**
 * Generate a random nonce for SIWE
 */
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}

/**
 * Verify SIWE message signature
 */
export async function verifySiweMessage(
  message: string,
  signature: string
): Promise<{ address: string; chainId: number } | null> {
  try {
    const siweMessage = new SiweMessage(message)
    console.log('SIWE message parsed:', {
      address: siweMessage.address,
      domain: siweMessage.domain,
      chainId: siweMessage.chainId
    })

    const fields = await siweMessage.verify({ signature })
    console.log('SIWE verify result:', fields)

    // In SIWE v3, the address and chainId are on the message object itself
    return {
      address: siweMessage.address,
      chainId: siweMessage.chainId,
    }
  } catch (error) {
    console.error('SIWE verification failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return null
  }
}
