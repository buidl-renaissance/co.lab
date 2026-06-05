/**
 * GET /api/schema-collaborations/:id/objects - List all objects for a collaboration
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { listCollaborationObjects } from '@/lib/lancedb';
import { getSchemaCollaborationById } from '@/db/schemaCollaboration';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid id parameter',
    });
  }

  try {
    const collaboration = await getSchemaCollaborationById(id);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        error: 'Schema collaboration not found',
      });
    }

    const includeDeleted = req.query.includeDeleted === 'true';
    const objects = await listCollaborationObjects(id, includeDeleted);

    return res.status(200).json({
      success: true,
      data: {
        collaboration,
        objects,
        total: objects.length,
      },
    });
  } catch (error) {
    console.error('Error fetching collaboration objects:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch collaboration objects',
    });
  }
}
