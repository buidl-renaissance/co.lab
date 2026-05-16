import { v4 as uuidv4 } from 'uuid';
import { eq, and, isNull, gt, lt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from './drizzle';
import { userPublicKeys, apiKeys, refreshTokens, nonces } from './schema';

const BCRYPT_COST = 10;
const NONCE_EXPIRY_MINUTES = 2;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

// ===== Type Definitions =====

export interface UserPublicKey {
  id: string;
  userId: string;
  publicKey: string;
  label: string;
  createdAt: Date;
  revokedAt: Date | null;
}

export interface ApiKey {
  id: string;
  userId: string;
  keyPrefix: string;
  label: string;
  scopes: string[];
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface RefreshToken {
  id: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface Nonce {
  id: string;
  publicKey: string;
  nonce: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

// ===== Public Key Functions =====

export async function registerPublicKey(
  userId: string,
  publicKey: string,
  label: string
): Promise<UserPublicKey> {
  const id = uuidv4();
  const now = new Date();

  await db.insert(userPublicKeys).values({
    id,
    userId,
    publicKey,
    label,
    createdAt: now,
    revokedAt: null,
  });

  return {
    id,
    userId,
    publicKey,
    label,
    createdAt: now,
    revokedAt: null,
  };
}

export async function getPublicKeysByUser(userId: string): Promise<UserPublicKey[]> {
  const results = await db
    .select()
    .from(userPublicKeys)
    .where(and(eq(userPublicKeys.userId, userId), isNull(userPublicKeys.revokedAt)));

  return results.map((row) => ({
    id: row.id,
    userId: row.userId,
    publicKey: row.publicKey,
    label: row.label,
    createdAt: row.createdAt || new Date(),
    revokedAt: row.revokedAt,
  }));
}

export async function getPublicKeyByValue(publicKey: string): Promise<UserPublicKey | null> {
  const results = await db
    .select()
    .from(userPublicKeys)
    .where(and(eq(userPublicKeys.publicKey, publicKey), isNull(userPublicKeys.revokedAt)))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    userId: row.userId,
    publicKey: row.publicKey,
    label: row.label,
    createdAt: row.createdAt || new Date(),
    revokedAt: row.revokedAt,
  };
}

export async function revokePublicKey(id: string, userId: string): Promise<boolean> {
  const now = new Date();
  const result = await db
    .update(userPublicKeys)
    .set({ revokedAt: now })
    .where(and(eq(userPublicKeys.id, id), eq(userPublicKeys.userId, userId)));

  return result.rowsAffected > 0;
}

// ===== API Key Functions =====

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'clb_'; // Prefix to identify co.lab API keys
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createApiKey(
  userId: string,
  label: string,
  scopes: string[],
  expiresAt?: Date
): Promise<{ apiKey: ApiKey; rawKey: string }> {
  const id = uuidv4();
  const rawKey = generateApiKey();
  const keyHash = await bcrypt.hash(rawKey, BCRYPT_COST);
  const keyPrefix = rawKey.substring(0, 12); // Show prefix including 'clb_' + 8 chars
  const now = new Date();

  await db.insert(apiKeys).values({
    id,
    userId,
    keyHash,
    keyPrefix,
    label,
    scopes,
    lastUsedAt: null,
    expiresAt: expiresAt || null,
    revokedAt: null,
    createdAt: now,
  });

  const apiKey: ApiKey = {
    id,
    userId,
    keyPrefix,
    label,
    scopes,
    lastUsedAt: null,
    expiresAt: expiresAt || null,
    revokedAt: null,
    createdAt: now,
  };

  return { apiKey, rawKey };
}

export async function listApiKeys(userId: string): Promise<ApiKey[]> {
  const results = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)));

  return results.map((row) => ({
    id: row.id,
    userId: row.userId,
    keyPrefix: row.keyPrefix,
    label: row.label,
    scopes: row.scopes || [],
    lastUsedAt: row.lastUsedAt,
    expiresAt: row.expiresAt,
    revokedAt: row.revokedAt,
    createdAt: row.createdAt || new Date(),
  }));
}

export async function revokeApiKey(id: string, userId: string): Promise<boolean> {
  const now = new Date();
  const result = await db
    .update(apiKeys)
    .set({ revokedAt: now })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)));

  return result.rowsAffected > 0;
}

export async function validateApiKey(
  rawKey: string
): Promise<{ userId: string; scopes: string[] } | null> {
  const keyPrefix = rawKey.substring(0, 12);
  const now = new Date();

  const results = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.keyPrefix, keyPrefix),
        isNull(apiKeys.revokedAt)
      )
    );

  for (const row of results) {
    const isValid = await bcrypt.compare(rawKey, row.keyHash);
    if (isValid) {
      // Check expiration
      if (row.expiresAt && row.expiresAt < now) {
        return null;
      }

      // Update last used timestamp
      await db.update(apiKeys).set({ lastUsedAt: now }).where(eq(apiKeys.id, row.id));

      return {
        userId: row.userId,
        scopes: row.scopes || [],
      };
    }
  }

  return null;
}

// ===== Refresh Token Functions =====

function generateRefreshToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createRefreshToken(userId: string): Promise<string> {
  const id = uuidv4();
  const rawToken = generateRefreshToken();
  const tokenHash = await bcrypt.hash(rawToken, BCRYPT_COST);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(refreshTokens).values({
    id,
    userId,
    tokenHash,
    expiresAt,
    revokedAt: null,
    createdAt: now,
  });

  return rawToken;
}

export async function rotateRefreshToken(
  rawToken: string
): Promise<{ userId: string; newToken: string } | null> {
  const now = new Date();

  // Find all non-revoked, non-expired refresh tokens
  const results = await db
    .select()
    .from(refreshTokens)
    .where(and(isNull(refreshTokens.revokedAt), gt(refreshTokens.expiresAt, now)));

  for (const row of results) {
    const isValid = await bcrypt.compare(rawToken, row.tokenHash);
    if (isValid) {
      // Revoke the old token
      await db.update(refreshTokens).set({ revokedAt: now }).where(eq(refreshTokens.id, row.id));

      // Create a new token
      const newToken = await createRefreshToken(row.userId);

      return {
        userId: row.userId,
        newToken,
      };
    }
  }

  return null;
}

// ===== Nonce Functions =====

function generateNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createNonce(publicKey: string): Promise<string> {
  const id = uuidv4();
  const nonce = generateNonce();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + NONCE_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(nonces).values({
    id,
    publicKey,
    nonce,
    expiresAt,
    usedAt: null,
    createdAt: now,
  });

  return nonce;
}

export async function verifyAndConsumeNonce(
  publicKey: string,
  nonce: string
): Promise<boolean> {
  const now = new Date();

  const results = await db
    .select()
    .from(nonces)
    .where(
      and(
        eq(nonces.publicKey, publicKey),
        eq(nonces.nonce, nonce),
        isNull(nonces.usedAt),
        gt(nonces.expiresAt, now)
      )
    )
    .limit(1);

  if (results.length === 0) {
    return false;
  }

  // Mark nonce as used
  await db.update(nonces).set({ usedAt: now }).where(eq(nonces.id, results[0].id));

  return true;
}

export async function cleanupExpiredNonces(): Promise<number> {
  const now = new Date();
  const result = await db.delete(nonces).where(lt(nonces.expiresAt, now));
  return result.rowsAffected;
}
