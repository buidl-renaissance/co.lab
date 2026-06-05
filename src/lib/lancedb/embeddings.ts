/**
 * Embeddings Service
 * 
 * Generates text embeddings using OpenAI's text-embedding-3-small model.
 */

import { OpenAI } from 'openai';

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

export { EMBEDDING_DIMENSIONS };

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    return new Array(EMBEDDING_DIMENSIONS).fill(0);
  }
  
  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim(),
  });
  
  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }
  
  const cleanTexts = texts.map(t => t?.trim() || '');
  
  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: cleanTexts,
  });
  
  return response.data.map(d => d.embedding);
}
