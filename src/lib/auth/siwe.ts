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
    const fields = await siweMessage.verify({ signature })

    return {
      address: fields.data.address,
      chainId: fields.data.chainId,
    }
  } catch (error) {
    console.error('SIWE verification failed:', error)
    return null
  }
}
