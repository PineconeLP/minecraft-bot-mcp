import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createGetInventoryTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "get-inventory",
    config: {
      description: "Get the contents of the bot's inventory",
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

      const items = bot.getInventory();

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ items }) }],
      };
    },
  };
}
