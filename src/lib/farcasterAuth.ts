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
    // Log the request body for debugging
    console.log('Frame request body:', JSON.stringify(req.body, null, 2));
    console.log('Request method:', req.method);
    console.log('Content-Type:', req.headers['content-type']);

    // Handle case where body might be a string that needs parsing
    let body: {
      trustedData?: {
        messageBytes?: string;
      };
      untrustedData?: {
        fid?: number;
        url?: string;
        buttonIndex?: number;
      };
    };

    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        console.error('Failed to parse body as JSON:', e);
        return null;
      }
    } else {
      body = req.body as typeof body;
    }

    // For development/testing, allow unverified requests if NEYNAR_API_KEY is not set
    if (!NEYNAR_API_KEY || NEYNAR_API_KEY === 'replace-with-neynar-api-key') {
      console.log('Development mode: Using untrustedData');
      // In development mode, try to extract from untrustedData
      if (body.untrustedData?.fid) {
        console.log('Found fid in untrustedData:', body.untrustedData.fid);
        return {
          fid: String(body.untrustedData.fid),
        };
      }
      console.log('No fid found in untrustedData');
      return null;
    }

    // Verify signed payload using Neynar API
    if (!body.trustedData?.messageBytes) {
      console.log('No trustedData.messageBytes found');
      return null;
    }

    console.log('Verifying payload with Neynar API');
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

