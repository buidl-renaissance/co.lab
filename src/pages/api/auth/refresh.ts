import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getValidRefreshToken,
  revokeRefreshToken,
  createRefreshToken,
  hashToken,
  getUserPublicKeyById,
} from '@/db/auth';
import { createAccessToken, generateRefreshToken } from '@/lib/auth/jwt';

interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
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
  res: NextApiResponse<RefreshResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { refreshToken } = req.body as RefreshRequest;

    if (!refreshToken || typeof refreshToken !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid refreshToken' });
    }

    const tokenHash = await hashToken(refreshToken);
    const existingToken = await getValidRefreshToken(tokenHash);

    if (!existingToken) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    await revokeRefreshToken(existingToken.id);

    const keyRecord = await getUserPublicKeyById(existingToken.keyId);

    const accessToken = await createAccessToken({
      keyId: existingToken.keyId,
      userId: keyRecord?.userId || undefined,
    });

    const newRefreshTokenRaw = generateRefreshToken();
    const newRefreshTokenHash = await hashToken(newRefreshTokenRaw);

    await createRefreshToken(existingToken.keyId, newRefreshTokenHash, 30);

    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshTokenRaw,
      expiresIn: 15 * 60,
      tokenType: 'Bearer',
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
