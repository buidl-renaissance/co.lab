import { McpToolDefinition, JsonValue } from './types';
import { globalToolRegistry } from './registry';
import {
  getAllCollaborations,
  getCollaborationById,
  createCollaboration,
  updateCollaboration,
  deleteCollaboration,
  getCollaborationsByUsername,
} from '@/db/collaboration';
import { getUserByFid, getUserByUsername } from '@/db/user';
import { getAllGitHubRepos, getIssueLinksForCollaboration } from '@/db/github';

// Tool definitions with rich schemas for discoverability

export const toolDefinitions: McpToolDefinition[] = [
  // =====================
  // Collaboration Tools
  // =====================
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
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        error: { type: 'string' },
      },
      required: ['success'],
    },
  },
  {
    name: 'getCollaboration',
    description: 'Get a collaboration by id.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The collaboration ID (UUID)' },
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
    name: 'createCollaborationFromTranscript',
    description:
      'Create a new collaboration from a transcript and template id.',
    inputSchema: {
      type: 'object',
      properties: {
        transcript: { type: 'string', description: 'The transcript text content' },
        templateId: { type: 'string', description: 'The template ID to use' },
      },
      required: ['transcript', 'templateId'],
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
    name: 'createCollaboration',
    description: 'Create a new collaboration with full control over all fields.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The collaboration title' },
        templateId: { type: 'string', description: 'The template ID' },
        templateName: { type: 'string', description: 'The template name' },
        description: { type: 'string', description: 'Optional description' },
        participants: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of participant usernames',
        },
        answers: {
          type: 'object',
          description: 'Key-value map of answers',
        },
        status: {
          type: 'string',
          enum: ['active', 'completed', 'archived'],
          description: 'Collaboration status',
        },
        summary: { type: 'string', description: 'Summary text' },
        createdByUsername: { type: 'string', description: 'Username of the creator' },
      },
      required: ['title', 'templateId', 'templateName'],
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
    name: 'updateCollaboration',
    description: 'Update an existing collaboration by id.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The collaboration ID (UUID)' },
        title: { type: 'string', description: 'Updated title' },
        description: { type: 'string', description: 'Updated description' },
        status: {
          type: 'string',
          enum: ['active', 'completed', 'archived'],
          description: 'Updated status',
        },
        summary: { type: 'string', description: 'Updated summary' },
        participants: {
          type: 'array',
          items: { type: 'string' },
          description: 'Updated participants array',
        },
        answers: {
          type: 'object',
          description: 'Updated answers object',
        },
        analysis: {
          type: 'object',
          description: 'Updated analysis object',
        },
        transcripts: {
          type: 'array',
          items: { type: 'string' },
          description: 'Updated transcripts array',
        },
        eventDetails: {
          type: 'object',
          description: 'Updated event details',
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
    name: 'deleteCollaboration',
    description: 'Delete a collaboration by id.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The collaboration ID (UUID)' },
      },
      required: ['id'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        deleted: { type: 'boolean' },
        error: { type: 'string' },
      },
      required: ['success'],
    },
  },
  {
    name: 'listCollaborationsByUsername',
    description: 'List all collaborations for a specific user.',
    inputSchema: {
      type: 'object',
      properties: {
        username: { type: 'string', description: 'The username to filter by' },
      },
      required: ['username'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        error: { type: 'string' },
      },
      required: ['success'],
    },
  },
  // =====================
  // User Tools
  // =====================
  {
    name: 'getUserByFid',
    description: 'Look up a user by their Farcaster ID (fid).',
    inputSchema: {
      type: 'object',
      properties: {
        fid: { type: 'string', description: 'The Farcaster ID' },
      },
      required: ['fid'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fid: { type: 'string' },
            username: { type: 'string' },
            displayName: { type: 'string' },
            pfpUrl: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
        error: { type: 'string' },
      },
      required: ['success'],
    },
  },
  {
    name: 'getUserByUsername',
    description: 'Look up a user by their username.',
    inputSchema: {
      type: 'object',
      properties: {
        username: { type: 'string', description: 'The username to look up' },
      },
      required: ['username'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fid: { type: 'string' },
            username: { type: 'string' },
            displayName: { type: 'string' },
            pfpUrl: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
        error: { type: 'string' },
      },
      required: ['success'],
    },
  },
  // =====================
  // GitHub Tools
  // =====================
  {
    name: 'listGithubRepos',
    description: 'List all linked GitHub repositories.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              owner: { type: 'string' },
              name: { type: 'string' },
              displayName: { type: 'string' },
              projectId: { type: 'string' },
              isDefault: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
        error: { type: 'string' },
      },
      required: ['success'],
    },
  },
  {
    name: 'getGithubIssueLinks',
    description: 'Get all GitHub issue links for a specific collaboration.',
    inputSchema: {
      type: 'object',
      properties: {
        collaborationId: { type: 'string', description: 'The collaboration ID (UUID)' },
      },
      required: ['collaborationId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              collaborationId: { type: 'string' },
              githubRepoId: { type: 'string' },
              issueNumber: { type: 'number' },
              issueUrl: { type: 'string' },
              issueState: { type: 'string' },
              lastSyncedAt: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
        error: { type: 'string' },
      },
      required: ['success'],
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
      } as unknown as JsonValue;
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
        } as unknown as JsonValue;
      }

      return {
        success: true,
        data: collaboration,
      } as unknown as JsonValue;
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
      } as unknown as JsonValue;
    },
  );

  // createCollaboration (full form)
  globalToolRegistry.registerTool(
    toolDefinitions[3],
    async (args) => {
      const parsed = (args ?? {}) as {
        title?: string;
        templateId?: string;
        templateName?: string;
        description?: string;
        participants?: string[];
        answers?: Record<string, string>;
        status?: 'active' | 'completed' | 'archived';
        summary?: string;
        createdByUsername?: string;
      };

      if (!parsed.title || typeof parsed.title !== 'string') {
        throw new Error('Missing or invalid "title"');
      }
      if (!parsed.templateId || typeof parsed.templateId !== 'string') {
        throw new Error('Missing or invalid "templateId"');
      }
      if (!parsed.templateName || typeof parsed.templateName !== 'string') {
        throw new Error('Missing or invalid "templateName"');
      }

      const collaboration = await createCollaboration({
        title: parsed.title,
        description: parsed.description || '',
        template: {
          id: parsed.templateId,
          name: parsed.templateName,
          tag: parsed.templateId.toUpperCase(),
          description: '',
          icon: '📝',
        },
        participants: parsed.participants || [],
        answers: parsed.answers || {},
        status: parsed.status || 'active',
        analysis: undefined,
        transcripts: [],
        summary: parsed.summary || '',
        createdByUsername: parsed.createdByUsername,
      });

      return {
        success: true,
        data: collaboration,
      } as unknown as JsonValue;
    },
  );

  // updateCollaboration
  globalToolRegistry.registerTool(
    toolDefinitions[4],
    async (args) => {
      const parsed = (args ?? {}) as {
        id?: string;
        title?: string;
        description?: string;
        status?: 'active' | 'completed' | 'archived';
        summary?: string;
        participants?: string[];
        answers?: Record<string, string>;
        analysis?: unknown;
        transcripts?: string[];
        eventDetails?: unknown;
      };

      if (!parsed.id || typeof parsed.id !== 'string') {
        throw new Error('Missing or invalid "id"');
      }

      const updates: Record<string, unknown> = {};
      if (parsed.title !== undefined) updates.title = parsed.title;
      if (parsed.description !== undefined) updates.description = parsed.description;
      if (parsed.status !== undefined) updates.status = parsed.status;
      if (parsed.summary !== undefined) updates.summary = parsed.summary;
      if (parsed.participants !== undefined) updates.participants = parsed.participants;
      if (parsed.answers !== undefined) updates.answers = parsed.answers;
      if (parsed.analysis !== undefined) updates.analysis = parsed.analysis;
      if (parsed.transcripts !== undefined) updates.transcripts = parsed.transcripts;
      if (parsed.eventDetails !== undefined) updates.eventDetails = parsed.eventDetails;

      const collaboration = await updateCollaboration(parsed.id, updates);
      if (!collaboration) {
        return {
          success: false,
          error: 'Collaboration not found',
        } as unknown as JsonValue;
      }

      return {
        success: true,
        data: collaboration,
      } as unknown as JsonValue;
    },
  );

  // deleteCollaboration
  globalToolRegistry.registerTool(
    toolDefinitions[5],
    async (args) => {
      const parsed = (args ?? {}) as { id?: string };
      if (!parsed.id || typeof parsed.id !== 'string') {
        throw new Error('Missing or invalid "id"');
      }

      const deleted = await deleteCollaboration(parsed.id);
      return {
        success: true,
        deleted,
      } as unknown as JsonValue;
    },
  );

  // listCollaborationsByUsername
  globalToolRegistry.registerTool(
    toolDefinitions[6],
    async (args) => {
      const parsed = (args ?? {}) as { username?: string };
      if (!parsed.username || typeof parsed.username !== 'string') {
        throw new Error('Missing or invalid "username"');
      }

      const collaborations = await getCollaborationsByUsername(parsed.username);
      return {
        success: true,
        data: collaborations,
      } as unknown as JsonValue;
    },
  );

  // getUserByFid
  globalToolRegistry.registerTool(
    toolDefinitions[7],
    async (args) => {
      const parsed = (args ?? {}) as { fid?: string };
      if (!parsed.fid || typeof parsed.fid !== 'string') {
        throw new Error('Missing or invalid "fid"');
      }

      const user = await getUserByFid(parsed.fid);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        } as unknown as JsonValue;
      }

      return {
        success: true,
        data: {
          id: user.id,
          fid: user.fid,
          username: user.username,
          displayName: user.displayName,
          pfpUrl: user.pfpUrl,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      } as unknown as JsonValue;
    },
  );

  // getUserByUsername
  globalToolRegistry.registerTool(
    toolDefinitions[8],
    async (args) => {
      const parsed = (args ?? {}) as { username?: string };
      if (!parsed.username || typeof parsed.username !== 'string') {
        throw new Error('Missing or invalid "username"');
      }

      const user = await getUserByUsername(parsed.username);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        } as unknown as JsonValue;
      }

      return {
        success: true,
        data: {
          id: user.id,
          fid: user.fid,
          username: user.username,
          displayName: user.displayName,
          pfpUrl: user.pfpUrl,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      } as unknown as JsonValue;
    },
  );

  // listGithubRepos
  globalToolRegistry.registerTool(
    toolDefinitions[9],
    async () => {
      const repos = await getAllGitHubRepos();
      return {
        success: true,
        data: repos.map((repo) => ({
          id: repo.id,
          owner: repo.owner,
          name: repo.name,
          displayName: repo.displayName,
          projectId: repo.projectId,
          isDefault: repo.isDefault,
          createdAt: repo.createdAt.toISOString(),
          updatedAt: repo.updatedAt.toISOString(),
        })),
      } as unknown as JsonValue;
    },
  );

  // getGithubIssueLinks
  globalToolRegistry.registerTool(
    toolDefinitions[10],
    async (args) => {
      const parsed = (args ?? {}) as { collaborationId?: string };
      if (!parsed.collaborationId || typeof parsed.collaborationId !== 'string') {
        throw new Error('Missing or invalid "collaborationId"');
      }

      const issueLinks = await getIssueLinksForCollaboration(parsed.collaborationId);
      return {
        success: true,
        data: issueLinks.map((link) => ({
          id: link.id,
          collaborationId: link.collaborationId,
          githubRepoId: link.githubRepoId,
          issueNumber: link.issueNumber,
          issueUrl: link.issueUrl,
          issueState: link.issueState,
          lastSyncedAt: link.lastSyncedAt.toISOString(),
          createdAt: link.createdAt.toISOString(),
          updatedAt: link.updatedAt.toISOString(),
        })),
      } as unknown as JsonValue;
    },
  );

  registered = true;
}
