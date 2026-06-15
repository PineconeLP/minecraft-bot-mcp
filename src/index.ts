import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Bot } from "./entities/bot.js";

const bots = new Map<string, Bot>();

const mcp = new McpServer({
  name: "minecraft-bot-mcp",
  version: "1.0.0",
});

mcp.registerTool(
  "connect",
  {
    description: "Spawn a new bot and connect it to a Minecraft server",
    inputSchema: z.object({
      host: z.string().describe("Server hostname or IP"),
      port: z.number().int().optional().default(25565).describe("Server port"),
      username: z
        .string()
        .regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric"),
    }),
  },
  async (args) => {
    const botId = `bot_${bots.size}`;

    try {
      const bot = await Bot.connect({
        host: args.host,
        port: args.port,
        username: args.username,
        auth: "offline",
      });

      bots.set(botId, bot);

      mcp.sendResourceListChanged();

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

mcp.registerTool(
  "disconnect",
  {
    description: "Disconnect a bot from the server",
    inputSchema: z.object({
      botId: z.string(),
    }),
  },
  async (args) => {
    const bot = bots.get(args.botId);

    if (!bot) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `Bot ${args.botId} not found` }),
          },
        ],
        isError: true,
      };
    }

    bot.disconnect();
    bots.delete(args.botId);

    mcp.sendResourceListChanged();

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ status: "disconnected" }),
        },
      ],
    };
  },
);

mcp.registerTool(
  "chat",
  {
    description: "Send a chat message as a bot",
    inputSchema: z.object({
      botId: z.string().describe("The bot to send the message as"),
      message: z.string().describe("The message to send"),
    }),
  },
  async (args) => {
    const bot = bots.get(args.botId);

    if (!bot) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `Bot ${args.botId} not found` }),
          },
        ],
        isError: true,
      };
    }

    bot.chat(args.message);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ status: "sent" }),
        },
      ],
    };
  },
);

mcp.registerTool(
  "open_container",
  {
    description:
      "Open a container block at the given coordinates and return its contents",
    inputSchema: z.object({
      botId: z.string(),
      x: z.number().int(),
      y: z.number().int(),
      z: z.number().int(),
    }),
  },
  async (args) => {
    const bot = bots.get(args.botId);

    if (!bot) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `Bot ${args.botId} not found` }),
          },
        ],
        isError: true,
      };
    }

    try {
      const container = await bot.openContainer(args.x, args.y, args.z);

      const items = container.slots.flatMap((item) =>
        item ? [{ name: item.name, count: item.count, slot: item.slot }] : [],
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ items }) }],
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

mcp.registerTool(
  "close_inventory",
  {
    description: "Close the bot's currently open window or container",
    inputSchema: z.object({
      botId: z.string(),
    }),
  },
  async (args) => {
    const bot = bots.get(args.botId);

    if (!bot) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `Bot ${args.botId} not found` }),
          },
        ],
        isError: true,
      };
    }

    try {
      bot.closeInventory();

      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ status: "closed" }) },
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

mcp.registerResource(
  "chat",
  new ResourceTemplate("minecraft://{botId}/chat", {
    list: () => ({
      resources: [...bots.keys()].map((botId) => ({
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
    const history = bots.get(botId)?.getChat() ?? [];

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
