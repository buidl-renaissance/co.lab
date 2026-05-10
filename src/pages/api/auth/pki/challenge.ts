import type { NextApiRequest, NextApiResponse } from 'next';
import { createNonce, getPublicKeyByValue } from '@/db/auth';
import { isValidPublicKey } from '@/lib/ed25519';

interface ChallengeRequest {
  publicKey: string;
}

interface ChallengeResponse {
  success: boolean;
  data?: {
    nonce: string;
    expiresIn: number;
  };
  error?: string;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function getRateLimitKey(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChallengeResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const ip = getRateLimitKey(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Maximum 10 requests per minute.',
    });
  }

  try {
    const { publicKey } = req.body as ChallengeRequest;

    if (!publicKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: publicKey',
      });
    }

    if (!isValidPublicKey(publicKey)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid public key format',
      });
    }

    const normalizedKey = publicKey.startsWith('0x') ? publicKey.slice(2).toLowerCase() : publicKey.toLowerCase();

    const existingKey = await getPublicKeyByValue(normalizedKey);
    if (!existingKey) {
      return res.status(404).json({
        success: false,
        error: 'Public key not registered. Please register your key first.',
      });
    }

    const nonce = await createNonce(normalizedKey);

    return res.status(200).json({
      success: true,
      data: {
        nonce,
        expiresIn: 120,
      },
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
