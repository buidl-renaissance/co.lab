import { NextApiRequest, NextApiResponse } from 'next';
import { getAllCollaborations, getCollaborationsByUsername } from '@/db/collaboration';
import { Collaboration } from '@/data/collaboration';
import { getAuthenticatedUser } from '@/lib/middleware/farcasterUser';

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
      // Check for username query parameter
      const { username } = req.query;
      
      let collaborations: Collaboration[];
      
      if (username && typeof username === 'string') {
        // Query collaborations directly by username
        collaborations = await getCollaborationsByUsername(username);
      } else {
        // Try to get authenticated user as fallback
        const user = await getAuthenticatedUser(req);
        
        if (user?.username) {
          // Return collaborations for authenticated user's username
          collaborations = await getCollaborationsByUsername(user.username);
        } else {
          // No user specified or authenticated - return all collaborations
          collaborations = await getAllCollaborations();
        }
      }
      
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
