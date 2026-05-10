import { SignJWT, jwtVerify, errors } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'default-dev-secret-change-in-production';
const JWT_EXPIRY = '15m'; // 15 minutes
const JWT_ISSUER = 'co.lab';

export interface JwtPayload {
  sub: string; // userId
  scopes: string[];
  iat: number;
  exp: number;
  iss: string;
}

export async function createAccessToken(userId: string, scopes: string[]): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  const token = await new SignJWT({ scopes })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(JWT_EXPIRY)
    .sign(secret);
  
  return token;
}

export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
    });
    
    return {
      sub: payload.sub as string,
      scopes: (payload.scopes as string[]) || ['*'],
      iat: payload.iat as number,
      exp: payload.exp as number,
      iss: payload.iss as string,
    };
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      console.log('JWT expired');
    } else if (error instanceof errors.JWTInvalid) {
      console.log('JWT invalid');
    } else {
      console.error('JWT verification error:', error);
    }
    return null;
  }
}
