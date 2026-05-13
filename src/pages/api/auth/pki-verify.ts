import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getUserPublicKeyById,
  getValidNonce,
  markNonceUsed,
  createRefreshToken,
  hashToken,
} from '@/db/auth';
import { verifyEd25519Signature } from '@/lib/auth/ed25519';
import { createAccessToken, generateRefreshToken } from '@/lib/auth/jwt';

interface VerifyRequest {
  keyId: string;
  nonce: string;
  signature: string;
}

interface VerifyResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { keyId, nonce, signature } = req.body as VerifyRequest;

    if (!keyId || typeof keyId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid keyId' });
    }

    if (!nonce || typeof nonce !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid nonce' });
    }

    if (!signature || typeof signature !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid signature' });
    }

    const publicKeyRecord = await getUserPublicKeyById(keyId);
    if (!publicKeyRecord) {
      return res.status(404).json({ error: 'Public key not found' });
    }

    const nonceRecord = await getValidNonce(nonce, keyId);
    if (!nonceRecord) {
      return res.status(401).json({ error: 'Invalid or expired nonce' });
    }

    const isValid = await verifyEd25519Signature(
      publicKeyRecord.publicKey,
      nonce,
      signature
    );

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    await markNonceUsed(nonceRecord.id);

    const accessToken = await createAccessToken({
      keyId,
      userId: publicKeyRecord.userId || undefined,
    });

    const refreshTokenRaw = generateRefreshToken();
    const refreshTokenHash = await hashToken(refreshTokenRaw);

    await createRefreshToken(keyId, refreshTokenHash, 30);

    return res.status(200).json({
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: 15 * 60,
      tokenType: 'Bearer',
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
