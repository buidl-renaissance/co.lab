import { v4 as uuidv4 } from 'uuid';
import { eq, sql, and, desc } from 'drizzle-orm';
import { Collaboration, ShareMode } from '@/data/collaboration';
import { db } from './drizzle';
import { collaborations } from './schema';

// Helper function to create comma-separated collaborator usernames string
function buildCollaboratorIds(usernames: string[]): string {
  // Filter out empty strings and join with commas
  // Wrap each username with commas for precise matching: ,user1,user2,user3,
  const filtered = usernames.filter(u => u && u.trim());
  return filtered.length > 0 ? `,${filtered.join(',')},` : '';
}

export async function createCollaboration(
  collaboration: Omit<Collaboration, 'id' | 'createdAt' | 'updatedAt'> & {
    createdByUsername?: string | null;
  }
): Promise<Collaboration> {
  const id = uuidv4();
  const now = new Date();
  
  // Ensure creator is in participants if createdByUsername is provided
  let participants = collaboration.participants || [];
  if (collaboration.createdByUsername && !participants.includes(collaboration.createdByUsername)) {
    participants = [collaboration.createdByUsername, ...participants];
  }
  
  // Build collaboratorIds directly from participant usernames
  const collaboratorIds = buildCollaboratorIds(participants);
  
  // Drizzle handles JSON serialization automatically for columns with mode: 'json'
  const newCollaboration = {
    id,
    title: collaboration.title,
    description: collaboration.description || null,
    template: collaboration.template,
    createdAt: now,
    updatedAt: now,
    answers: collaboration.answers,
    participants,
    collaboratorIds,
    status: collaboration.status || ('active' as const),
    analysis: collaboration.analysis || null,
    transcripts: collaboration.transcripts || null,
    summary: collaboration.summary || '',
    createdByUserId: collaboration.createdByUsername || null,
    eventDetails: collaboration.eventDetails || null,
    shareToken: collaboration.shareToken || null,
    shareMode: collaboration.shareMode || ('private' as const),
    tags: collaboration.tags || null,
    // Entity card fields
    coverImageUrl: collaboration.coverImageUrl || null,
    category: collaboration.category || null,
    capacity: collaboration.capacity || null,
    rsvpCount: collaboration.rsvpCount ?? 0,
  };

  await db.insert(collaborations).values(newCollaboration);
  
  return {
    ...collaboration,
    id,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    participants,
    answers: collaboration.answers || {},
    status: collaboration.status || 'active',
    transcripts: collaboration.transcripts || [],
    summary: collaboration.summary || '',
    shareMode: collaboration.shareMode || 'private',
    tags: collaboration.tags || [],
    coverImageUrl: collaboration.coverImageUrl,
    category: collaboration.category,
    capacity: collaboration.capacity,
    rsvpCount: collaboration.rsvpCount ?? 0,
  } as Collaboration;
}

