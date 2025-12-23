import type { NextApiRequest, NextApiResponse } from 'next';
import { APP_URL } from '@/lib/framesConfig';

/**
 * Farcaster Mini App Manifest
 * Served at /.well-known/farcaster.json via rewrite in next.config.ts
 * This allows Farcaster to properly identify the application details
 * 
 * Format per Farcaster Mini App specification:
 * https://miniapps.farcaster.xyz/docs/specification
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract domain from APP_URL
  const domain = new URL(APP_URL).hostname;

  const manifest: {
    miniapp: {
      version: string;
      name: string;
      description: string;
      iconUrl: string;
      homeUrl: string;
      canonicalDomain: string;
    };
    accountAssociation?: {
      header: string;
      payload: string;
      signature: string;
    };
  } = {
    miniapp: {
      version: '1',
      name: 'Co.Lab',
      description: 'A voice-first project planning tool for creative teams. Transform freeform conversations into structured, actionable project plans.',
      iconUrl: `${APP_URL}/co.lab-thumb.jpg`,
      homeUrl: APP_URL,
      canonicalDomain: domain,
    },
    // accountAssociation is optional but recommended for verification
    // Add this when you sign the manifest using Base Build Preview Tool or similar
    // accountAssociation: {
    //   header: "...",
    //   payload: "...",
    //   signature: "..."
    // }
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json(manifest);
}

