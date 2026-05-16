import type { NextApiRequest, NextApiResponse } from 'next';
import { rotateRefreshToken } from '@/db/auth';
import { createAccessToken } from '@/lib/jwt';

interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
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
  res: NextApiResponse<RefreshResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { refreshToken } = req.body as RefreshRequest;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: refreshToken',
      });
    }

    const result = await rotateRefreshToken(refreshToken);
    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
      });
    }

    const accessToken = await createAccessToken(result.userId, ['*']);

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: result.newToken,
        expiresIn: 900,
        tokenType: 'Bearer',
      },
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
