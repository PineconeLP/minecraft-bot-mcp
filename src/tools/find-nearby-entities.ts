import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createFindNearbyEntitiesTool({
  botRegistry,
}: ToolContext): Tool {
  return {
    name: "find-nearby-entities",
    config: {
      description: "Find entities near the bot, optionally filtered by type",
      inputSchema: {
        botId: z.string(),
        entityType: z
          .string()
          .optional()
          .describe("Entity name to filter by (e.g. 'villager', 'zombie')"),
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
        const entities = bot.findNearbyEntities(
          args.entityType,
          args.maxDistance,
          args.count,
        );

        return {
          content: [
            { type: "text" as const, text: JSON.stringify({ entities }) },
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
