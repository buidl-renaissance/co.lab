import { v4 as uuidv4 } from 'uuid';
import client from './client';

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
  await client('github_accounts').insert(record);
  return record as GitHubAccount;
}

export async function getGitHubAccountByUserId(
  userId: string
): Promise<GitHubAccount | null> {
  const row = await client('github_accounts').where({ userId }).first();
  return row ? (row as GitHubAccount) : null;
}

export async function getGitHubAccountByGitHubUserId(
  githubUserId: string
): Promise<GitHubAccount | null> {
  const row = await client('github_accounts').where({ githubUserId }).first();
  return row ? (row as GitHubAccount) : null;
}

export async function upsertGitHubAccount(
  data: Omit<GitHubAccount, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GitHubAccount> {
  const existing = await getGitHubAccountByGitHubUserId(data.githubUserId);
  const now = new Date();

  if (existing) {
    await client('github_accounts')
      .where({ id: existing.id })
      .update({
        ...data,
        updatedAt: now,
      });
    return { ...existing, ...data, updatedAt: now } as GitHubAccount;
  }

  const id = uuidv4();
  const record = { id, ...data, createdAt: now, updatedAt: now };
  await client('github_accounts').insert(record);
  return record as GitHubAccount;
}

export async function upsertGitHubRepo(
  owner: string,
  name: string,
  displayName: string
): Promise<GitHubRepo> {
  const existing = await client('github_repos').where({ owner, name }).first();
  const now = new Date();

  if (existing) {
    await client('github_repos')
      .where({ id: existing.id })
      .update({ displayName, updatedAt: now });

    return { ...existing, displayName, updatedAt: now } as GitHubRepo;
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

  await client('github_repos').insert(record);
  return record as GitHubRepo;
}

export async function createIssueLink(
  data: Omit<
    GitHubIssueLink,
    'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt'
  >
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

  await client('github_issue_links').insert(record);
  return record as GitHubIssueLink;
}

export async function getIssueLinksForCollaboration(
  collaborationId: string
): Promise<GitHubIssueLink[]> {
  const rows = await client('github_issue_links').where({ collaborationId });
  return rows as GitHubIssueLink[];
}


