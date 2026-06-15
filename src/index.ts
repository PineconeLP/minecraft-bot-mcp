import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as mineflayer from "mineflayer";
import { z } from "zod";

const bots = new Map<string, mineflayer.Bot>();

const server = new McpServer({
  name: "minecraft-bot-mcp",
  version: "1.0.0",
});

server.registerTool(
  "connect",
  {
    description: "Spawn a new bot and connect it to a Minecraft server",
    inputSchema: z.object({
      host: z.string().describe("Server hostname or IP"),
      port: z.number().int().optional().default(25565).describe("Server port"),
      username: z.string(),
    }),
  },
  async (args) => {
    const botId = `bot_${bots.size}`;

    try {
      const bot = mineflayer.createBot({
        host: args.host,
        port: args.port,
        username: args.username,
        auth: "offline",
      });

      bots.set(botId, bot);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              status: "connected",
              botId,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
            }),
          },
        ],
        isError: true,
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Minecraft Bot MCP server started");
}

main().catch(console.error);
