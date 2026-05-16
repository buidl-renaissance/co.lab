import type { NextApiRequest, NextApiResponse } from 'next';
import { getPublicKeysByUser } from '@/db/auth';
import { verifyAccessToken } from '@/lib/jwt';

interface PublicKeyListResponse {
  success: boolean;
  data?: Array<{
    id: string;
    publicKey: string;
    label: string;
    createdAt: string;
  }>;
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
  res: NextApiResponse<PublicKeyListResponse>
) {
  if (req.method !== 'GET') {
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
    const keys = await getPublicKeysByUser(userId);

    return res.status(200).json({
      success: true,
      data: keys.map((key) => ({
        id: key.id,
        publicKey: key.publicKey,
        label: key.label,
        createdAt: key.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error listing public keys:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
