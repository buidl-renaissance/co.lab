import type { NextApiRequest, NextApiResponse } from 'next';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '@/lib/githubConfig';
import { upsertGitHubAccount } from '@/db/github';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send('Missing code or state');
  }

  let stateJson: { redirect: string };
  try {
    stateJson = JSON.parse(Buffer.from(state as string, 'base64url').toString('utf8'));
  } catch {
    return res.status(400).send('Invalid state parameter');
  }

  const redirect = stateJson.redirect || '/settings/integrations/github';

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    if (!tokenRes.ok) {
      console.error('Token exchange failed:', await tokenRes.text());
      return res.redirect(`${redirect}?error=token_exchange_failed`);
    }

    const tokenJson = await tokenRes.json();

    if (tokenJson.error || !tokenJson.access_token) {
      console.error('Token response error:', tokenJson);
      return res.redirect(`${redirect}?error=oauth_failed`);
    }

    // Fetch GitHub user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${tokenJson.access_token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!userRes.ok) {
      console.error('User fetch failed:', await userRes.text());
      return res.redirect(`${redirect}?error=user_fetch_failed`);
    }

    const userJson = await userRes.json();

    // Use GitHub user ID as the userId for now (until proper auth is added)
    const userId = `github-${userJson.id}`;

    // Upsert GitHub account
    await upsertGitHubAccount({
      userId,
      githubLogin: userJson.login,
      githubUserId: String(userJson.id),
      accessToken: tokenJson.access_token, // TODO: encrypt this before storing
      tokenType: tokenJson.token_type || 'bearer',
    });

    res.redirect(`${redirect}?connected=1`);
  } catch (e) {
    console.error('GitHub OAuth callback error', e);
    res.redirect(`${redirect}?error=oauth_exception`);
  }
}

