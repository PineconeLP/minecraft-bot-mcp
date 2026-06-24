#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryBotRegistry } from "./entities/bot/in-memory-bot-registry.js";
import { createSendChatTool } from "./tools/chat.js";
import { createCloseInventoryTool } from "./tools/close-inventory.js";
import { createConnectTool } from "./tools/connect.js";
import { createDisconnectTool } from "./tools/disconnect.js";
import { createEquipItemTool } from "./tools/equip-item.js";
import { createFindNearbyBlocksTool } from "./tools/find-nearby-blocks.js";
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
  createSendChatTool,
  createOpenContainerTool,
  createCloseInventoryTool,
  createFindNearbyBlocksTool,
  createEquipItemTool,
];

toolFactories.forEach((createTool) => {
  const tool = createTool(toolContext);
  mcp.registerTool(tool.name, tool.config, tool.handler);
});

mcp.registerResource(
  "chat",
  new ResourceTemplate("minecraft://{botId}/chat", {
    list: () => ({
      resources: [...botRegistry.keys()].map((botId) => ({
        name: `${botId} chat`,
        uri: `minecraft://${botId}/chat`,
        mimeType: "application/json",
      })),
    }),
  }),
  {
    description: "Recent chat messages for a bot",
    mimeType: "application/json",
  },
  async (uri, variables) => {
    const botId = variables.botId as string;
    const history = botRegistry.get(botId)?.getChat() ?? [];

    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: JSON.stringify(history),
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await mcp.connect(transport);
  console.error("Minecraft Bot MCP server started");
}

main().catch(console.error);
