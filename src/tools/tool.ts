import type {
  McpServer,
  ToolCallback,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import type { InMemoryBotRegistry } from "../entities/bot/in-memory-bot-registry.js";

export type ToolContext = {
  mcp: McpServer;
  botRegistry: InMemoryBotRegistry;
};

export type ToolConfig<TInput extends ZodRawShapeCompat> = {
  title?: string;
  description?: string;
  inputSchema?: TInput;
  annotations?: ToolAnnotations;
};

export type Tool<TInput extends ZodRawShapeCompat = ZodRawShapeCompat> = {
  name: string;
  config: ToolConfig<TInput>;
  handler: ToolCallback<TInput>;
};
