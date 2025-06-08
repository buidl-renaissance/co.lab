import { NextApiRequest, NextApiResponse } from 'next';
import { getAllCollaborations } from '@/db/collaboration';
import { Collaboration } from '@/data/collaboration';

type ResponseData = {
  success: boolean;
  data?: Collaboration[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'GET') {
    try {
      const collaborations = await getAllCollaborations();
      
      return res.status(200).json({
        success: true,
        data: collaborations
      });
    } catch (error) {
      console.error('Error fetching collaborations:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch collaborations'
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
