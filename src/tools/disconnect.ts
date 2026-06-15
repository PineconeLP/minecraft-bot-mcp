import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createDisconnectTool({ mcp, botRegistry }: ToolContext): Tool {
  return {
    name: "disconnect",
    config: {
      description: "Disconnect a bot from the server",
      inputSchema: {
        botId: z.string(),
      },
    },
    handler: async (args) => {
      const bot = botRegistry.get(args.botId);

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
      botRegistry.delete(args.botId);

      mcp.sendResourceListChanged();

      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ status: "disconnected" }) },
        ],
      };
    },
  };
}
