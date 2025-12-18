import { globalToolRegistry } from './registry';
import { registerMcpTools } from './config';

export interface McpSelfTestResult {
  success: boolean;
  details: string[];
}

export async function runMcpSelfTest(): Promise<McpSelfTestResult> {
  const details: string[] = [];

  registerMcpTools();

  const list = globalToolRegistry.listTools();
  if (!list.tools.length) {
    throw new Error('No MCP tools registered');
  }
  details.push(`Registered tools: ${list.tools.map((t) => t.name).join(', ')}`);

  if (!list.tools.find((t) => t.name === 'listCollaborations')) {
    throw new Error('Expected tool "listCollaborations" to be registered');
  }

  // Call listCollaborations; we only assert that it does not throw.
  await globalToolRegistry.callTool({
    name: 'listCollaborations',
    arguments: {},
  });
  details.push('listCollaborations tool invoked successfully');

  return {
    success: true,
    details,
  };
}


