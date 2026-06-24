#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryBotRegistry } from "./entities/bot/in-memory-bot-registry.js";
import { createReadChatTool, createSendChatTool } from "./tools/chat.js";
import { createCloseInventoryTool } from "./tools/close-inventory.js";
import { createConnectTool } from "./tools/connect.js";
import { createDisconnectTool } from "./tools/disconnect.js";
import { createEquipItemTool } from "./tools/equip-item.js";
import { createFindNearbyBlocksTool } from "./tools/find-nearby-blocks.js";
import { createGetInventoryTool } from "./tools/get-inventory.js";
import { createOpenContainerTool } from "./tools/open-container.js";

const mcp = new McpServer({
  name: "minecraft-bot-mcp",
  version: "1.0.0",
});
const botRegistry = new InMemoryBotRegistry();
const toolContext = { mcp, botRegistry };

const toolFactories = [
  createConnectTool,
  createDisconnectTool,
  createReadChatTool,
  createSendChatTool,
  createOpenContainerTool,
  createCloseInventoryTool,
  createFindNearbyBlocksTool,
  createEquipItemTool,
  createGetInventoryTool,
];

toolFactories.forEach((createTool) => {
  const tool = createTool(toolContext);
  mcp.registerTool(tool.name, tool.config, tool.handler);
});

async function main() {
  const transport = new StdioServerTransport();
  await mcp.connect(transport);
  console.error("Minecraft Bot MCP server started");
}

main().catch(console.error);
