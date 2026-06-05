/**
 * MCP Tools for Schema.org Object Operations
 * 
 * Defines and registers MCP tools for CRUD and search operations
 * on schema.org-typed objects stored in LanceDB.
 */

import { McpToolDefinition, JsonValue } from './types';
import { globalToolRegistry } from './registry';
import {
  getSchemaObject,
  searchSchemaObjects,
  listCollaborationObjects,
  upsertSchemaObject,
  linkObjects,
  exportCollaborationJsonLd,
} from '@/lib/lancedb';
import {
  getOrCreateSchemaCollaboration,
  getSchemaCollaborationById,
} from '@/db/schemaCollaboration';
import {
  SchemaOrgType,
  SchemaObjectSource,
  isValidSchemaType,
} from '@/data/schemaObject';

export const schemaObjectToolDefinitions: McpToolDefinition[] = [
  {
    name: 'upsert_schema_object',
    description: 'Create or update a schema.org-typed object (Person, Event, Project, Organization, Place). If @id is provided and exists, updates the object; otherwise creates a new one.',
    inputSchema: {
      type: 'object',
      properties: {
        '@type': {
          type: 'string',
          enum: ['Person', 'Event', 'Project', 'Organization', 'Place'],
          description: 'The schema.org type of the object',
        },
        '@id': {
          type: 'string',
          description: 'Optional: UUID of existing object to update',
        },
        name: {
          type: 'string',
          description: 'Name/title of the object (required)',
        },
        description: {
          type: 'string',
          description: 'Description of the object',
        },
        source: {
          type: 'string',
          enum: ['voice_session', 'manual', 'agent', 'import'],
          description: 'Source of the object (default: agent)',
        },
        collaborationId: {
          type: 'string',
          description: 'ID of the collaboration this object belongs to (required)',
        },
        givenName: { type: 'string', description: 'Person: First name' },
        familyName: { type: 'string', description: 'Person: Last name' },
        email: { type: 'string', description: 'Email address' },
        telephone: { type: 'string', description: 'Phone number' },
        jobTitle: { type: 'string', description: 'Person: Job title' },
        worksFor: { type: 'string', description: 'Person: Organization name/ID' },
        url: { type: 'string', description: 'Website URL' },
        image: { type: 'string', description: 'Image URL' },
        startDate: { type: 'string', description: 'Event: Start date (ISO8601)' },
        endDate: { type: 'string', description: 'Event: End date (ISO8601)' },
        location: { type: 'string', description: 'Event/Place: Location name' },
        organizer: { type: 'string', description: 'Event: Organizer name/ID' },
        address: { type: 'string', description: 'Place/Organization: Address' },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Project: Keywords/tags',
        },
        status: {
          type: 'string',
          enum: ['Planned', 'Active', 'Completed', 'Cancelled', 'OnHold'],
          description: 'Project: Status',
        },
      },
      required: ['@type', 'name', 'collaborationId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        error: { type: 'string' },
      },
      required: ['success'],
    },
  },
  {
    name: 'get_schema_object',
    description: 'Fetch a schema.org object by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The UUID of the schema object',
        },
      },
      required: ['id'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        error: { type: 'string' },
      },
      required: ['success'],
    },
  },
  {
    name: 'search_schema_objects',
    description: 'Semantic and/or filtered search over schema.org objects. Use query for semantic search, or combine with type/collaboration filters.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Semantic search query (searches name, description, and type-specific fields)',
        },
        types: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['Person', 'Event', 'Project', 'Organization', 'Place'],
          },
          description: 'Filter by schema.org types',
        },
        collaborationId: {
          type: 'string',
          description: 'Filter by collaboration ID',
        },
        source: {
          type: 'string',
          enum: ['voice_session', 'manual', 'agent', 'import'],
          description: 'Filter by source',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (default: 20)',
        },
        offset: {
          type: 'number',
          description: 'Offset for pagination (default: 0)',
        },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            objects: { type: 'array', items: { type: 'object' } },
            total: { type: 'number' },
            limit: { type: 'number' },
            offset: { type: 'number' },
            hasMore: { type: 'boolean' },
          },
        },
        error: { type: 'string' },
      },
      required: ['success'],
    },
  },
  {
    name: 'list_collaboration_objects',
    description: 'List all schema.org objects for a given collaboration ID.',
    inputSchema: {
      type: 'object',
      properties: {
        collaborationId: {
          type: 'string',
          description: 'The collaboration ID to list objects for',
        },
        includeDeleted: {
          type: 'boolean',
          description: 'Include soft-deleted objects (default: false)',
        },
      },
      required: ['collaborationId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            collaboration: { type: 'object' },
            objects: { type: 'array', items: { type: 'object' } },
            total: { type: 'number' },
          },
        },
        error: { type: 'string' },
      },
      required: ['success'],
    },
  },
  {
    name: 'link_objects',
    description: 'Create a relationship edge between two schema.org objects (e.g., Person -> organizer -> Event).',
    inputSchema: {
      type: 'object',
      properties: {
        sourceId: {
          type: 'string',
          description: 'UUID of the source object',
        },
        targetId: {
          type: 'string',
          description: 'UUID of the target object',
        },
        relationshipType: {
          type: 'string',
          description: 'Type of relationship (e.g., organizer, attendee, member, location, worksFor)',
        },
        collaborationId: {
          type: 'string',
          description: 'Collaboration ID for this relationship',
        },
      },
      required: ['sourceId', 'targetId', 'relationshipType', 'collaborationId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        error: { type: 'string' },
      },
      required: ['success'],
    },
  },
  {
    name: 'export_jsonld',
    description: 'Export a collaboration\'s schema.org objects as valid JSON-LD for SEO/sharing.',
    inputSchema: {
      type: 'object',
      properties: {
        collaborationId: {
          type: 'string',
          description: 'The collaboration ID to export',
        },
      },
      required: ['collaborationId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            '@context': { type: 'string' },
            '@graph': { type: 'array', items: { type: 'object' } },
          },
        },
        error: { type: 'string' },
      },
      required: ['success'],
    },
  },
];

