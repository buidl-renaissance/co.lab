import { v4 as uuidv4 } from 'uuid';
import { Collaboration } from '@/data/collaboration';
import client from './client';


export async function createCollaboration(collaboration: Omit<Collaboration, 'id' | 'createdAt' | 'updatedAt'>): Promise<Collaboration> {
  const id = uuidv4();
  const now = new Date();
  
  const newCollaboration = {
    id,
    ...collaboration,
    createdAt: now,
    updatedAt: now,
    participants: JSON.stringify(collaboration.participants || []),
    answers: JSON.stringify(collaboration.answers || {}),
    template: JSON.stringify(collaboration.template),
    status: collaboration.status || 'active',
    analysis: JSON.stringify(collaboration.analysis || {}),
  };

  await client('collaborations').insert(newCollaboration);
  
  return {
    ...collaboration,
    id,
    createdAt: now,
    updatedAt: now,
    participants: collaboration.participants || [],
    answers: collaboration.answers || {},
    status: collaboration.status || 'active'
  } as Collaboration;
}

export async function getCollaborationById(id: string): Promise<Collaboration | null> {
  const result = await client('collaborations').where({ id }).first();
  
  if (!result) return null;
  
  return {
    ...result,
    participants: JSON.parse(result.participants),
    answers: JSON.parse(result.answers),
    template: JSON.parse(result.template),
    analysis: JSON.parse(result.analysis),
  } as Collaboration;
}

export async function updateCollaboration(id: string, updates: Partial<Collaboration>): Promise<Collaboration | null> {
  const collaboration = await getCollaborationById(id);
  if (!collaboration) return null;
  
  const updatedData = {
    ...updates,
    updatedAt: new Date(),
    participants: updates.participants ? JSON.stringify(updates.participants) : undefined,
    answers: updates.answers ? JSON.stringify(updates.answers) : undefined,
    template: updates.template ? JSON.stringify(updates.template) : undefined
  };
  
  // Remove undefined values
  Object.keys(updatedData).forEach(key => 
    updatedData[key as keyof typeof updatedData] === undefined && delete updatedData[key as keyof typeof updatedData]
  );
  
  await client('collaborations').where({ id }).update(updatedData);
  
  return getCollaborationById(id);
}

export async function getAllCollaborations(): Promise<Collaboration[]> {
  const results = await client('collaborations').select('*');
  
  return results.map(result => ({
    ...result,
    participants: JSON.parse(result.participants),
    answers: JSON.parse(result.answers),
    template: JSON.parse(result.template),
    createdAt: new Date(result.createdAt),
    updatedAt: new Date(result.updatedAt)
  })) as Collaboration[];
}

export async function deleteCollaboration(id: string): Promise<boolean> {
  const deleted = await client('collaborations').where({ id }).delete();
  return deleted > 0;
}
