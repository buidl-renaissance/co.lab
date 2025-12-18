import {
  JsonValue,
  McpToolDefinition,
  McpToolListResult,
  McpToolCallParams,
  McpToolCallResult,
  RegisteredTool,
  ToolHandler,
} from './types';

export class ToolRegistry {
  private tools = new Map<string, RegisteredTool>();

  registerTool(definition: McpToolDefinition, handler: ToolHandler): void {
    if (this.tools.has(definition.name)) {
      throw new Error(`Tool already registered: ${definition.name}`);
    }

    this.tools.set(definition.name, { definition, handler });
  }

  listTools(): McpToolListResult {
    return {
      tools: Array.from(this.tools.values()).map((t) => t.definition),
    };
  }

  async callTool(params: McpToolCallParams): Promise<McpToolCallResult> {
    const tool = this.tools.get(params.name);
    if (!tool) {
      throw new Error(`Unknown tool: ${params.name}`);
    }

    const content: JsonValue = await tool.handler(params.arguments);
    return { content };
  }
}

// Singleton registry instance for the app
export const globalToolRegistry = new ToolRegistry();


