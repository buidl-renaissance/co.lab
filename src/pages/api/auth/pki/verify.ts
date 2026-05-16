import type { NextApiRequest, NextApiResponse } from 'next';
import { getPublicKeyByValue, verifyAndConsumeNonce, createRefreshToken } from '@/db/auth';
import { verifyEd25519Signature, isValidPublicKey } from '@/lib/ed25519';
import { createAccessToken } from '@/lib/jwt';

interface VerifyRequest {
  publicKey: string;
  signature: string;
  nonce: string;
}

interface VerifyResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { publicKey, signature, nonce } = req.body as VerifyRequest;

    if (!publicKey || !signature || !nonce) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: publicKey, signature, nonce',
      });
    }

    if (!isValidPublicKey(publicKey)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid public key format',
      });
    }

    const normalizedKey = publicKey.startsWith('0x') ? publicKey.slice(2).toLowerCase() : publicKey.toLowerCase();

    const userPublicKey = await getPublicKeyByValue(normalizedKey);
    if (!userPublicKey) {
      return res.status(404).json({
        success: false,
        error: 'Public key not registered',
      });
    }

    const nonceValid = await verifyAndConsumeNonce(normalizedKey, nonce);
    if (!nonceValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired nonce. Please request a new challenge.',
      });
    }

    const isValid = await verifyEd25519Signature(normalizedKey, signature, nonce);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid signature',
      });
    }

    const accessToken = await createAccessToken(userPublicKey.userId, ['*']);
    const refreshToken = await createRefreshToken(userPublicKey.userId);

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: 900,
        tokenType: 'Bearer',
      },
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
