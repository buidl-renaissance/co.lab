import * as ed from '@noble/ed25519';

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyEd25519Signature(
  publicKey: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    const publicKeyBytes = hexToBytes(publicKey);
    const signatureBytes = hexToBytes(signature);
    const messageBytes = new TextEncoder().encode(message);

    return await ed.verifyAsync(signatureBytes, messageBytes, publicKeyBytes);
  } catch (error) {
    console.error('Ed25519 signature verification error:', error);
    return false;
  }
}

export function isValidPublicKey(publicKey: string): boolean {
  try {
    const cleanKey = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey;
    if (cleanKey.length !== 64) {
      return false;
    }
    if (!/^[0-9a-fA-F]+$/.test(cleanKey)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
