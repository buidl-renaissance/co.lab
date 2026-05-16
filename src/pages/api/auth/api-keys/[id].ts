import type { NextApiRequest, NextApiResponse } from 'next';
import { revokeApiKey } from '@/db/auth';
import { verifyAccessToken } from '@/lib/jwt';

interface RevokeApiKeyResponse {
  success: boolean;
  error?: string;
}

async function extractUserId(req: NextApiRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length);
  const payload = await verifyAccessToken(token);
  
  return payload?.sub || null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RevokeApiKeyResponse>
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const userId = await extractUserId(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Please provide a valid access token.',
    });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid API key ID',
      });
    }

    const revoked = await revokeApiKey(id, userId);
    if (!revoked) {
      return res.status(404).json({
        success: false,
        error: 'API key not found or already revoked',
      });
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
