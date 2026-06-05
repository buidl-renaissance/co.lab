/**
 * POST /api/schema-objects/link - Create a relationship edge between two objects
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { linkObjects, getObjectRelationships } from '@/lib/lancedb';

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
    const { sourceId, targetId, relationshipType, collaborationId } = req.body;

    if (!sourceId || typeof sourceId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: sourceId',
      });
    }

    if (!targetId || typeof targetId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: targetId',
      });
    }

    if (!relationshipType || typeof relationshipType !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: relationshipType',
      });
    }

    if (!collaborationId || typeof collaborationId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: collaborationId',
      });
    }

    const relationship = await linkObjects(
      sourceId,
      targetId,
      relationshipType,
      collaborationId
    );

    return res.status(201).json({
      success: true,
      data: relationship,
    });
  } catch (error) {
    console.error('Error linking objects:', error);
    const message = error instanceof Error ? error.message : 'Failed to link objects';
    return res.status(500).json({
      success: false,
      error: message,
    });
  }
}

export async function getRelationshipsHandler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { objectId, direction } = req.query;

  if (!objectId || typeof objectId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing required query param: objectId',
    });
  }

  try {
    const relationships = await getObjectRelationships(
      objectId,
      (direction as 'source' | 'target' | 'both') || 'both'
    );

    return res.status(200).json({
      success: true,
      data: relationships,
    });
  } catch (error) {
    console.error('Error fetching relationships:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch relationships',
    });
  }
}
