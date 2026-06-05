/**
 * LanceDB Client Singleton
 * 
 * Provides a singleton LanceDB connection for the application.
 * Supports both local development and cloud deployment.
 */

import lancedb from '@lancedb/lancedb';

let db: lancedb.Connection | null = null;

const LANCEDB_URI = process.env.LANCEDB_URI || './data/lancedb';

export async function getLanceDB(): Promise<lancedb.Connection> {
  if (!db) {
    db = await lancedb.connect(LANCEDB_URI);
  }
  return db;
}

export async function closeLanceDB(): Promise<void> {
  if (db) {
    db = null;
  }
}
