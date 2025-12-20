import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { Collaboration } from '@/data/collaboration';
import { db } from './drizzle';
import { collaborations } from './schema';

export async function createCollaboration(
  collaboration: Omit<Collaboration, 'id' | 'createdAt' | 'updatedAt'> & {
    createdByUserId?: string | null;
  }
): Promise<Collaboration> {
  const id = uuidv4();
  const now = new Date();
  
  // Ensure creator is in participants if createdByUserId is provided
  let participants = collaboration.participants || [];
  if (collaboration.createdByUserId && !participants.includes(collaboration.createdByUserId)) {
    participants = [collaboration.createdByUserId, ...participants];
  }
  
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
    status: collaboration.status || ('active' as const),
    analysis: collaboration.analysis || null,
    transcripts: collaboration.transcripts || null,
    summary: collaboration.summary || '',
    createdByUserId: collaboration.createdByUserId || null,
  };

  await db.insert(collaborations).values(newCollaboration);
  
  return {
    ...collaboration,
    id,
    createdAt: now,
    updatedAt: now,
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
    return {
      id: result.id,
      title: result.title,
      description: result.description || '',
      template: result.template as Collaboration['template'],
      createdAt: result.createdAt || new Date(),
      updatedAt: result.updatedAt || new Date(),
      participants: (result.participants as string[]) || [],
      answers: (result.answers as { [key: string]: string }) || {},
      status: result.status as Collaboration['status'],
      analysis: result.analysis as Collaboration['analysis'],
      transcripts: (result.transcripts as string[]) || [],
      summary: result.summary || '',
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
  if (updates.participants !== undefined) updateData.participants = updates.participants;
  if (updates.answers !== undefined) updateData.answers = updates.answers;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.analysis !== undefined) updateData.analysis = updates.analysis;
  if (updates.transcripts !== undefined) updateData.transcripts = updates.transcripts;
  if (updates.summary !== undefined) updateData.summary = updates.summary;
  // Note: createdByUserId is intentionally not updatable after creation
  
  await db
    .update(collaborations)
    .set(updateData)
    .where(eq(collaborations.id, id));
  
  return getCollaborationById(id);
}

export async function getAllCollaborations(): Promise<Collaboration[]> {
  const results = await db.select().from(collaborations);
  
  return results.map((result) => ({
    id: result.id,
    title: result.title,
    description: result.description || '',
    template: result.template as Collaboration['template'],
    createdAt: result.createdAt || new Date(),
    updatedAt: result.updatedAt || new Date(),
    participants: (result.participants as string[]) || [],
    answers: (result.answers as { [key: string]: string }) || {},
    status: result.status as Collaboration['status'],
    analysis: result.analysis as Collaboration['analysis'],
    transcripts: (result.transcripts as string[]) || [],
    summary: result.summary || '',
  })) as Collaboration[];
}

export async function deleteCollaboration(id: string): Promise<boolean> {
  await db
    .delete(collaborations)
    .where(eq(collaborations.id, id));
  
  // Check if deletion was successful by querying if the record still exists
  const existing = await getCollaborationById(id);
  return existing === null;
}
