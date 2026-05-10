import { v4 as uuidv4 } from 'uuid';
import { eq, and, lt, gt } from 'drizzle-orm';
import { db } from './drizzle';
import { userPublicKeys, nonces, refreshTokens, apiKeys } from './schema';

// =====================
// Types
// =====================

export interface UserPublicKey {
  id: string;
  userId: string | null;
  publicKey: string;
  label: string | null;
  createdAt: Date;
}

export interface Nonce {
  id: string;
  keyId: string;
  nonce: string;
  expiresAt: Date;
  used: boolean;
}

export interface RefreshToken {
  id: string;
  keyId: string;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

export interface ApiKey {
  id: string;
  keyId: string;
  name: string;
  keyHash: string;
  scopes: string[];
  lastUsedAt: Date | null;
  createdAt: Date;
  revoked: boolean;
}

// =====================
// User Public Keys CRUD
// =====================

export async function createUserPublicKey(data: {
  publicKey: string;
  userId?: string;
  label?: string;
}): Promise<UserPublicKey> {
  const id = uuidv4();
  const now = new Date();

  await db.insert(userPublicKeys).values({
    id,
    userId: data.userId || null,
    publicKey: data.publicKey,
    label: data.label || null,
    createdAt: now,
  });

  return {
    id,
    userId: data.userId || null,
    publicKey: data.publicKey,
    label: data.label || null,
    createdAt: now,
  };
}

export async function getUserPublicKeyById(id: string): Promise<UserPublicKey | null> {
  const results = await db
    .select()
    .from(userPublicKeys)
    .where(eq(userPublicKeys.id, id))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    userId: row.userId,
    publicKey: row.publicKey,
    label: row.label,
    createdAt: row.createdAt || new Date(),
  };
}

export async function getUserPublicKeyByPublicKey(publicKey: string): Promise<UserPublicKey | null> {
  const results = await db
    .select()
    .from(userPublicKeys)
    .where(eq(userPublicKeys.publicKey, publicKey))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    userId: row.userId,
    publicKey: row.publicKey,
    label: row.label,
    createdAt: row.createdAt || new Date(),
  };
}

export async function getUserPublicKeysByUserId(userId: string): Promise<UserPublicKey[]> {
  const results = await db
    .select()
    .from(userPublicKeys)
    .where(eq(userPublicKeys.userId, userId));

  return results.map((row) => ({
    id: row.id,
    userId: row.userId,
    publicKey: row.publicKey,
    label: row.label,
    createdAt: row.createdAt || new Date(),
  }));
}

export async function updateUserPublicKey(
  id: string,
  data: { userId?: string; label?: string }
): Promise<UserPublicKey | null> {
  const existing = await getUserPublicKeyById(id);
  if (!existing) return null;

  const updates: Partial<typeof userPublicKeys.$inferInsert> = {};
  if (data.userId !== undefined) updates.userId = data.userId;
  if (data.label !== undefined) updates.label = data.label;

  if (Object.keys(updates).length > 0) {
    await db.update(userPublicKeys).set(updates).where(eq(userPublicKeys.id, id));
  }

  return {
    ...existing,
    userId: data.userId !== undefined ? data.userId : existing.userId,
    label: data.label !== undefined ? data.label : existing.label,
  };
}

export async function deleteUserPublicKey(id: string): Promise<boolean> {
  const result = await db.delete(userPublicKeys).where(eq(userPublicKeys.id, id));
  return (result.rowsAffected ?? 0) > 0;
}

// =====================
// Nonces CRUD
// =====================

export async function createNonce(keyId: string, ttlSeconds: number = 60): Promise<Nonce> {
  const id = uuidv4();
  const nonceValue = generateSecureNonce();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  await db.insert(nonces).values({
    id,
    keyId,
    nonce: nonceValue,
    expiresAt,
    used: false,
  });

  return {
    id,
    keyId,
    nonce: nonceValue,
    expiresAt,
    used: false,
  };
}

export async function getNonceByValue(nonceValue: string): Promise<Nonce | null> {
  const results = await db
    .select()
    .from(nonces)
    .where(eq(nonces.nonce, nonceValue))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    keyId: row.keyId,
    nonce: row.nonce,
    expiresAt: row.expiresAt || new Date(),
    used: row.used || false,
  };
}

export async function getValidNonce(nonceValue: string, keyId: string): Promise<Nonce | null> {
  const now = new Date();
  const results = await db
    .select()
    .from(nonces)
    .where(
      and(
        eq(nonces.nonce, nonceValue),
        eq(nonces.keyId, keyId),
        eq(nonces.used, false),
        gt(nonces.expiresAt, now)
      )
    )
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    keyId: row.keyId,
    nonce: row.nonce,
    expiresAt: row.expiresAt || new Date(),
    used: row.used || false,
  };
}

export async function markNonceUsed(id: string): Promise<boolean> {
  const result = await db
    .update(nonces)
    .set({ used: true })
    .where(eq(nonces.id, id));
  return (result.rowsAffected ?? 0) > 0;
}

