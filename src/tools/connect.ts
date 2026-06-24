import { z } from "zod";
import { Bot } from "../entities/bot/bot.js";
import type { Tool, ToolContext } from "./tool.js";

export function createConnectTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "connect",
    config: {
      description: "Spawn a new bot and connect it to a Minecraft server",
      inputSchema: {
        host: z.string().describe("Server hostname or IP"),
        port: z
          .number()
          .int()
          .optional()
          .default(25565)
          .describe("Server port"),
        username: z
          .string()
          .regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric"),
      },
    },
    handler: async (args) => {
      try {
        const bot = await Bot.connect({
          host: args.host,
          port: args.port,
          username: args.username,
          auth: "offline",
        });

        const botId = botRegistry.add(bot);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ status: "connected", botId }),
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
  };
}
