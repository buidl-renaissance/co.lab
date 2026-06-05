/**
 * Schema Collaboration Database Operations
 * 
 * CRUD operations for schema collaboration metadata stored in Turso/SQLite.
 */

import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import { schemaCollaborations } from './schema';
import { SchemaCollaboration } from '@/data/schemaObject';

export async function createSchemaCollaboration(
  input: Omit<SchemaCollaboration, 'id' | 'createdAt' | 'updatedAt'> & { createdByUserId?: string }
): Promise<SchemaCollaboration> {
  const id = uuidv4();
  const now = new Date();

  const newCollaboration = {
    id,
    name: input.name || null,
    description: input.description || null,
    templateId: input.templateId || null,
    chatThreadId: input.chatThreadId || null,
    createdByUserId: input.createdByUserId || null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(schemaCollaborations).values(newCollaboration);

  return {
    id,
    name: input.name,
    description: input.description,
    templateId: input.templateId,
    chatThreadId: input.chatThreadId,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export async function getSchemaCollaborationById(id: string): Promise<SchemaCollaboration | null> {
  const results = await db
    .select()
    .from(schemaCollaborations)
    .where(eq(schemaCollaborations.id, id))
    .limit(1);

  if (results.length === 0) {
    return null;
  }

  const result = results[0];
  return {
    id: result.id,
    name: result.name || undefined,
    description: result.description || undefined,
    templateId: result.templateId || undefined,
    chatThreadId: result.chatThreadId || undefined,
    createdAt: result.createdAt ? new Date(result.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: result.updatedAt ? new Date(result.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export async function updateSchemaCollaboration(
  id: string,
  updates: Partial<Omit<SchemaCollaboration, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<SchemaCollaboration | null> {
  const existing = await getSchemaCollaborationById(id);
  if (!existing) {
    return null;
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (updates.name !== undefined) updateData.name = updates.name || null;
  if (updates.description !== undefined) updateData.description = updates.description || null;
  if (updates.templateId !== undefined) updateData.templateId = updates.templateId || null;
  if (updates.chatThreadId !== undefined) updateData.chatThreadId = updates.chatThreadId || null;

  await db
    .update(schemaCollaborations)
    .set(updateData)
    .where(eq(schemaCollaborations.id, id));

  return getSchemaCollaborationById(id);
}

export async function deleteSchemaCollaboration(id: string): Promise<boolean> {
  const existing = await getSchemaCollaborationById(id);
  if (!existing) {
    return false;
  }

  await db.delete(schemaCollaborations).where(eq(schemaCollaborations.id, id));

  return true;
}

export async function getAllSchemaCollaborations(): Promise<SchemaCollaboration[]> {
  const results = await db.select().from(schemaCollaborations);

  return results.map(result => ({
    id: result.id,
    name: result.name || undefined,
    description: result.description || undefined,
    templateId: result.templateId || undefined,
    chatThreadId: result.chatThreadId || undefined,
    createdAt: result.createdAt ? new Date(result.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: result.updatedAt ? new Date(result.updatedAt).toISOString() : new Date().toISOString(),
  }));
}

export async function getSchemaCollaborationsByChatThread(chatThreadId: string): Promise<SchemaCollaboration[]> {
  const results = await db
    .select()
    .from(schemaCollaborations)
    .where(eq(schemaCollaborations.chatThreadId, chatThreadId));

  return results.map(result => ({
    id: result.id,
    name: result.name || undefined,
    description: result.description || undefined,
    templateId: result.templateId || undefined,
    chatThreadId: result.chatThreadId || undefined,
    createdAt: result.createdAt ? new Date(result.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: result.updatedAt ? new Date(result.updatedAt).toISOString() : new Date().toISOString(),
  }));
}

export async function getOrCreateSchemaCollaboration(
  collaborationId: string,
  defaults?: Partial<Omit<SchemaCollaboration, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<SchemaCollaboration> {
  const existing = await getSchemaCollaborationById(collaborationId);
  if (existing) {
    return existing;
  }

  const id = collaborationId;
  const now = new Date();

  const newCollaboration = {
    id,
    name: defaults?.name || null,
    description: defaults?.description || null,
    templateId: defaults?.templateId || null,
    chatThreadId: defaults?.chatThreadId || null,
    createdByUserId: null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(schemaCollaborations).values(newCollaboration);

  return {
    id,
    name: defaults?.name,
    description: defaults?.description,
    templateId: defaults?.templateId,
    chatThreadId: defaults?.chatThreadId,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}
