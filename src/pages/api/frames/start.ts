import type { NextApiRequest, NextApiResponse } from "next";
import { APP_URL } from "@/lib/framesConfig";
import { getAuthenticatedUser } from "@/lib/middleware/farcasterUser";

type FrameResponse = {
  image: string;
  buttons: { label: string; action?: "post" | "post_redirect" }[];
  postUrl?: string;
  text?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Log request details for debugging
  console.log('=== Frame Start Handler ===');
  console.log('Method:', req.method);
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', req.body ? Object.keys(req.body) : 'no body');

  // Extract and verify authenticated user from frame context
  const user = await getAuthenticatedUser(req);
  
  // Log user authentication (for debugging)
  if (user) {
    console.log('✅ Frame request from authenticated user:', {
      userId: user.id,
      fid: user.fid,
      username: user.username,
    });
    
    // Set session cookie to persist user authentication
    // This allows the user to be identified in subsequent requests
    res.setHeader('Set-Cookie', `user_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`); // 24 hours
  } else {
    console.log('❌ Frame request without authenticated user (may be development mode)');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }

  // Include user ID in redirect URL if user is authenticated
  const redirectUrl = user 
    ? `${APP_URL}/collabs?userId=${user.id}`
    : `${APP_URL}/collabs`;

  const response: FrameResponse = {
    image: `${APP_URL}/co.lab-start.jpg`,
    text: user 
      ? `Welcome ${user.username || user.fid}! You're ready to start a Collab session from Farcaster.`
      : "You're ready to start a Collab session from Farcaster.",
    buttons: [
      {
        label: "Open Collabs",
        action: "post_redirect",
      },
    ],
    postUrl: redirectUrl,
  };

  res.status(200).json(response);
}


