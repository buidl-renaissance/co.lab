import { NextApiRequest, NextApiResponse } from 'next';
import { getCollaborationByShareToken } from '@/db/collaboration';
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
  // Enable CORS - public endpoint, no auth required
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

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { shareToken } = req.query;

  if (!shareToken || typeof shareToken !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid share token',
    });
  }

  try {
    const collaboration = await getCollaborationByShareToken(shareToken);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        error: 'Collaboration not found or not shared',
      });
    }

    return res.status(200).json({
      success: true,
      data: collaboration,
    });
  } catch (error) {
    console.error('Error fetching collaboration by share token:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch collaboration',
    });
  }
}
