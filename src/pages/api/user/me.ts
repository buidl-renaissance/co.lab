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
    // For GET requests, try to get user from URL query parameter or cookie
    // (Frame context extraction only happens in POST endpoints like /api/frames/start)
    let user: Awaited<ReturnType<typeof getUserById>> = null;
    let source: string | null = null;

    // Try to get from URL query parameter
    if (!user && req.query.userId && typeof req.query.userId === 'string') {
      console.log('Attempting to get user from query param:', req.query.userId);
      user = await getUserById(req.query.userId);
      source = user ? 'query_param' : null;
    }

    // If still not available, try to get from session cookie
    if (!user) {
      const cookies = req.headers.cookie || '';
      console.log('Cookies received:', cookies ? 'present' : 'none');
      const sessionMatch = cookies.match(/user_session=([^;]+)/);
      
      if (sessionMatch && sessionMatch[1]) {
        const userId = sessionMatch[1];
        console.log('Attempting to get user from cookie:', userId);
        user = await getUserById(userId);
        source = user ? 'cookie' : null;
        if (!user) {
          console.log('User not found in database for cookie userId:', userId);
        }
      } else {
        console.log('No user_session cookie found');
      }
    }

    if (user) {
      console.log(`✅ User found via ${source}:`, { id: user.id, fid: user.fid, username: user.username });
    } else {
      console.log('❌ No user found in /api/user/me');
      console.log('  - Query params:', req.query);
      console.log('  - This is expected if user hasn\'t authenticated via frame yet');
    }

    if (!user) {
      return res.status(200).json({ user: null });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        fid: user.fid,
        username: user.username ?? null,
        displayName: user.displayName ?? null,
        pfpUrl: user.pfpUrl ?? null,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ user: null });
  }
}

