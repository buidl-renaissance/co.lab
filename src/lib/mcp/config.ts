import { McpToolDefinition, JsonValue } from './types';
import { globalToolRegistry } from './registry';
import { getAllCollaborations, getCollaborationById } from '@/db/collaboration';
import { createCollaboration } from '@/db/collaboration';

// Tool definitions (schemas kept intentionally simple for now)

export const toolDefinitions: McpToolDefinition[] = [
  {
    name: 'listCollaborations',
    description: 'List all collaborations.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'array' },
      },
    },
  },
  {
    name: 'getCollaboration',
    description: 'Get a collaboration by id.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  },
  {
    name: 'createCollaborationFromTranscript',
    description:
      'Create a new collaboration from a transcript and template id.',
    inputSchema: {
      type: 'object',
      properties: {
        transcript: { type: 'string' },
        templateId: { type: 'string' },
      },
      required: ['transcript', 'templateId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
      },
    },
  },
];

let registered = false;

export function registerMcpTools() {
  if (registered) {
    return;
  }

  // listCollaborations
  globalToolRegistry.registerTool(
    toolDefinitions[0],
    async () => {
      const collaborations = await getAllCollaborations();
      return {
        success: true,
        data: collaborations,
      } as JsonValue;
    },
  );

  // getCollaboration
  globalToolRegistry.registerTool(
    toolDefinitions[1],
    async (args) => {
      const parsed = (args ?? {}) as { id?: string };
      if (!parsed.id || typeof parsed.id !== 'string') {
        throw new Error('Missing or invalid "id"');
      }

      const collaboration = await getCollaborationById(parsed.id);
      if (!collaboration) {
        return {
          success: false,
          error: 'Collaboration not found',
        } as JsonValue;
      }

      return {
        success: true,
        data: collaboration,
      } as JsonValue;
    },
  );

  // createCollaborationFromTranscript
  globalToolRegistry.registerTool(
    toolDefinitions[2],
    async (args) => {
      const parsed = (args ?? {}) as {
        transcript?: string;
        templateId?: string;
      };

      if (!parsed.transcript || typeof parsed.transcript !== 'string') {
        throw new Error('Missing or invalid "transcript"');
      }
      if (!parsed.templateId || typeof parsed.templateId !== 'string') {
        throw new Error('Missing or invalid "templateId"');
      }

      // Reuse existing /api/create logic by delegating to createCollaboration.
      // We only handle the DB layer here and expect the caller to have already
      // produced the analysis and related fields upstream if needed.
      const collaboration = await createCollaboration({
        title: 'New collaboration',
        description: '',
        template: {
          id: parsed.templateId,
          name: parsed.templateId,
          tag: parsed.templateId.toUpperCase(),
          description: '',
          icon: '📝',
        },
        participants: [],
        answers: {},
        status: 'active',
        analysis: undefined,
        transcripts: [parsed.transcript],
        summary: '',
      });

      return {
        success: true,
        data: collaboration,
      } as JsonValue;
    },
  );

  registered = true;
}


