import type { NextApiRequest } from 'next';
import { extractFrameUser } from '../farcasterAuth';
import { getOrCreateUserByFid, upsertFarcasterAccount, type User } from '@/db/user';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User;
}

/**
 * Middleware to extract and attach authenticated Farcaster user to request
 * Works with both frame POST requests and regular API requests
 */
export async function getAuthenticatedUser(
  req: NextApiRequest
): Promise<User | null> {
  try {
    // Try to extract user from frame context
    const frameUser = await extractFrameUser(req);
    
    if (!frameUser) {
      return null;
    }

    // Get or create user in database
    const user = await getOrCreateUserByFid(frameUser.fid, {
      fid: frameUser.fid,
      username: frameUser.username,
      displayName: frameUser.displayName,
      pfpUrl: frameUser.pfpUrl,
    });

    // Link/update Farcaster account
    if (frameUser.username) {
      await upsertFarcasterAccount(user.id, {
        fid: frameUser.fid,
        username: frameUser.username,
      });
    }

    return user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Attach user to request object (for use in API handlers)
 */
export async function attachUserToRequest(
  req: AuthenticatedRequest
): Promise<boolean> {
  const user = await getAuthenticatedUser(req);
  if (user) {
    req.user = user;
    return true;
  }
  return false;
}

