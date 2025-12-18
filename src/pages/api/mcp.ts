import type { NextApiRequest, NextApiResponse } from 'next';
import {
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcErrorObject,
  JsonValue,
} from '@/lib/mcp/types';
import { globalToolRegistry } from '@/lib/mcp/registry';
import { registerMcpTools, toolDefinitions } from '@/lib/mcp/config';

const rateLimitWindowMs = 60_000;
const rateLimitMaxRequests = 60;

type RateEntry = {
  count: number;
  windowStart: number;
};

const rateMap = new Map<string, RateEntry>();

function makeError(
  id: JsonRpcRequest['id'],
  code: number,
  message: string,
  data?: JsonRpcErrorObject['data'],
): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      data,
    },
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JsonRpcResponse>,
) {
  if (req.method !== 'POST') {
    res
      .status(405)
      .json(
        makeError(null, -32600, 'Method not allowed. Use POST for MCP JSON-RPC'),
      );
    return;
  }

  registerMcpTools();

  const apiKey = process.env.MCP_API_KEY;
  if (apiKey) {
    const headerKey =
      req.headers['x-mcp-api-key'] ||
      req.headers['x-mcp-api-key'.toLowerCase()];
    const authHeader = req.headers.authorization;
    const bearer = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;

    if (headerKey !== apiKey && bearer !== apiKey) {
      res
        .status(401)
        .json(
          makeError(
            null,
            401,
            'Unauthorized MCP request: invalid or missing API key',
          ),
        );
      return;
    }
  }

  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';

  const now = Date.now();
  const existing = rateMap.get(ip);
  if (!existing || now - existing.windowStart > rateLimitWindowMs) {
    rateMap.set(ip, { count: 1, windowStart: now });
  } else if (existing.count >= rateLimitMaxRequests) {
    res
      .status(429)
      .json(makeError(null, 429, 'Rate limit exceeded for MCP endpoint'));
    return;
  } else {
    existing.count += 1;
  }

  const body = req.body as JsonRpcRequest;

  if (!body || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
    res
      .status(400)
      .json(makeError(null, -32600, 'Invalid JSON-RPC 2.0 request'));
    return;
  }

  const { id, method, params } = body;
  const start = Date.now();

  try {
    if (method === 'tools/list') {
      res.status(200).json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: toolDefinitions,
        },
      });
      return;
    }

    if (method === 'tools/call') {
      if (
        !params ||
        typeof (params as { name?: unknown }).name !== 'string'
      ) {
        res
          .status(400)
          .json(makeError(id, -32602, 'Invalid params: missing tool name'));
        return;
      }

      const { name, arguments: args } = params as {
        name: string;
        arguments?: unknown;
      };

      const result = await globalToolRegistry.callTool({
        name,
        arguments: args as JsonValue | undefined,
      });

      res.status(200).json({
        jsonrpc: '2.0',
        id,
        result,
      });
      return;
    }

    res.status(404).json(makeError(id, -32601, 'Method not found'));
  } catch (error) {
    console.error('MCP handler error:', error);
    res.status(500).json(
      makeError(id, -32603, 'Internal MCP server error', {
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      }),
    );
  } finally {
    const durationMs = Date.now() - start;
    console.log(
      JSON.stringify({
        type: 'mcp_call',
        method,
        id,
        ip,
        durationMs,
      }),
    );
  }
}


