import type { NextApiRequest, NextApiResponse } from 'next';
import { APP_URL } from '@/lib/framesConfig';

/**
 * Farcaster Mini App Manifest
 * Served at /.well-known/farcaster.json via rewrite in next.config.ts
 * This allows Farcaster to properly identify the application details
 * 
 * Format per Farcaster Mini App specification:
 * https://miniapps.farcaster.xyz/docs/specification
 * 
 * IMPORTANT: To generate the accountAssociation object:
 * 1. Open Farcaster Mobile App
 * 2. Go to Settings > Developer > Domains
 * 3. Enter your domain: co.lab.builddetroit.xyz
 * 4. Select "Generate Domain Manifest"
 * 5. Copy the generated accountAssociation object
 * 6. Set these environment variables:
 *    - FARCASTER_ACCOUNT_ASSOCIATION_HEADER
 *    - FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD
 *    - FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE
 * 
 * Or manually replace the placeholder values in the accountAssociation object below.
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
    accountAssociation: {
      header: string;
      payload: string;
      signature: string;
    };
    miniapp: {
      version: string;
      name: string;
      description: string;
      iconUrl: string;
      homeUrl: string;
      canonicalDomain: string;
      imageUrl?: string;
      buttonTitle?: string;
      splashImageUrl?: string;
      splashBackgroundColor?: string;
      subtitle?: string;
      screenshotUrls?: string[];
      primaryCategory?: string;
      tags?: string[];
      heroImageUrl?: string;
      tagline?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImageUrl?: string;
      castShareUrl?: string;
    };
  } = {
    // accountAssociation is REQUIRED - Generated via Farcaster Mobile App
    // Settings > Developer > Domains > Generate Domain Manifest
    accountAssociation: {
      header: process.env.FARCASTER_ACCOUNT_ASSOCIATION_HEADER || 'eyJmaWQiOjM3ODUxNSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDdEMzUyNjAwNjA5NTEzNzZkMUFBNkExNDRhQjA5NTNmYTUxMTJhOTMifQ',
      payload: process.env.FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD || 'eyJkb21haW4iOiJjby5sYWIuYnVpbGRkZXRyb2l0Lnh5eiJ9',
      signature: process.env.FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE || 'mf/BeDJzf9NkUL0qLtNy4xEDw7LTuuKsbH9VWaSHeI5hRuB/IfOe4pwKGilJnerdWW8BahawDqD4CN2VGwfkOhw=',
    },
    miniapp: {
      version: '1',
      name: 'Co.Lab',
      description: 'A voice-first project planning tool for creative teams. Transform freeform conversations into structured, actionable project plans.',
      iconUrl: `${APP_URL}/co.lab-thumb.jpg`,
      homeUrl: APP_URL,
      canonicalDomain: domain,
      // Recommended fields for better discovery and presentation
      imageUrl: `${APP_URL}/co.lab-thumb.jpg`,
      buttonTitle: 'Start a Collab',
      splashImageUrl: `${APP_URL}/co.lab-tile.png`,
      splashBackgroundColor: '#ffffff',
      subtitle: 'Voice-first project planning', // Max 30 chars
      tagline: 'Turn conversations into plans', // Max 30 chars
      ogTitle: 'Co.Lab', // Max 30 chars
      ogDescription: 'Voice-first project planning for creative teams. Transform conversations into structured plans.', // Max 100 chars
      ogImageUrl: `${APP_URL}/co.lab-thumb.jpg`,
      castShareUrl: `${APP_URL}/frames`,
      // Optional categorization
      primaryCategory: 'productivity',
      tags: ['collaboration', 'project-planning', 'voice-first', 'productivity'],
    },
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json(manifest);
}

