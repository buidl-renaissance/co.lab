import { base64UrlEncode, base64UrlDecode } from '@/db/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';
const JWT_ISSUER = 'co.lab';
const JWT_ACCESS_EXPIRY_MINUTES = 15;

export interface JwtPayload {
  sub: string;
  keyId: string;
  userId?: string;
  scopes?: string[];
  iat: number;
  exp: number;
  iss: string;
}

export interface JwtHeader {
  alg: string;
  typ: string;
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    return base64UrlEncode(new Uint8Array(signature));
  }

  const { createHmac } = await import('crypto');
  const hmac = createHmac('sha256', secret);
  hmac.update(message);
  const signature = hmac.digest();
  return base64UrlEncode(new Uint8Array(signature));
}

async function hmacVerify(message: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await hmacSign(message, secret);
  return expectedSignature === signature;
}

export async function createAccessToken(payload: {
  keyId: string;
  userId?: string;
  scopes?: string[];
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + JWT_ACCESS_EXPIRY_MINUTES * 60;

  const header: JwtHeader = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const claims: JwtPayload = {
    sub: payload.keyId,
    keyId: payload.keyId,
    userId: payload.userId,
    scopes: payload.scopes || ['*'],
    iat: now,
    exp,
    iss: JWT_ISSUER,
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(claims)));
  const message = `${headerB64}.${payloadB64}`;
  const signature = await hmacSign(message, JWT_SECRET);

  return `${message}.${signature}`;
}

export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signature] = parts;
    const message = `${headerB64}.${payloadB64}`;

    const isValid = await hmacVerify(message, signature, JWT_SECRET);
    if (!isValid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadJson) as JwtPayload;

    if (payload.iss !== JWT_ISSUER) return null;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

export function generateRefreshToken(): string {
  const array = new Uint8Array(48);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return 'clbrt_' + base64UrlEncode(array);
}
