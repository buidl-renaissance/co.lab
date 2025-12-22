import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Debug endpoint to check SDK detection
 * This helps diagnose why the SDK might not be detected
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // This endpoint is for client-side debugging
  // The actual SDK detection happens in the browser
  return res.status(200).json({
    message: 'SDK detection happens client-side. Check browser console for logs.',
    instructions: [
      '1. Open browser console',
      '2. Look for logs starting with 🔍, ✅, or ❌',
      '3. Check if SDK is found on window object',
      '4. Verify Quick Auth or context.user is available',
    ],
  });
}

