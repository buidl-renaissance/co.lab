import { base64UrlDecode } from '@/db/auth';

export async function verifyEd25519Signature(
  publicKeyBase64: string,
  message: string,
  signatureBase64: string
): Promise<boolean> {
  try {
    const publicKeyBytes = base64UrlDecode(publicKeyBase64);
    const signatureBytes = base64UrlDecode(signatureBase64);
    const messageBytes = new TextEncoder().encode(message);

    if (publicKeyBytes.length !== 32) {
      console.error('Invalid Ed25519 public key length:', publicKeyBytes.length);
      return false;
    }

    if (signatureBytes.length !== 64) {
      console.error('Invalid Ed25519 signature length:', signatureBytes.length);
      return false;
    }

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        const publicKey = await crypto.subtle.importKey(
          'raw',
          publicKeyBytes,
          { name: 'Ed25519' },
          false,
          ['verify']
        );

        const isValid = await crypto.subtle.verify(
          'Ed25519',
          publicKey,
          signatureBytes,
          messageBytes
        );

        return isValid;
      } catch {
        console.log('WebCrypto Ed25519 not available, falling back to Node.js crypto');
      }
    }

    const { createPublicKey, verify } = await import('crypto');

    const publicKeyDer = Buffer.concat([
      Buffer.from([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00]),
      Buffer.from(publicKeyBytes)
    ]);

    const keyObject = createPublicKey({
      key: publicKeyDer,
      format: 'der',
      type: 'spki'
    });

    const isValid = verify(
      null,
      Buffer.from(messageBytes),
      keyObject,
      Buffer.from(signatureBytes)
    );

    return isValid;
  } catch (error) {
    console.error('Ed25519 signature verification error:', error);
    return false;
  }
}

export function isValidBase64UrlPublicKey(publicKey: string): boolean {
  try {
    const bytes = base64UrlDecode(publicKey);
    return bytes.length === 32;
  } catch {
    return false;
  }
}

export function formatPublicKeyForDisplay(publicKey: string): string {
  if (publicKey.length <= 12) return publicKey;
  return `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`;
}
