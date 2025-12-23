import type { NextApiRequest, NextApiResponse } from 'next';
import { APP_URL } from '@/lib/framesConfig';

/**
 * Farcaster Mini App Manifest
 * Served at /.well-known/farcaster.json via rewrite in next.config.ts
 * This allows Farcaster to properly identify the application details
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const manifest = {
    name: 'Co.Lab',
    description: 'A voice-first project planning tool for creative teams. Transform freeform conversations into structured, actionable project plans.',
    iconUrl: `${APP_URL}/co.lab-thumb.jpg`,
    homepageUrl: APP_URL,
    splashImageUrl: `${APP_URL}/co.lab-start.jpg`,
    splashBackgroundColor: '#ffffff',
    webUrl: APP_URL,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  return res.status(200).json(manifest);
}

