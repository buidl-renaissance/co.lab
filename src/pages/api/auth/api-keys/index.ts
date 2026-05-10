import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiKey, listApiKeys } from '@/db/auth';
import { verifyAccessToken } from '@/lib/jwt';

interface CreateApiKeyRequest {
  label: string;
  scopes: string[];
  expiresAt?: string;
}

interface ApiKeyListResponse {
  success: boolean;
  data?: Array<{
    id: string;
    keyPrefix: string;
    label: string;
    scopes: string[];
    lastUsedAt: string | null;
    expiresAt: string | null;
    createdAt: string;
  }>;
  error?: string;
}

interface CreateApiKeyResponse {
  success: boolean;
  data?: {
    id: string;
    rawKey: string;
    keyPrefix: string;
    label: string;
    scopes: string[];
    expiresAt: string | null;
    createdAt: string;
  };
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
  res: NextApiResponse<ApiKeyListResponse | CreateApiKeyResponse>
) {
  const userId = await extractUserId(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Please provide a valid access token.',
    });
  }

  if (req.method === 'GET') {
    try {
      const keys = await listApiKeys(userId);

      return res.status(200).json({
        success: true,
        data: keys.map((key) => ({
          id: key.id,
          keyPrefix: key.keyPrefix,
          label: key.label,
          scopes: key.scopes,
          lastUsedAt: key.lastUsedAt?.toISOString() || null,
          expiresAt: key.expiresAt?.toISOString() || null,
          createdAt: key.createdAt.toISOString(),
        })),
      });
    } catch (error) {
      console.error('Error listing API keys:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { label, scopes, expiresAt } = req.body as CreateApiKeyRequest;

      if (!label || !scopes || !Array.isArray(scopes)) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: label, scopes (array)',
        });
      }

      if (scopes.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one scope is required. Use ["*"] for full access.',
        });
      }

      const expiresAtDate = expiresAt ? new Date(expiresAt) : undefined;
      if (expiresAtDate && isNaN(expiresAtDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid expiresAt date format',
        });
      }

      const { apiKey, rawKey } = await createApiKey(userId, label, scopes, expiresAtDate);

      return res.status(201).json({
        success: true,
        data: {
          id: apiKey.id,
          rawKey,
          keyPrefix: apiKey.keyPrefix,
          label: apiKey.label,
          scopes: apiKey.scopes,
          expiresAt: apiKey.expiresAt?.toISOString() || null,
          createdAt: apiKey.createdAt.toISOString(),
        },
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