// Helper to map DB result to Collaboration interface
function mapDbResultToCollaboration(result: typeof collaborations.$inferSelect): Collaboration {
  const createdAt = result.createdAt ? new Date(result.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = result.updatedAt ? new Date(result.updatedAt).toISOString() : new Date().toISOString();
  
  return {
    id: result.id,
    title: result.title,
    description: result.description || '',
    template: result.template as Collaboration['template'],
    createdAt,
    updatedAt,
    participants: (result.participants as string[]) || [],
    answers: (result.answers as { [key: string]: string }) || {},
    status: result.status as Collaboration['status'],
    analysis: result.analysis as Collaboration['analysis'],
    transcripts: (result.transcripts as string[]) || [],
    summary: result.summary || '',
    eventDetails: result.eventDetails as Collaboration['eventDetails'],
    shareToken: result.shareToken || undefined,
    shareMode: (result.shareMode as ShareMode) || 'private',
    tags: (result.tags as string[]) || [],
    // Entity card fields
    coverImageUrl: result.coverImageUrl || undefined,
    category: result.category || undefined,
    capacity: result.capacity || undefined,
    rsvpCount: result.rsvpCount ?? 0,
  };
}

export async function getCollaborationById(id: string): Promise<Collaboration | null> {
  const results = await db.select().from(collaborations).where(eq(collaborations.id, id)).limit(1);
  
  if (results.length === 0) return null;
  
  try {
    return mapDbResultToCollaboration(results[0]);
  } catch (error) {
    console.error('Error parsing collaboration data:', error);
    return null;
  }
}

export async function updateCollaboration(
  id: string,
  updates: Partial<Collaboration>
): Promise<Collaboration | null> {
  const collaboration = await getCollaborationById(id);
  if (!collaboration) return null;
  
  // Build update object, only including fields that are provided
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };
  
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.template !== undefined) updateData.template = updates.template;
  if (updates.participants !== undefined) {
    updateData.participants = updates.participants;
    // Keep collaboratorIds in sync with participant usernames
    updateData.collaboratorIds = buildCollaboratorIds(updates.participants);
  }
  if (updates.answers !== undefined) updateData.answers = updates.answers;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.analysis !== undefined) updateData.analysis = updates.analysis;
  if (updates.transcripts !== undefined) updateData.transcripts = updates.transcripts;
  if (updates.summary !== undefined) updateData.summary = updates.summary;
  if (updates.eventDetails !== undefined) updateData.eventDetails = updates.eventDetails;
  if (updates.shareToken !== undefined) updateData.shareToken = updates.shareToken;
  if (updates.shareMode !== undefined) updateData.shareMode = updates.shareMode;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  // Entity card fields
  if (updates.coverImageUrl !== undefined) updateData.coverImageUrl = updates.coverImageUrl;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.capacity !== undefined) updateData.capacity = updates.capacity;
  if (updates.rsvpCount !== undefined) updateData.rsvpCount = updates.rsvpCount;
  // Note: createdByUserId is intentionally not updatable after creation
  
  await db
    .update(collaborations)
    .set(updateData)
    .where(eq(collaborations.id, id));
  
  return getCollaborationById(id);
}

export async function getAllCollaborations(): Promise<Collaboration[]> {
  const results = await db.select().from(collaborations);
  return results.map(mapDbResultToCollaboration);
}

export async function getCollaborationsByUsername(username: string): Promise<Collaboration[]> {
  // Query collaborations where the username is in the collaboratorIds comma-separated string
  // OR in the participants JSON array (for backwards compatibility with older data)
  // The collaboratorIds field is stored as ",user1,user2,user3," for precise matching
  const searchPattern = `,${username},`;
  // Also search in participants JSON (stored as ["user1", "user2"])
  const jsonPattern = `"${username}"`;
  const results = await db
    .select()
    .from(collaborations)
    .where(
      sql`${collaborations.collaboratorIds} LIKE ${'%' + searchPattern + '%'} 
          OR ${collaborations.participants} LIKE ${'%' + jsonPattern + '%'}
          OR ${collaborations.createdByUserId} = ${username}`
    );
  
  return results.map(mapDbResultToCollaboration);
}

export async function deleteCollaboration(id: string): Promise<boolean> {
  await db
    .delete(collaborations)
    .where(eq(collaborations.id, id));
  
  // Check if deletion was successful by querying if the record still exists
  const existing = await getCollaborationById(id);
  return existing === null;
}

// Share functionality

export async function getCollaborationByShareToken(shareToken: string): Promise<Collaboration | null> {
  const results = await db
    .select()
    .from(collaborations)
    .where(eq(collaborations.shareToken, shareToken))
    .limit(1);
  
  if (results.length === 0) return null;
  
  const result = results[0];
  
  // Only return if shareMode allows access (link or public)
  if (result.shareMode !== 'link' && result.shareMode !== 'public') {
    return null;
  }
  
  return mapDbResultToCollaboration(result);
}

export async function generateShareToken(id: string): Promise<{ shareToken: string; shareUrl: string } | null> {
  const collaboration = await getCollaborationById(id);
  if (!collaboration) return null;
  
  const shareToken = uuidv4();
  
  await db
    .update(collaborations)
    .set({
      shareToken,
      shareMode: 'link' as const,
      updatedAt: new Date(),
    })
    .where(eq(collaborations.id, id));
  
  // Build share URL - use environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://co.lab.builddetroit.xyz';
  const shareUrl = `${baseUrl}/share/${shareToken}`;
  
  return { shareToken, shareUrl };
}

