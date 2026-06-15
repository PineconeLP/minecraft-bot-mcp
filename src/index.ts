import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import * as mineflayer from "mineflayer";
import { z } from "zod";

interface ChatEntry {
  message: string;
  sender: "player" | "system";
  timestamp: string;
}

const MAX_HISTORY = 100;

const bots = new Map<string, mineflayer.Bot>();
const chatHistories = new Map<string, ChatEntry[]>();

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
      const bot = mineflayer.createBot({
        host: args.host,
        port: args.port,
        username: args.username,
        auth: "offline",
      });

      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Connection timed out")),
          10000,
        );

        bot.once("login", () => {
          clearTimeout(timer);
          resolve();
        });

        bot.once("error", (err) => {
          clearTimeout(timer);
          reject(err);
        });
      });

      chatHistories.set(botId, []);

      bot.on("messagestr", (message, position) => {
        const history = chatHistories.get(botId)!;

        history.push({
          message,
          sender: position === "chat" ? "player" : "system",
          timestamp: new Date().toISOString(),
        });

        if (history.length > MAX_HISTORY) history.shift();
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
    description: "Recent chat messages for a bot (up to 100)",
    mimeType: "application/json",
  },
  async (uri, variables) => {
    const botId = variables.botId as string;
    const history = chatHistories.get(botId) ?? [];

    console.error(history);

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
