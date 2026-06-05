/**
 * GET /api/schema-collaborations/:id/export - Export collaboration as schema.org JSON-LD
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { exportCollaborationJsonLd } from '@/lib/lancedb';
import { getSchemaCollaborationById } from '@/db/schemaCollaboration';
import { JsonLdDocument } from '@/data/schemaObject';

type ResponseData = {
  success: boolean;
  data?: JsonLdDocument;
  error?: string;
} | JsonLdDocument;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

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

    const jsonLd = await exportCollaborationJsonLd(id);

    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('application/ld+json') || acceptHeader.includes('application/json')) {
      res.setHeader('Content-Type', 'application/ld+json');
      return res.status(200).json(jsonLd);
    }

    return res.status(200).json({
      success: true,
      data: jsonLd,
    });
  } catch (error) {
    console.error('Error exporting collaboration JSON-LD:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to export collaboration',
    });
  }
}
