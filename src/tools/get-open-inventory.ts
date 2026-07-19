import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createGetOpenInventoryTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "get-open-inventory",
    config: {
      description:
        "Get the contents of the bot's currently open window or container",
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

      const window = bot.getOpenInventory();

      if (!window) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: "No window is currently open" }),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify(window) }],
      };
    },
  };
}