export async function cleanupExpiredNonces(): Promise<number> {
  const now = new Date();
  const result = await db.delete(nonces).where(lt(nonces.expiresAt, now));
  return result.rowsAffected ?? 0;
}

// =====================
// Refresh Tokens CRUD
// =====================

export async function createRefreshToken(
  keyId: string,
  tokenHash: string,
  expiresInDays: number = 30
): Promise<RefreshToken> {
  const id = uuidv4();
  const now = new Date();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  await db.insert(refreshTokens).values({
    id,
    keyId,
    tokenHash,
    expiresAt,
    revoked: false,
    createdAt: now,
  });

  return {
    id,
    keyId,
    tokenHash,
    expiresAt,
    revoked: false,
    createdAt: now,
  };
}

export async function getRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
  const results = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    keyId: row.keyId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt || new Date(),
    revoked: row.revoked || false,
    createdAt: row.createdAt || new Date(),
  };
}

export async function getValidRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
  const now = new Date();
  const results = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        eq(refreshTokens.revoked, false),
        gt(refreshTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    keyId: row.keyId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt || new Date(),
    revoked: row.revoked || false,
    createdAt: row.createdAt || new Date(),
  };
}

export async function revokeRefreshToken(id: string): Promise<boolean> {
  const result = await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.id, id));
  return (result.rowsAffected ?? 0) > 0;
}

export async function revokeAllRefreshTokensForKey(keyId: string): Promise<number> {
  const result = await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.keyId, keyId));
  return result.rowsAffected ?? 0;
}

export async function cleanupExpiredRefreshTokens(): Promise<number> {
  const now = new Date();
  const result = await db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, now));
  return result.rowsAffected ?? 0;
}

// =====================
// API Keys CRUD
// =====================

export async function createApiKey(data: {
  keyId: string;
  name: string;
  keyHash: string;
  scopes?: string[];
}): Promise<ApiKey> {
  const id = uuidv4();
  const now = new Date();

  await db.insert(apiKeys).values({
    id,
    keyId: data.keyId,
    name: data.name,
    keyHash: data.keyHash,
    scopes: data.scopes || [],
    lastUsedAt: null,
    createdAt: now,
    revoked: false,
  });

  return {
    id,
    keyId: data.keyId,
    name: data.name,
    keyHash: data.keyHash,
    scopes: data.scopes || [],
    lastUsedAt: null,
    createdAt: now,
    revoked: false,
  };
}

export async function getApiKeyById(id: string): Promise<ApiKey | null> {
  const results = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.id, id))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    keyId: row.keyId,
    name: row.name,
    keyHash: row.keyHash,
    scopes: row.scopes || [],
    lastUsedAt: row.lastUsedAt || null,
    createdAt: row.createdAt || new Date(),
    revoked: row.revoked || false,
  };
}

export async function getApiKeyByHash(keyHash: string): Promise<ApiKey | null> {
  const results = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    keyId: row.keyId,
    name: row.name,
    keyHash: row.keyHash,
    scopes: row.scopes || [],
    lastUsedAt: row.lastUsedAt || null,
    createdAt: row.createdAt || new Date(),
    revoked: row.revoked || false,
  };
}

export async function getValidApiKeyByHash(keyHash: string): Promise<ApiKey | null> {
  const results = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.revoked, false)))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    keyId: row.keyId,
    name: row.name,
    keyHash: row.keyHash,
    scopes: row.scopes || [],
    lastUsedAt: row.lastUsedAt || null,
    createdAt: row.createdAt || new Date(),
    revoked: row.revoked || false,
  };
}

export async function getApiKeysByKeyId(keyId: string): Promise<ApiKey[]> {
  const results = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyId, keyId), eq(apiKeys.revoked, false)));

  return results.map((row) => ({
    id: row.id,
    keyId: row.keyId,
    name: row.name,
    keyHash: row.keyHash,
    scopes: row.scopes || [],
    lastUsedAt: row.lastUsedAt || null,
    createdAt: row.createdAt || new Date(),
    revoked: row.revoked || false,
  }));
}

export async function updateApiKeyLastUsed(id: string): Promise<boolean> {
  const result = await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, id));
  return (result.rowsAffected ?? 0) > 0;
}

export async function revokeApiKey(id: string): Promise<boolean> {
  const result = await db
    .update(apiKeys)
    .set({ revoked: true })
    .where(eq(apiKeys.id, id));
  return (result.rowsAffected ?? 0) > 0;
}

export async function revokeAllApiKeysForKey(keyId: string): Promise<number> {
  const result = await db
    .update(apiKeys)
    .set({ revoked: true })
    .where(eq(apiKeys.keyId, keyId));
  return result.rowsAffected ?? 0;
}

// =====================
// Utility Functions
// =====================

function generateSecureNonce(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return base64UrlEncode(array);
}

export function base64UrlEncode(data: Uint8Array): string {
  const base64 = Buffer.from(data).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

export function generateApiKeyToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return 'clb_' + base64UrlEncode(array);
}

export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(new Uint8Array(hashBuffer));
  }

  const { createHash } = await import('crypto');
  const hash = createHash('sha256').update(token).digest();
  return base64UrlEncode(new Uint8Array(hash));
}