export async function revokeShareToken(id: string): Promise<boolean> {
  const collaboration = await getCollaborationById(id);
  if (!collaboration) return false;
  
  await db
    .update(collaborations)
    .set({
      shareToken: null,
      shareMode: 'private' as const,
      updatedAt: new Date(),
    })
    .where(eq(collaborations.id, id));
  
  return true;
}

// Paginated list with filters

export interface CollaborationListParams {
  q?: string;           // Search query (title, description)
  template?: string;    // Filter by template id
  status?: string;      // Filter by status
  tag?: string;         // Filter by tag
  limit?: number;       // Page size (default 20)
  offset?: number;      // Pagination offset (default 0)
}

export interface CollaborationListResult {
  collaborations: Collaboration[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export async function listCollaborations(params: CollaborationListParams = {}): Promise<CollaborationListResult> {
  const { q, template, status, tag, limit = 20, offset = 0 } = params;
  
  // Build WHERE conditions
  const conditions: ReturnType<typeof eq>[] = [];
  
  // Search query - search in title and description
  if (q) {
    const searchPattern = `%${q}%`;
    conditions.push(
      sql`(${collaborations.title} LIKE ${searchPattern} OR ${collaborations.description} LIKE ${searchPattern})`
    );
  }
  
  // Template filter - template is stored as JSON, search by id
  if (template) {
    const templatePattern = `"id":"${template}"`;
    conditions.push(
      sql`${collaborations.template} LIKE ${'%' + templatePattern + '%'}`
    );
  }
  
  // Status filter
  if (status) {
    conditions.push(eq(collaborations.status, status as 'active' | 'completed' | 'archived'));
  }
  
  // Tag filter - tags is stored as JSON array
  if (tag) {
    const tagPattern = `"${tag}"`;
    conditions.push(
      sql`${collaborations.tags} LIKE ${'%' + tagPattern + '%'}`
    );
  }
  
  // Build query with conditions
  let query = db.select().from(collaborations);
  
  if (conditions.length > 0) {
    // @ts-expect-error - Drizzle typing complexity
    query = query.where(and(...conditions));
  }
  
  // Get total count
  const countQuery = db.select({ count: sql<number>`count(*)` }).from(collaborations);
  if (conditions.length > 0) {
    countQuery.where(and(...conditions));
  }
  const countResult = await countQuery;
  const total = Number(countResult[0]?.count || 0);
  
  // Apply pagination and ordering
  const results = await query
    .orderBy(desc(collaborations.updatedAt))
    .limit(limit)
    .offset(offset);
  
  return {
    collaborations: results.map(mapDbResultToCollaboration),
    total,
    limit,
    offset,
    hasMore: offset + results.length < total,
  };
}

// Get public collaborations (shareMode = 'public')
export async function getPublicCollaborations(params: Omit<CollaborationListParams, 'status'> = {}): Promise<CollaborationListResult> {
  const { q, template, tag, limit = 20, offset = 0 } = params;
  
  // Build WHERE conditions - always filter for public shareMode
  const conditions: ReturnType<typeof eq>[] = [
    eq(collaborations.shareMode, 'public')
  ];
  
  // Search query
  if (q) {
    const searchPattern = `%${q}%`;
    conditions.push(
      sql`(${collaborations.title} LIKE ${searchPattern} OR ${collaborations.description} LIKE ${searchPattern})`
    );
  }
  
  // Template filter
  if (template) {
    const templatePattern = `"id":"${template}"`;
    conditions.push(
      sql`${collaborations.template} LIKE ${'%' + templatePattern + '%'}`
    );
  }
  
  // Tag filter
  if (tag) {
    const tagPattern = `"${tag}"`;
    conditions.push(
      sql`${collaborations.tags} LIKE ${'%' + tagPattern + '%'}`
    );
  }
  
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(collaborations)
    .where(and(...conditions));
  const total = Number(countResult[0]?.count || 0);
  
  // Query with pagination
  const results = await db
    .select()
    .from(collaborations)
    .where(and(...conditions))
    .orderBy(desc(collaborations.updatedAt))
    .limit(limit)
    .offset(offset);
  
  return {
    collaborations: results.map(mapDbResultToCollaboration),
    total,
    limit,
    offset,
    hasMore: offset + results.length < total,
  };
}
