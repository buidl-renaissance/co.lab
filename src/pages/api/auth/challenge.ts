import type { NextApiRequest, NextApiResponse } from 'next';
import { createNonce, getUserPublicKeyById } from '@/db/auth';

interface ChallengeRequest {
  keyId: string;
}

interface ChallengeResponse {
  nonce: string;
  expiresAt: string;
}

interface ErrorResponse {
  error: string;
}

const NONCE_TTL_SECONDS = 60;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChallengeResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { keyId } = req.body as ChallengeRequest;

    if (!keyId || typeof keyId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid keyId' });
    }

    const key = await getUserPublicKeyById(keyId);
    if (!key) {
      return res.status(404).json({ error: 'Public key not found' });
    }

    const nonce = await createNonce(keyId, NONCE_TTL_SECONDS);

    return res.status(200).json({
      nonce: nonce.nonce,
      expiresAt: nonce.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error generating challenge:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
