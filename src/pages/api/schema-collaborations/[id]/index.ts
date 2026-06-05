/**
 * GET /api/schema-collaborations/:id - Fetch collaboration by ID
 * PATCH /api/schema-collaborations/:id - Update collaboration
 * DELETE /api/schema-collaborations/:id - Delete collaboration
 */

import { NextApiRequest, NextApiResponse } from 'next';
import {
  getSchemaCollaborationById,
  updateSchemaCollaboration,
  deleteSchemaCollaboration,
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid id parameter',
    });
  }

  if (req.method === 'GET') {
    try {
      const collaboration = await getSchemaCollaborationById(id);

      if (!collaboration) {
        return res.status(404).json({
          success: false,
          error: 'Schema collaboration not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: collaboration,
      });
    } catch (error) {
      console.error('Error fetching schema collaboration:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch schema collaboration',
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { name, description, templateId, chatThreadId } = req.body;

      const updates: Record<string, string | undefined> = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (templateId !== undefined) updates.templateId = templateId;
      if (chatThreadId !== undefined) updates.chatThreadId = chatThreadId;

      const collaboration = await updateSchemaCollaboration(id, updates);

      if (!collaboration) {
        return res.status(404).json({
          success: false,
          error: 'Schema collaboration not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: collaboration,
      });
    } catch (error) {
      console.error('Error updating schema collaboration:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update schema collaboration',
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await deleteSchemaCollaboration(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Schema collaboration not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: { deleted: true },
      });
    } catch (error) {
      console.error('Error deleting schema collaboration:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete schema collaboration',
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
