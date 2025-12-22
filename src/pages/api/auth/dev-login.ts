import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrCreateUserByFid, upsertFarcasterAccount } from '@/db/user';

/**
 * Development-only endpoint to simulate Farcaster authentication
 * Only works when NODE_ENV is development
 * Usage: POST /api/auth/dev-login with { fid: "12345", username: "testuser" }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fid, username } = req.body as { fid?: string; username?: string };

    if (!fid) {
      return res.status(400).json({ error: 'fid is required' });
    }

    // Create or get test user
    const user = await getOrCreateUserByFid(fid, {
      fid,
      username: username || `dev-user-${fid}`,
      displayName: `Dev User ${fid}`,
    });

    // Link Farcaster account
    await upsertFarcasterAccount(user.id, {
      fid,
      username: username || `dev-user-${fid}`,
    });

    // Set session cookie
    res.setHeader('Set-Cookie', `user_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`); // 24 hours

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        fid: user.fid,
        username: user.username,
        displayName: user.displayName,
        pfpUrl: user.pfpUrl,
      },
    });
  } catch (error) {
    console.error('Error in dev login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

