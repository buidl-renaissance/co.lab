/**
 * POST /api/schema-objects - Create or upsert a schema object
 * GET /api/schema-objects - List schema objects (with optional filters)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import {
  createSchemaObject,
  upsertSchemaObject,
  searchSchemaObjects,
} from '@/lib/lancedb';
import { getOrCreateSchemaCollaboration } from '@/db/schemaCollaboration';
import { CreateSchemaObjectInput, SchemaOrgType, SchemaObjectSource, isValidSchemaType } from '@/data/schemaObject';

type ResponseData = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;

      if (!body['@type'] || !isValidSchemaType(body['@type'])) {
        return res.status(400).json({
          success: false,
          error: `Invalid or missing @type. Must be one of: Person, Event, Project, Organization, Place`,
        });
      }

      if (!body.name || typeof body.name !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: name',
        });
      }

      if (!body.collaborationId || typeof body.collaborationId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: collaborationId',
        });
      }

      await getOrCreateSchemaCollaboration(body.collaborationId);

      const input: CreateSchemaObjectInput & { '@id'?: string } = {
        '@type': body['@type'] as SchemaOrgType,
        '@id': body['@id'],
        name: body.name,
        description: body.description,
        source: (body.source as SchemaObjectSource) || 'manual',
        collaborationId: body.collaborationId,
        ...body,
      };

      const obj = body['@id']
        ? await upsertSchemaObject(input)
        : await createSchemaObject(input);

      return res.status(201).json({
        success: true,
        data: obj,
      });
    } catch (error) {
      console.error('Error creating schema object:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create schema object',
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const {
        query,
        types,
        collaborationId,
        source,
        limit,
        offset,
        includeDeleted,
      } = req.query;

      const result = await searchSchemaObjects({
        query: query as string | undefined,
        types: types ? (Array.isArray(types) ? types : [types]) as SchemaOrgType[] : undefined,
        collaborationId: collaborationId as string | undefined,
        source: source as SchemaObjectSource | undefined,
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
        includeDeleted: includeDeleted === 'true',
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error searching schema objects:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to search schema objects',
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
