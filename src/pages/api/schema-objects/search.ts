/**
 * POST /api/schema-objects/search - Semantic search over schema objects
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { searchSchemaObjects } from '@/lib/lancedb';
import { SchemaOrgType, SchemaObjectSource } from '@/data/schemaObject';

type ResponseData = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      query,
      types,
      collaborationId,
      source,
      limit,
      offset,
      includeDeleted,
    } = req.body;

    const result = await searchSchemaObjects({
      query: query as string | undefined,
      types: types as SchemaOrgType[] | undefined,
      collaborationId: collaborationId as string | undefined,
      source: source as SchemaObjectSource | undefined,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
      includeDeleted: includeDeleted === true,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error searching schema objects:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search schema objects',
    });
  }
}
