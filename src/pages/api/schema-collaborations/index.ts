/**
 * POST /api/schema-collaborations - Create a new schema collaboration
 * GET /api/schema-collaborations - List all schema collaborations
 */

import { NextApiRequest, NextApiResponse } from 'next';
import {
  createSchemaCollaboration,
  getAllSchemaCollaborations,
  getSchemaCollaborationsByChatThread,
} from '@/db/schemaCollaboration';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { name, description, templateId, chatThreadId, createdByUserId } = req.body;

      const collaboration = await createSchemaCollaboration({
        name,
        description,
        templateId,
        chatThreadId,
        createdByUserId,
      });

      return res.status(201).json({
        success: true,
        data: collaboration,
      });
    } catch (error) {
      console.error('Error creating schema collaboration:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create schema collaboration',
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const { chatThreadId } = req.query;

      let collaborations;
      if (chatThreadId && typeof chatThreadId === 'string') {
        collaborations = await getSchemaCollaborationsByChatThread(chatThreadId);
      } else {
        collaborations = await getAllSchemaCollaborations();
      }

      return res.status(200).json({
        success: true,
        data: collaborations,
      });
    } catch (error) {
      console.error('Error fetching schema collaborations:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch schema collaborations',
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
