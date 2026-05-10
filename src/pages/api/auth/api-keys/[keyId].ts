import type { NextApiRequest, NextApiResponse } from 'next';
import { getApiKeyById, revokeApiKey } from '@/db/auth';
import { verifyAccessToken } from '@/lib/auth/jwt';

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  success: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice('Bearer '.length);
  const payload = await verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }

  try {
    const { keyId: apiKeyId } = req.query;

    if (!apiKeyId || typeof apiKeyId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid API key ID' });
    }

    const apiKey = await getApiKeyById(apiKeyId);
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    if (apiKey.keyId !== payload.keyId) {
      return res.status(403).json({ error: 'Not authorized to revoke this API key' });
    }

    if (apiKey.revoked) {
      return res.status(400).json({ error: 'API key is already revoked' });
    }

    const revoked = await revokeApiKey(apiKeyId);
    if (!revoked) {
      return res.status(500).json({ error: 'Failed to revoke API key' });
    }

    return res.status(200).json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
