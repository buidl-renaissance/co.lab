import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm';
import { db } from './drizzle';
import { githubAccounts, githubRepos, githubIssueLinks } from './schema';

export interface GitHubAccount {
  id: string;
  userId: string;
  githubLogin: string;
  githubUserId: string;
  accessToken: string;
  tokenType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GitHubRepo {
  id: string;
  owner: string;
  name: string;
  displayName: string;
  projectId?: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GitHubIssueLink {
  id: string;
  collaborationId: string;
  githubRepoId: string;
  issueNumber: number;
  issueUrl: string;
  issueState: string;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GitHubPullRequestLink {
  id: string;
  githubRepoId: string;
  pullNumber: number;
  headSha: string;
  status: string;
  deploymentStatus?: string | null;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function createGitHubAccount(
  data: Omit<GitHubAccount, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GitHubAccount> {
  const id = uuidv4();
  const now = new Date();
  const record = { id, ...data, createdAt: now, updatedAt: now };
  await db.insert(githubAccounts).values(record);
  return record as GitHubAccount;
}

export async function getGitHubAccountByUserId(
  userId: string
): Promise<GitHubAccount | null> {
  const results = await db
    .select()
    .from(githubAccounts)
    .where(eq(githubAccounts.userId, userId))
    .limit(1);
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    userId: row.userId,
    githubLogin: row.githubLogin,
    githubUserId: row.githubUserId,
    accessToken: row.accessToken,
    tokenType: row.tokenType,
    createdAt: row.createdAt || new Date(),
    updatedAt: row.updatedAt || new Date(),
  } as GitHubAccount;
}

export async function getGitHubAccountByGitHubUserId(
  githubUserId: string
): Promise<GitHubAccount | null> {
  const results = await db
    .select()
    .from(githubAccounts)
    .where(eq(githubAccounts.githubUserId, githubUserId))
    .limit(1);
  
  if (results.length === 0) return null;
  
  const row = results[0];
  return {
    id: row.id,
    userId: row.userId,
    githubLogin: row.githubLogin,
    githubUserId: row.githubUserId,
    accessToken: row.accessToken,
    tokenType: row.tokenType,
    createdAt: row.createdAt || new Date(),
    updatedAt: row.updatedAt || new Date(),
  } as GitHubAccount;
}

export async function upsertGitHubAccount(
  data: Omit<GitHubAccount, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GitHubAccount> {
  const existing = await getGitHubAccountByGitHubUserId(data.githubUserId);
  const now = new Date();

  if (existing) {
    await db
      .update(githubAccounts)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(eq(githubAccounts.id, existing.id));
    
    return { ...existing, ...data, updatedAt: now } as GitHubAccount;
  }

  const id = uuidv4();
  const record = { id, ...data, createdAt: now, updatedAt: now };
  await db.insert(githubAccounts).values(record);
  return record as GitHubAccount;
}

export async function upsertGitHubRepo(
  owner: string,
  name: string,
  displayName: string
): Promise<GitHubRepo> {
  const results = await db
    .select()
    .from(githubRepos)
    .where(and(eq(githubRepos.owner, owner), eq(githubRepos.name, name)))
    .limit(1);
  
  const existing = results[0];
  const now = new Date();

  if (existing) {
    await db
      .update(githubRepos)
      .set({ displayName, updatedAt: now })
      .where(eq(githubRepos.id, existing.id));

    return {
      ...existing,
      displayName,
      updatedAt: now,
    } as GitHubRepo;
  }

  const id = uuidv4();
  const record = {
    id,
    owner,
    name,
    displayName,
    projectId: null,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(githubRepos).values(record);
  return record as GitHubRepo;
}

export async function createIssueLink(
  data: Omit<GitHubIssueLink, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt'>
): Promise<GitHubIssueLink> {
  const id = uuidv4();
  const now = new Date();
  const record = {
    id,
    ...data,
    lastSyncedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(githubIssueLinks).values(record);
  return record as GitHubIssueLink;
}

export async function getIssueLinksForCollaboration(
  collaborationId: string
): Promise<GitHubIssueLink[]> {
  const rows = await db
    .select()
    .from(githubIssueLinks)
    .where(eq(githubIssueLinks.collaborationId, collaborationId));
  
  return rows.map((row) => ({
    id: row.id,
    collaborationId: row.collaborationId,
    githubRepoId: row.githubRepoId,
    issueNumber: row.issueNumber,
    issueUrl: row.issueUrl,
    issueState: row.issueState,
    lastSyncedAt: row.lastSyncedAt || new Date(),
    createdAt: row.createdAt || new Date(),
    updatedAt: row.updatedAt || new Date(),
  })) as GitHubIssueLink[];
}
