import type { NextApiRequest, NextApiResponse } from 'next';
import { GITHUB_CLIENT_ID, GITHUB_CALLBACK_URL, GITHUB_SCOPES } from '@/lib/githubConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const redirect = (req.query.redirect as string) || '/settings/integrations/github';
  const statePayload = JSON.stringify({ redirect });
  const state = Buffer.from(statePayload).toString('base64url');

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', GITHUB_CALLBACK_URL);
  url.searchParams.set('scope', GITHUB_SCOPES);
  url.searchParams.set('state', state);

  res.redirect(url.toString());
}

