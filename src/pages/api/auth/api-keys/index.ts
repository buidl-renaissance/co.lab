import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createApiKey,
  getApiKeysByKeyId,
  generateApiKeyToken,
  hashToken,
} from '@/db/auth';
import { verifyAccessToken } from '@/lib/auth/jwt';

interface CreateApiKeyRequest {
  name: string;
  scopes?: string[];
}

interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  createdAt: string;
}

interface ListApiKeysResponse {
  apiKeys: Array<{
    id: string;
    name: string;
    scopes: string[];
    lastUsedAt: string | null;
    createdAt: string;
  }>;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateApiKeyResponse | ListApiKeysResponse | ErrorResponse>
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice('Bearer '.length);
  const payload = await verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }

  const keyId = payload.keyId;

  if (req.method === 'POST') {
    return handleCreate(req, res, keyId);
  }

  if (req.method === 'GET') {
    return handleList(res, keyId);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleCreate(
  req: NextApiRequest,
  res: NextApiResponse<CreateApiKeyResponse | ErrorResponse>,
  keyId: string
) {
  try {
    const { name, scopes } = req.body as CreateApiKeyRequest;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Missing or invalid name' });
    }

    if (name.length > 100) {
      return res.status(400).json({ error: 'Name must be 100 characters or less' });
    }

    const validScopes = scopes && Array.isArray(scopes) ? scopes : ['*'];

    const rawKey = generateApiKeyToken();
    const keyHash = await hashToken(rawKey);

    const apiKey = await createApiKey({
      keyId,
      name: name.trim(),
      keyHash,
      scopes: validScopes,
    });

    return res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey,
      scopes: apiKey.scopes,
      createdAt: apiKey.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleList(
  res: NextApiResponse<ListApiKeysResponse | ErrorResponse>,
  keyId: string
) {
  try {
    const apiKeys = await getApiKeysByKeyId(keyId);

    return res.status(200).json({
      apiKeys: apiKeys.map((key) => ({
        id: key.id,
        name: key.name,
        scopes: key.scopes,
        lastUsedAt: key.lastUsedAt?.toISOString() || null,
        createdAt: key.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error listing API keys:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
