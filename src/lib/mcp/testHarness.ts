import { globalToolRegistry } from './registry';
import { registerMcpTools } from './config';

export interface McpSelfTestResult {
  success: boolean;
  details: string[];
  errors: string[];
}

export async function runMcpSelfTest(): Promise<McpSelfTestResult> {
  const details: string[] = [];
  const errors: string[] = [];

  registerMcpTools();

  const list = globalToolRegistry.listTools();
  if (!list.tools.length) {
    throw new Error('No MCP tools registered');
  }
  details.push(`Registered tools: ${list.tools.map((t) => t.name).join(', ')}`);

  const expectedTools = [
    'listCollaborations',
    'getCollaboration',
    'createCollaborationFromTranscript',
    'createCollaboration',
    'updateCollaboration',
    'deleteCollaboration',
    'listCollaborationsByUsername',
    'getUserByFid',
    'getUserByUsername',
    'listGithubRepos',
    'getGithubIssueLinks',
  ];

  for (const toolName of expectedTools) {
    if (!list.tools.find((t) => t.name === toolName)) {
      errors.push(`Expected tool "${toolName}" to be registered`);
    }
  }

  details.push(`Expected ${expectedTools.length} tools, found ${list.tools.length}`);

  // Test listCollaborations - should not throw
  try {
    await globalToolRegistry.callTool({
      name: 'listCollaborations',
      arguments: {},
    });
    details.push('✓ listCollaborations tool invoked successfully');
  } catch (err) {
    errors.push(`listCollaborations failed: ${err}`);
  }

  // Test listCollaborationsByUsername with a sample username
  try {
    await globalToolRegistry.callTool({
      name: 'listCollaborationsByUsername',
      arguments: { username: 'test-user' },
    });
    details.push('✓ listCollaborationsByUsername tool invoked successfully');
  } catch (err) {
    errors.push(`listCollaborationsByUsername failed: ${err}`);
  }

  // Test getCollaboration with non-existent ID (should return success: false, not throw)
  try {
    const result = await globalToolRegistry.callTool({
      name: 'getCollaboration',
      arguments: { id: 'non-existent-id' },
    });
    const parsed = result.content as { success: boolean };
    if (parsed.success === false) {
      details.push('✓ getCollaboration returns success: false for non-existent ID');
    }
  } catch (err) {
    errors.push(`getCollaboration failed: ${err}`);
  }

  // Test getUserByFid with a sample FID (should return success: false for non-existent)
  try {
    const result = await globalToolRegistry.callTool({
      name: 'getUserByFid',
      arguments: { fid: '999999999' },
    });
    const parsed = result.content as { success: boolean };
    if (parsed.success === false) {
      details.push('✓ getUserByFid returns success: false for non-existent FID');
    } else {
      details.push('✓ getUserByFid tool invoked successfully');
    }
  } catch (err) {
    errors.push(`getUserByFid failed: ${err}`);
  }

  // Test getUserByUsername with a sample username
  try {
    const result = await globalToolRegistry.callTool({
      name: 'getUserByUsername',
      arguments: { username: 'test-user' },
    });
    const parsed = result.content as { success: boolean };
    if (parsed.success === false) {
      details.push('✓ getUserByUsername returns success: false for non-existent username');
    } else {
      details.push('✓ getUserByUsername tool invoked successfully');
    }
  } catch (err) {
    errors.push(`getUserByUsername failed: ${err}`);
  }

  // Test listGithubRepos - should not throw
  try {
    await globalToolRegistry.callTool({
      name: 'listGithubRepos',
      arguments: {},
    });
    details.push('✓ listGithubRepos tool invoked successfully');
  } catch (err) {
    errors.push(`listGithubRepos failed: ${err}`);
  }

  // Test getGithubIssueLinks with a sample collaboration ID
  try {
    await globalToolRegistry.callTool({
      name: 'getGithubIssueLinks',
      arguments: { collaborationId: 'non-existent-id' },
    });
    details.push('✓ getGithubIssueLinks tool invoked successfully');
  } catch (err) {
    errors.push(`getGithubIssueLinks failed: ${err}`);
  }

  // Test validation: updateCollaboration without required id should throw
  try {
    await globalToolRegistry.callTool({
      name: 'updateCollaboration',
      arguments: { title: 'Test' },
    });
    errors.push('updateCollaboration should have thrown for missing id');
  } catch (err) {
    details.push('✓ updateCollaboration correctly throws for missing id');
  }

  // Test validation: deleteCollaboration without required id should throw
  try {
    await globalToolRegistry.callTool({
      name: 'deleteCollaboration',
      arguments: {},
    });
    errors.push('deleteCollaboration should have thrown for missing id');
  } catch (err) {
    details.push('✓ deleteCollaboration correctly throws for missing id');
  }

  // Test validation: createCollaboration without required fields should throw
  try {
    await globalToolRegistry.callTool({
      name: 'createCollaboration',
      arguments: { title: 'Test' },
    });
    errors.push('createCollaboration should have thrown for missing templateId');
  } catch (err) {
    details.push('✓ createCollaboration correctly throws for missing required fields');
  }

  return {
    success: errors.length === 0,
    details,
    errors,
  };
}
