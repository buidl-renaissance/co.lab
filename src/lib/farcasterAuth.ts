import type { NextApiRequest } from 'next';
import { NEYNAR_API_KEY } from './framesConfig';

export interface FrameSignedPayload {
  fid: number;
  url: string;
  messageHash: string;
  timestamp: number;
  network: string;
  buttonIndex?: number;
  castId?: {
    fid: number;
    hash: string;
  };
}

export interface VerifiedFrameUser {
  fid: string;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

/**
 * Extract and verify signed payload from Farcaster frame POST request
 * Frame requests include a signed payload in trustedData.messageBytes
 */
export async function extractFrameUser(
  req: NextApiRequest
): Promise<VerifiedFrameUser | null> {
  try {
    const body = req.body as {
      trustedData?: {
        messageBytes?: string;
      };
      untrustedData?: {
        fid?: number;
      };
    };

    // For development/testing, allow unverified requests if NEYNAR_API_KEY is not set
    if (!NEYNAR_API_KEY || NEYNAR_API_KEY === 'replace-with-neynar-api-key') {
      // In development mode, try to extract from untrustedData
      if (body.untrustedData?.fid) {
        return {
          fid: String(body.untrustedData.fid),
        };
      }
      return null;
    }

    // Verify signed payload using Neynar API
    if (!body.trustedData?.messageBytes) {
      return null;
    }

    const verifiedUser = await verifyFramePayload(body.trustedData.messageBytes);
    return verifiedUser;
  } catch (error) {
    console.error('Error extracting frame user:', error);
    return null;
  }
}

/**
 * Verify signed frame payload using Neynar API
 */
async function verifyFramePayload(
  messageBytes: string
): Promise<VerifiedFrameUser | null> {
  if (!NEYNAR_API_KEY || NEYNAR_API_KEY === 'replace-with-neynar-api-key') {
    return null;
  }

  try {
    // Use Neynar API to verify the signed payload
    const response = await fetch('https://api.neynar.com/v2/farcaster/frame/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': NEYNAR_API_KEY,
      },
      body: JSON.stringify({
        messageBytesInHex: messageBytes,
      }),
    });

    if (!response.ok) {
      console.error('Neynar validation failed:', await response.text());
      return null;
    }

    const data = await response.json();
    
    // Extract user information from validated payload
    if (data.valid && data.action?.interactor) {
      const interactor = data.action.interactor;
      return {
        fid: String(interactor.fid),
        username: interactor.username,
        displayName: interactor.display_name,
        pfpUrl: interactor.pfp_url,
      };
    }

    return null;
  } catch (error) {
    console.error('Error verifying frame payload:', error);
    return null;
  }
}

/**
 * Extract user from frame request body (for simpler cases)
 * This is a fallback that works with the frame POST structure
 */
export function extractUserFromFrameBody(
  body: unknown
): { fid: string; username?: string } | null {
  try {
    const frameBody = body as {
      untrustedData?: {
        fid?: number;
        url?: string;
      };
      trustedData?: {
        messageBytes?: string;
      };
    };

    // Try to get fid from untrustedData (less secure, but works for development)
    if (frameBody.untrustedData?.fid) {
      return {
        fid: String(frameBody.untrustedData.fid),
      };
    }

    return null;
  } catch (error) {
    console.error('Error extracting user from frame body:', error);
    return null;
  }
}

