import type { NextApiRequest } from 'next';
import { verifyAccessToken } from '@/lib/jwt';
import { validateApiKey } from '@/db/auth';

export interface McpUser {
  userId: string;
  scopes: string[];
  authMethod: 'jwt' | 'api_key' | 'legacy';
}

export interface McpAuthResult {
  success: boolean;
  user?: McpUser;
  error?: string;
}

export async function validateMcpRequest(req: NextApiRequest): Promise<McpAuthResult> {
  const legacyApiKey = process.env.MCP_API_KEY;
  const authHeader = req.headers.authorization;
  const legacyHeaderKey =
    req.headers['x-mcp-api-key'] ||
    req.headers['x-mcp-api-key'.toLowerCase()];

  if (legacyApiKey && (legacyHeaderKey === legacyApiKey)) {
    return {
      success: true,
      user: {
        userId: 'legacy',
        scopes: ['*'],
        authMethod: 'legacy',
      },
    };
  }

  if (!authHeader) {
    if (legacyApiKey) {
      return {
        success: false,
        error: 'Missing authentication. Provide Authorization header with Bearer token or API key.',
      };
    }
    return {
      success: true,
      user: {
        userId: 'anonymous',
        scopes: ['*'],
        authMethod: 'legacy',
      },
    };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      error: 'Invalid Authorization header format. Use: Bearer <token>',
    };
  }

  const token = authHeader.slice('Bearer '.length);

  if (legacyApiKey && token === legacyApiKey) {
    return {
      success: true,
      user: {
        userId: 'legacy',
        scopes: ['*'],
        authMethod: 'legacy',
      },
    };
  }

  if (token.startsWith('clb_')) {
    const result = await validateApiKey(token);
    if (result) {
      return {
        success: true,
        user: {
          userId: result.userId,
          scopes: result.scopes,
          authMethod: 'api_key',
        },
      };
    }
    return {
      success: false,
      error: 'Invalid or expired API key',
    };
  }

  const payload = await verifyAccessToken(token);
  if (payload) {
    return {
      success: true,
      user: {
        userId: payload.sub,
        scopes: payload.scopes,
        authMethod: 'jwt',
      },
    };
  }

  return {
    success: false,
    error: 'Invalid or expired access token',
  };
}

export function hasScope(user: McpUser, requiredScope: string): boolean {
  if (user.scopes.includes('*')) {
    return true;
  }
  return user.scopes.includes(requiredScope);
}

export function checkToolAccess(
  user: McpUser,
  toolName: string,
  requiredScope?: string
): { allowed: boolean; error?: string } {
  const scopeToCheck = requiredScope || toolName;

  if (!hasScope(user, scopeToCheck)) {
    return {
      allowed: false,
      error: `Access denied: missing scope '${scopeToCheck}' for tool '${toolName}'`,
    };
  }

  return { allowed: true };
}
