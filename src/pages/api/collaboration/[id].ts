import { NextApiRequest, NextApiResponse } from 'next';
import { getCollaborationById, updateCollaboration } from '@/db/collaboration';
import { Collaboration } from '@/data/collaboration';

type ResponseData = {
  success: boolean;
  data?: Collaboration;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing or invalid collaboration ID' 
    });
  }

  if (req.method === 'GET') {
    try {
      const collaboration = await getCollaborationById(id);
      
      if (!collaboration) {
        return res.status(404).json({
          success: false,
          error: 'Collaboration not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: collaboration
      });
    } catch (error) {
      console.error('Error fetching collaboration:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch collaboration'
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updates = req.body;
      
      const updatedCollaboration = await updateCollaboration(id, updates);
      
      if (!updatedCollaboration) {
        return res.status(404).json({
          success: false,
          error: 'Collaboration not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedCollaboration
      });
    } catch (error) {
      console.error('Error updating collaboration:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update collaboration'
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
