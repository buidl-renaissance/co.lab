import type { NextApiRequest, NextApiResponse } from 'next';
import { registerPublicKey, getPublicKeyByValue } from '@/db/auth';
import { isValidPublicKey } from '@/lib/ed25519';

interface RegisterKeyRequest {
  userId: string;
  publicKey: string;
  label: string;
}

interface RegisterKeyResponse {
  success: boolean;
  data?: {
    id: string;
    publicKey: string;
    label: string;
    createdAt: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterKeyResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { userId, publicKey, label } = req.body as RegisterKeyRequest;

    if (!userId || !publicKey || !label) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, publicKey, label',
      });
    }

    if (!isValidPublicKey(publicKey)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid public key format. Must be a 64-character hex string (32 bytes Ed25519 public key)',
      });
    }

    const normalizedKey = publicKey.startsWith('0x') ? publicKey.slice(2).toLowerCase() : publicKey.toLowerCase();

    const existingKey = await getPublicKeyByValue(normalizedKey);
    if (existingKey) {
      return res.status(409).json({
        success: false,
        error: 'Public key already registered',
      });
    }

    const userPublicKey = await registerPublicKey(userId, normalizedKey, label);

    return res.status(201).json({
      success: true,
      data: {
        id: userPublicKey.id,
        publicKey: userPublicKey.publicKey,
        label: userPublicKey.label,
        createdAt: userPublicKey.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error registering public key:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
