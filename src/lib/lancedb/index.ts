/**
 * LanceDB Schema Objects Module
 * 
 * Re-exports all LanceDB-related functionality for schema.org object storage.
 */

export { getLanceDB, closeLanceDB } from './client';
export { generateEmbedding, generateEmbeddings, EMBEDDING_DIMENSIONS } from './embeddings';
export {
  createSchemaObject,
  getSchemaObject,
  updateSchemaObject,
  deleteSchemaObject,
  searchSchemaObjects,
  listCollaborationObjects,
  upsertSchemaObject,
  linkObjects,
  getObjectRelationships,
  exportCollaborationJsonLd,
} from './schemaObjects';
