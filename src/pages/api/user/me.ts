import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '@/lib/middleware/farcasterUser';
import { getUserById } from '@/db/user';

type ResponseData = {
  user: {
    id: string;
    fid: string;
    username: string | null;
    displayName: string | null;
    pfpUrl: string | null;
  } | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ user: null });
  }

  try {
    // First, try to get user from frame context (for frame POST requests)
    let user = await getAuthenticatedUser(req);

    // If not available from frame context, try to get from session cookie
    if (!user) {
      const cookies = req.headers.cookie || '';
      const sessionMatch = cookies.match(/user_session=([^;]+)/);
      
      if (sessionMatch && sessionMatch[1]) {
        const userId = sessionMatch[1];
        user = await getUserById(userId);
      }
    }

    if (!user) {
      return res.status(200).json({ user: null });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        fid: user.fid,
        username: user.username,
        displayName: user.displayName,
        pfpUrl: user.pfpUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ user: null });
  }
}

