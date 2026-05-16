import { NextApiRequest, NextApiResponse } from 'next';
import { getCollaborationById } from '@/db/collaboration';
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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid collaboration ID',
    });
  }

  try {
    const collaboration = await getCollaborationById(id);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        error: 'Collaboration not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: collaboration,
    });
  } catch (error) {
    console.error('Error fetching collaboration:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch collaboration',
    });
  }
}
