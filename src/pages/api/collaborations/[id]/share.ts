import { NextApiRequest, NextApiResponse } from 'next';
import { getCollaborationById, generateShareToken, revokeShareToken } from '@/db/collaboration';

type ResponseData = {
  success: boolean;
  data?: {
    shareToken: string;
    shareUrl: string;
  };
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid collaboration ID',
    });
  }

  // Verify the collaboration exists
  const collaboration = await getCollaborationById(id);
  if (!collaboration) {
    return res.status(404).json({
      success: false,
      error: 'Collaboration not found',
    });
  }

  if (req.method === 'POST') {
    try {
      const result = await generateShareToken(id);
      
      if (!result) {
        return res.status(500).json({
          success: false,
          error: 'Failed to generate share token',
        });
      }

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error generating share token:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate share token',
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const revoked = await revokeShareToken(id);
      
      if (!revoked) {
        return res.status(500).json({
          success: false,
          error: 'Failed to revoke share token',
        });
      }

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error('Error revoking share token:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to revoke share token',
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
