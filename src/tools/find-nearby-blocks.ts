import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createFindNearbyBlocksTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "find-nearby-blocks",
    config: {
      description: "Find blocks of a given type near the bot",
      inputSchema: {
        botId: z.string(),
        blockName: z
          .string()
          .describe("Minecraft block name (e.g. 'oak_log', 'diamond_ore')"),
        maxDistance: z.number().int().positive().default(16),
        count: z.number().int().positive().default(16),
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
        const blocks = bot.findNearbyBlocks(
          args.blockName,
          args.maxDistance,
          args.count,
        );

        return {
          content: [
            { type: "text" as const, text: JSON.stringify({ blocks }) },
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
