import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createUserPublicKey,
  getUserPublicKeyByPublicKey,
} from '@/db/auth';
import { isValidBase64UrlPublicKey } from '@/lib/auth/ed25519';

interface RegisterKeyRequest {
  publicKey: string;
  userId?: string;
  label?: string;
}

interface RegisterKeyResponse {
  keyId: string;
  publicKey: string;
  label: string | null;
  createdAt: string;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterKeyResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicKey, userId, label } = req.body as RegisterKeyRequest;

    if (!publicKey || typeof publicKey !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid publicKey' });
    }

    if (!isValidBase64UrlPublicKey(publicKey)) {
      return res.status(400).json({
        error: 'Invalid Ed25519 public key format. Must be 32 bytes, base64url-encoded.',
      });
    }

    const existing = await getUserPublicKeyByPublicKey(publicKey);
    if (existing) {
      return res.status(200).json({
        keyId: existing.id,
        publicKey: existing.publicKey,
        label: existing.label,
        createdAt: existing.createdAt.toISOString(),
      });
    }

    const key = await createUserPublicKey({
      publicKey,
      userId,
      label,
    });

    return res.status(201).json({
      keyId: key.id,
      publicKey: key.publicKey,
      label: key.label,
      createdAt: key.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error registering public key:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
