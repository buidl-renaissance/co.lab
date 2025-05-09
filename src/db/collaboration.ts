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
    participants: typeof collaboration.participants === 'string' ? JSON.parse(collaboration.participants) : collaboration.participants,
    answers: typeof collaboration.answers === 'string' ? JSON.parse(collaboration.answers) : collaboration.answers,
    template: typeof collaboration.template === 'string' ? JSON.parse(collaboration.template) : collaboration.template,
    status: collaboration.status || 'active',
    analysis: typeof collaboration.analysis === 'string' ? JSON.parse(collaboration.analysis) : collaboration.analysis,
    transcripts: typeof collaboration.transcripts === 'string' ? JSON.parse(collaboration.transcripts) : collaboration.transcripts,
    summary: "",
  };

  await client('collaborations').insert(newCollaboration);
  
  return {
    ...collaboration,
    id,
    createdAt: now,
    updatedAt: now,
    participants: collaboration.participants || [],
    answers: collaboration.answers || {},
    status: collaboration.status || 'active',
    transcripts: collaboration.transcripts || [],
    summary: "",
  } as Collaboration;
}

export async function getCollaborationById(id: string): Promise<Collaboration | null> {
  const result = await client('collaborations').where({ id }).first();
  
  if (!result) return null;
  
  return {
    ...result,
    participants: typeof result.participants === 'string' ? JSON.parse(result.participants) : result.participants,
    answers: typeof result.answers === 'string' ? JSON.parse(result.answers) : result.answers,
    template: typeof result.template === 'string' ? JSON.parse(result.template) : result.template,
    analysis: typeof result.analysis === 'string' ? JSON.parse(result.analysis) : result.analysis,
    transcripts: typeof result.transcripts === 'string' ? JSON.parse(result.transcripts) : result.transcripts
  } as Collaboration;
}

export async function updateCollaboration(id: string, updates: Partial<Collaboration>): Promise<Collaboration | null> {
  const collaboration = await getCollaborationById(id);
  if (!collaboration) return null;
  
  const updatedData = {
    ...updates,
    updatedAt: new Date(),
    participants: updates.participants ? typeof updates.participants === 'string' ? JSON.stringify(updates.participants) : updates.participants : undefined,
    answers: updates.answers ? typeof updates.answers === 'string' ? JSON.stringify(updates.answers) : updates.answers : undefined,
    template: updates.template ? typeof updates.template === 'string' ? JSON.stringify(updates.template) : updates.template : undefined,
    analysis: updates.analysis ? typeof updates.analysis === 'string' ? JSON.stringify(updates.analysis) : updates.analysis : undefined,
    transcripts: updates.transcripts ? typeof updates.transcripts === 'string' ? JSON.stringify(updates.transcripts) : updates.transcripts : undefined,
    summary: updates.summary ? updates.summary : undefined,
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
    participants: typeof result.participants === 'string' ? JSON.parse(result.participants) : result.participants,
    answers: typeof result.answers === 'string' ? JSON.parse(result.answers) : result.answers,
    template: typeof result.template === 'string' ? JSON.parse(result.template) : result.template,
    createdAt: new Date(result.createdAt),
    updatedAt: new Date(result.updatedAt)
  })) as Collaboration[];
}

export async function deleteCollaboration(id: string): Promise<boolean> {
  const deleted = await client('collaborations').where({ id }).delete();
  return deleted > 0;
}