let registered = false;

export function registerSchemaObjectTools() {
  if (registered) {
    return;
  }

  globalToolRegistry.registerTool(
    schemaObjectToolDefinitions[0],
    async (args) => {
      const parsed = (args ?? {}) as Record<string, unknown>;

      if (!parsed['@type'] || !isValidSchemaType(parsed['@type'] as string)) {
        throw new Error('Invalid or missing @type');
      }
      if (!parsed.name || typeof parsed.name !== 'string') {
        throw new Error('Missing or invalid "name"');
      }
      if (!parsed.collaborationId || typeof parsed.collaborationId !== 'string') {
        throw new Error('Missing or invalid "collaborationId"');
      }

      await getOrCreateSchemaCollaboration(parsed.collaborationId as string);

      const input = {
        '@type': parsed['@type'] as SchemaOrgType,
        '@id': parsed['@id'] as string | undefined,
        name: parsed.name as string,
        description: parsed.description as string | undefined,
        source: (parsed.source as SchemaObjectSource) || 'agent',
        collaborationId: parsed.collaborationId as string,
        ...Object.fromEntries(
          Object.entries(parsed).filter(([k]) =>
            !['@type', '@id', 'name', 'description', 'source', 'collaborationId'].includes(k)
          )
        ),
      };

      const obj = await upsertSchemaObject(input as Parameters<typeof upsertSchemaObject>[0]);

      return {
        success: true,
        data: obj,
      } as unknown as JsonValue;
    }
  );

  globalToolRegistry.registerTool(
    schemaObjectToolDefinitions[1],
    async (args) => {
      const parsed = (args ?? {}) as { id?: string };
      if (!parsed.id || typeof parsed.id !== 'string') {
        throw new Error('Missing or invalid "id"');
      }

      const obj = await getSchemaObject(parsed.id);
      if (!obj) {
        return {
          success: false,
          error: 'Schema object not found',
        } as unknown as JsonValue;
      }

      return {
        success: true,
        data: obj,
      } as unknown as JsonValue;
    }
  );

  globalToolRegistry.registerTool(
    schemaObjectToolDefinitions[2],
    async (args) => {
      const parsed = (args ?? {}) as {
        query?: string;
        types?: string[];
        collaborationId?: string;
        source?: string;
        limit?: number;
        offset?: number;
      };

      const result = await searchSchemaObjects({
        query: parsed.query,
        types: parsed.types as SchemaOrgType[] | undefined,
        collaborationId: parsed.collaborationId,
        source: parsed.source as SchemaObjectSource | undefined,
        limit: parsed.limit || 20,
        offset: parsed.offset || 0,
      });

      return {
        success: true,
        data: result,
      } as unknown as JsonValue;
    }
  );

  globalToolRegistry.registerTool(
    schemaObjectToolDefinitions[3],
    async (args) => {
      const parsed = (args ?? {}) as {
        collaborationId?: string;
        includeDeleted?: boolean;
      };

      if (!parsed.collaborationId || typeof parsed.collaborationId !== 'string') {
        throw new Error('Missing or invalid "collaborationId"');
      }

      const collaboration = await getSchemaCollaborationById(parsed.collaborationId);
      const objects = await listCollaborationObjects(
        parsed.collaborationId,
        parsed.includeDeleted || false
      );

      return {
        success: true,
        data: {
          collaboration,
          objects,
          total: objects.length,
        },
      } as unknown as JsonValue;
    }
  );

  globalToolRegistry.registerTool(
    schemaObjectToolDefinitions[4],
    async (args) => {
      const parsed = (args ?? {}) as {
        sourceId?: string;
        targetId?: string;
        relationshipType?: string;
        collaborationId?: string;
      };

      if (!parsed.sourceId || typeof parsed.sourceId !== 'string') {
        throw new Error('Missing or invalid "sourceId"');
      }
      if (!parsed.targetId || typeof parsed.targetId !== 'string') {
        throw new Error('Missing or invalid "targetId"');
      }
      if (!parsed.relationshipType || typeof parsed.relationshipType !== 'string') {
        throw new Error('Missing or invalid "relationshipType"');
      }
      if (!parsed.collaborationId || typeof parsed.collaborationId !== 'string') {
        throw new Error('Missing or invalid "collaborationId"');
      }

      const relationship = await linkObjects(
        parsed.sourceId,
        parsed.targetId,
        parsed.relationshipType,
        parsed.collaborationId
      );

      return {
        success: true,
        data: relationship,
      } as unknown as JsonValue;
    }
  );

  globalToolRegistry.registerTool(
    schemaObjectToolDefinitions[5],
    async (args) => {
      const parsed = (args ?? {}) as { collaborationId?: string };

      if (!parsed.collaborationId || typeof parsed.collaborationId !== 'string') {
        throw new Error('Missing or invalid "collaborationId"');
      }

      const collaboration = await getSchemaCollaborationById(parsed.collaborationId);
      if (!collaboration) {
        return {
          success: false,
          error: 'Collaboration not found',
        } as unknown as JsonValue;
      }

      const jsonLd = await exportCollaborationJsonLd(parsed.collaborationId);

      return {
        success: true,
        data: jsonLd,
      } as unknown as JsonValue;
    }
  );

  registered = true;
}
