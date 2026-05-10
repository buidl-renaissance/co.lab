import type { NextApiRequest } from 'next';
import { verifyAccessToken } from '@/lib/auth/jwt';
import {
  getValidApiKeyByHash,
  updateApiKeyLastUsed,
  hashToken,
} from '@/db/auth';

export interface AuthenticatedUser {
  keyId: string;
  userId?: string;
  scopes: string[];
  authMethod: 'jwt' | 'api_key';
}

export interface AuthResult {
  authenticated: boolean;
  user?: AuthenticatedUser;
  error?: string;
  statusCode?: number;
}

export async function authenticateMcpRequest(
  req: NextApiRequest
): Promise<AuthResult> {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length);

    if (token.startsWith('clb_')) {
      return authenticateApiKey(token);
    }

    return authenticateJwt(token);
  }

  if (apiKeyHeader) {
    return authenticateApiKey(apiKeyHeader);
  }

  return {
    authenticated: false,
    error: 'Missing authentication. Provide Authorization: Bearer <token> or X-API-Key header.',
    statusCode: 401,
  };
}

async function authenticateJwt(token: string): Promise<AuthResult> {
  const payload = await verifyAccessToken(token);

  if (!payload) {
    return {
      authenticated: false,
      error: 'Invalid or expired JWT token',
      statusCode: 401,
    };
  }

  return {
    authenticated: true,
    user: {
      keyId: payload.keyId,
      userId: payload.userId,
      scopes: payload.scopes || ['*'],
      authMethod: 'jwt',
    },
  };
}

async function authenticateApiKey(rawKey: string): Promise<AuthResult> {
  const keyHash = await hashToken(rawKey);
  const apiKey = await getValidApiKeyByHash(keyHash);

  if (!apiKey) {
    return {
      authenticated: false,
      error: 'Invalid or revoked API key',
      statusCode: 401,
    };
  }

  updateApiKeyLastUsed(apiKey.id).catch((err) => {
    console.error('Failed to update API key last used:', err);
  });

  return {
    authenticated: true,
    user: {
      keyId: apiKey.keyId,
      scopes: apiKey.scopes,
      authMethod: 'api_key',
    },
  };
}

export function checkToolScope(
  user: AuthenticatedUser,
  toolName: string
): { allowed: boolean; error?: string } {
  if (user.scopes.includes('*')) {
    return { allowed: true };
  }

  if (user.scopes.includes(`tool:${toolName}`)) {
    return { allowed: true };
  }

  const toolCategory = getToolCategory(toolName);
  if (toolCategory && user.scopes.includes(`category:${toolCategory}`)) {
    return { allowed: true };
  }

  if (user.scopes.includes('read') && isReadOnlyTool(toolName)) {
    return { allowed: true };
  }

  if (user.scopes.includes('write') && isWriteTool(toolName)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    error: `Access denied: insufficient scope for tool '${toolName}'`,
  };
}

function getToolCategory(toolName: string): string | null {
  const categoryMap: Record<string, string> = {
    listCollaborations: 'collaboration',
    getCollaboration: 'collaboration',
    createCollaboration: 'collaboration',
    createCollaborationFromTranscript: 'collaboration',
    updateCollaboration: 'collaboration',
    deleteCollaboration: 'collaboration',
    listCollaborationsByUsername: 'collaboration',

    getUserByFid: 'user',
    getUserByUsername: 'user',

    listGithubRepos: 'github',
    getGithubIssueLinks: 'github',
  };

  return categoryMap[toolName] || null;
}

function isReadOnlyTool(toolName: string): boolean {
  const readTools = [
    'listCollaborations',
    'getCollaboration',
    'listCollaborationsByUsername',
    'getUserByFid',
    'getUserByUsername',
    'listGithubRepos',
    'getGithubIssueLinks',
  ];

  return readTools.includes(toolName);
}

function isWriteTool(toolName: string): boolean {
  const writeTools = [
    'createCollaboration',
    'createCollaborationFromTranscript',
    'updateCollaboration',
    'deleteCollaboration',
  ];

  return writeTools.includes(toolName);
}

export function createAuthErrorResponse(
  id: unknown,
  statusCode: number,
  message: string
) {
  return {
    jsonrpc: '2.0' as const,
    id,
    error: {
      code: statusCode,
      message,
    },
  };
}
