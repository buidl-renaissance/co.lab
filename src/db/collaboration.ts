import { v4 as uuidv4 } from 'uuid';
import { eq, sql } from 'drizzle-orm';
import { Collaboration } from '@/data/collaboration';
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
  } as Collaboration;
}

export async function getCollaborationById(id: string): Promise<Collaboration | null> {
  const results = await db.select().from(collaborations).where(eq(collaborations.id, id)).limit(1);
  
  if (results.length === 0) return null;
  
  const result = results[0];
  
  try {
    // Drizzle automatically deserializes JSON fields due to mode: 'json'
    // Convert dates to ISO strings for Next.js serialization
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
    } as Collaboration;
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
  // Note: createdByUserId is intentionally not updatable after creation
  
  await db
    .update(collaborations)
    .set(updateData)
    .where(eq(collaborations.id, id));
  
  return getCollaborationById(id);
}

export async function getAllCollaborations(): Promise<Collaboration[]> {
  const results = await db.select().from(collaborations);
  
  return results.map((result) => {
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
    };
  }) as Collaboration[];
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
  
  return results.map((result) => {
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
    };
  }) as Collaboration[];
}

export async function deleteCollaboration(id: string): Promise<boolean> {
  await db
    .delete(collaborations)
    .where(eq(collaborations.id, id));
  
  // Check if deletion was successful by querying if the record still exists
  const existing = await getCollaborationById(id);
  return existing === null;
}
