export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface JsonRpcRequest<TParams = unknown> {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: TParams;
}

export interface JsonRpcSuccess<T = unknown> {
  jsonrpc: '2.0';
  id: string | number | null;
  result: T;
}

export interface JsonRpcErrorObject {
  code: number;
  message: string;
  data?: JsonValue;
}

export interface JsonRpcError {
  jsonrpc: '2.0';
  id: string | number | null;
  error: JsonRpcErrorObject;
}

export type JsonRpcResponse<T = unknown> =
  | JsonRpcSuccess<T>
  | JsonRpcError;

// Minimal MCP-style tool description and invocation types

export interface McpToolInputParam {
  name: string;
  description?: string;
  required?: boolean;
  schema?: JsonValue;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema?: JsonValue;
  outputSchema?: JsonValue;
}

export interface McpToolListResult {
  tools: McpToolDefinition[];
}

export interface McpToolCallParams {
  name: string;
  arguments?: JsonValue;
}

export interface McpToolCallResult {
  content: JsonValue;
}

export type ToolHandler = (args: JsonValue | undefined) => Promise<JsonValue>;

export interface RegisteredTool {
  definition: McpToolDefinition;
  handler: ToolHandler;
}


