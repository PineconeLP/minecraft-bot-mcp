import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createCloseInventoryTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "close-inventory",
    config: {
      description: "Close the bot's currently open window or container",
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

      try {
        bot.closeInventory();

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ status: "closed" }),
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
