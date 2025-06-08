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
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
