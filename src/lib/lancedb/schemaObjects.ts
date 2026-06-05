/**
 * Schema Objects Service
 * 
 * CRUD and search operations for schema.org-typed objects stored in LanceDB.
 */

import { v4 as uuidv4 } from 'uuid';
import { getLanceDB } from './client';
import { generateEmbedding, EMBEDDING_DIMENSIONS } from './embeddings';
import {
  SchemaObject,
  SchemaOrgType,
  CreateSchemaObjectInput,
  UpdateSchemaObjectInput,
  SchemaObjectSearchParams,
  SchemaObjectSearchResult,
  ObjectRelationship,
  getTextContentForEmbedding,
  isValidSchemaType,
  toJsonLd,
  JsonLdDocument,
} from '@/data/schemaObject';

const TABLE_NAME = 'schema_objects';
const RELATIONSHIPS_TABLE = 'object_relationships';

interface StoredSchemaObject {
  id: string;
  type: string;
  name: string;
  description: string;
  source: string;
  collaborationId: string;
  data: string;
  textContent: string;
  embedding: number[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  [key: string]: unknown;
}

interface StoredRelationship {
  id: string;
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
  relationshipType: string;
  collaborationId: string;
  createdAt: string;
  [key: string]: unknown;
}

async function getOrCreateTable() {
  const db = await getLanceDB();
  
  const tableNames = await db.tableNames();
  
  if (!tableNames.includes(TABLE_NAME)) {
    const emptyEmbedding = new Array(EMBEDDING_DIMENSIONS).fill(0);
    const initialData: StoredSchemaObject[] = [{
      id: '__init__',
      type: 'Person',
      name: '__init__',
      description: '',
      source: 'manual',
      collaborationId: '__init__',
      data: '{}',
      textContent: '',
      embedding: emptyEmbedding,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    }];
    
    await db.createTable(TABLE_NAME, initialData);
    
    const table = await db.openTable(TABLE_NAME);
    await table.delete('id = "__init__"');
  }
  
  return db.openTable(TABLE_NAME);
}

async function getOrCreateRelationshipsTable() {
  const db = await getLanceDB();
  
  const tableNames = await db.tableNames();
  
  if (!tableNames.includes(RELATIONSHIPS_TABLE)) {
    const initialData: StoredRelationship[] = [{
      id: '__init__',
      sourceId: '__init__',
      sourceType: 'Person',
      targetId: '__init__',
      targetType: 'Person',
      relationshipType: '__init__',
      collaborationId: '__init__',
      createdAt: new Date().toISOString(),
    }];
    
    await db.createTable(RELATIONSHIPS_TABLE, initialData);
    
    const table = await db.openTable(RELATIONSHIPS_TABLE);
    await table.delete('id = "__init__"');
  }
  
  return db.openTable(RELATIONSHIPS_TABLE);
}

function storedToSchemaObject(stored: StoredSchemaObject): SchemaObject {
  const data = JSON.parse(stored.data);
  return {
    '@type': stored.type as SchemaOrgType,
    '@id': stored.id,
    name: stored.name,
    description: stored.description || undefined,
    source: stored.source as SchemaObject['source'],
    collaborationId: stored.collaborationId,
    createdAt: stored.createdAt,
    updatedAt: stored.updatedAt,
    deletedAt: stored.deletedAt || undefined,
    ...data,
  } as SchemaObject;
}

function schemaObjectToStored(obj: SchemaObject, embedding: number[]): StoredSchemaObject {
  const { '@type': type, '@id': id, name, description, source, collaborationId, createdAt, updatedAt, deletedAt, ...rest } = obj;
  
  return {
    id,
    type,
    name,
    description: description || '',
    source,
    collaborationId,
    data: JSON.stringify(rest),
    textContent: getTextContentForEmbedding(obj),
    embedding,
    createdAt,
    updatedAt,
    deletedAt: deletedAt || null,
  };
}

export async function createSchemaObject(input: CreateSchemaObjectInput): Promise<SchemaObject> {
  if (!isValidSchemaType(input['@type'])) {
    throw new Error(`Invalid schema type: ${input['@type']}`);
  }
  
  const now = new Date().toISOString();
  const id = uuidv4();
  
  const obj: SchemaObject = {
    ...input,
    '@id': id,
    createdAt: now,
    updatedAt: now,
  } as SchemaObject;
  
  const textContent = getTextContentForEmbedding(obj);
  const embedding = await generateEmbedding(textContent);
  
  const stored = schemaObjectToStored(obj, embedding);
  
  const table = await getOrCreateTable();
  await table.add([stored]);
  
  return obj;
}

export async function getSchemaObject(id: string): Promise<SchemaObject | null> {
  const table = await getOrCreateTable();
  
  const results = await table
    .query()
    .where(`id = "${id}"`)
    .limit(1)
    .toArray();
  
  if (results.length === 0) {
    return null;
  }
  
  return storedToSchemaObject(results[0] as unknown as StoredSchemaObject);
}

export async function updateSchemaObject(
  id: string,
  updates: UpdateSchemaObjectInput
): Promise<SchemaObject | null> {
  const existing = await getSchemaObject(id);
  if (!existing) {
    return null;
  }
  
  const now = new Date().toISOString();
  
  const updated: SchemaObject = {
    ...existing,
    ...updates,
    '@id': id,
    '@type': existing['@type'],
    collaborationId: existing.collaborationId,
    createdAt: existing.createdAt,
    updatedAt: now,
  } as SchemaObject;
  
  const textContent = getTextContentForEmbedding(updated);
  const embedding = await generateEmbedding(textContent);
  
  const stored = schemaObjectToStored(updated, embedding);
  
  const table = await getOrCreateTable();
  await table.delete(`id = "${id}"`);
  await table.add([stored]);
  
  return updated;
}

export async function deleteSchemaObject(id: string, hard = false): Promise<boolean> {
  const existing = await getSchemaObject(id);
  if (!existing) {
    return false;
  }
  
  const table = await getOrCreateTable();
  
  if (hard) {
    await table.delete(`id = "${id}"`);
  } else {
    const now = new Date().toISOString();
    const updated: SchemaObject = {
      ...existing,
      deletedAt: now,
      updatedAt: now,
    } as SchemaObject;
    
    const textContent = getTextContentForEmbedding(updated);
    const embedding = await generateEmbedding(textContent);
    const stored = schemaObjectToStored(updated, embedding);
    
    await table.delete(`id = "${id}"`);
    await table.add([stored]);
  }
  
  return true;
}

export async function searchSchemaObjects(
  params: SchemaObjectSearchParams
): Promise<SchemaObjectSearchResult> {
  const {
    query,
    types,
    collaborationId,
    source,
    limit = 20,
    offset = 0,
    includeDeleted = false,
  } = params;
  
  const table = await getOrCreateTable();
  
  let searchQuery;
  
  if (query && query.trim()) {
    const embedding = await generateEmbedding(query);
    searchQuery = table.vectorSearch(embedding);
  } else {
    searchQuery = table.query();
  }
  
  const filters: string[] = [];
  
  if (!includeDeleted) {
    filters.push('deletedAt IS NULL');
  }
  
  if (types && types.length > 0) {
    const typeList = types.map(t => `"${t}"`).join(', ');
    filters.push(`type IN (${typeList})`);
  }
  
  if (collaborationId) {
    filters.push(`collaborationId = "${collaborationId}"`);
  }
  
  if (source) {
    filters.push(`source = "${source}"`);
  }
  
  if (filters.length > 0) {
    searchQuery = searchQuery.where(filters.join(' AND '));
  }
  
  let countQuery = table.query();
  if (filters.length > 0) {
    countQuery = countQuery.where(filters.join(' AND '));
  }
  const countResults = await countQuery.toArray();
  const total = countResults.length;
  
  const results = await searchQuery
    .limit(limit + offset)
    .toArray();
  
  const pagedResults = results.slice(offset, offset + limit);
  const objects = pagedResults.map(r => storedToSchemaObject(r as unknown as StoredSchemaObject));
  
  return {
    objects,
    total,
    limit,
    offset,
    hasMore: offset + objects.length < total,
  };
}

export async function listCollaborationObjects(
  collaborationId: string,
  includeDeleted = false
): Promise<SchemaObject[]> {
  const table = await getOrCreateTable();
  
  let filter = `collaborationId = "${collaborationId}"`;
  if (!includeDeleted) {
    filter += ' AND deletedAt IS NULL';
  }
  
  const results = await table
    .query()
    .where(filter)
    .toArray();
  
  return results.map(r => storedToSchemaObject(r as unknown as StoredSchemaObject));
}

export async function upsertSchemaObject(input: CreateSchemaObjectInput & { '@id'?: string }): Promise<SchemaObject> {
  if (input['@id']) {
    const existing = await getSchemaObject(input['@id']);
    if (existing) {
      const { '@type': _type, '@id': id, source: _source, collaborationId: _collaborationId, ...updates } = input;
      return (await updateSchemaObject(id!, updates as UpdateSchemaObjectInput))!;
    }
  }
  
  return createSchemaObject(input);
}

export async function linkObjects(
  sourceId: string,
  targetId: string,
  relationshipType: string,
  collaborationId: string
): Promise<ObjectRelationship> {
  const source = await getSchemaObject(sourceId);
  const target = await getSchemaObject(targetId);
  
  if (!source) {
    throw new Error(`Source object not found: ${sourceId}`);
  }
  if (!target) {
    throw new Error(`Target object not found: ${targetId}`);
  }
  
  const now = new Date().toISOString();
  const relationship: ObjectRelationship = {
    id: uuidv4(),
    sourceId,
    sourceType: source['@type'],
    targetId,
    targetType: target['@type'],
    relationshipType,
    collaborationId,
    createdAt: now,
  };
  
  const table = await getOrCreateRelationshipsTable();
  await table.add([{
    id: relationship.id,
    sourceId: relationship.sourceId,
    sourceType: relationship.sourceType,
    targetId: relationship.targetId,
    targetType: relationship.targetType,
    relationshipType: relationship.relationshipType,
    collaborationId: relationship.collaborationId,
    createdAt: relationship.createdAt,
  }]);
  
  return relationship;
}

export async function getObjectRelationships(
  objectId: string,
  direction: 'source' | 'target' | 'both' = 'both'
): Promise<ObjectRelationship[]> {
  const table = await getOrCreateRelationshipsTable();
  
  let filter: string;
  if (direction === 'source') {
    filter = `sourceId = "${objectId}"`;
  } else if (direction === 'target') {
    filter = `targetId = "${objectId}"`;
  } else {
    filter = `sourceId = "${objectId}" OR targetId = "${objectId}"`;
  }
  
  const results = await table
    .query()
    .where(filter)
    .toArray();
  
  return results.map(r => ({
    id: r.id as string,
    sourceId: r.sourceId as string,
    sourceType: r.sourceType as SchemaOrgType,
    targetId: r.targetId as string,
    targetType: r.targetType as SchemaOrgType,
    relationshipType: r.relationshipType as string,
    collaborationId: r.collaborationId as string,
    createdAt: r.createdAt as string,
  }));
}

export async function exportCollaborationJsonLd(collaborationId: string): Promise<JsonLdDocument> {
  const objects = await listCollaborationObjects(collaborationId);
  return toJsonLd(objects);
}
