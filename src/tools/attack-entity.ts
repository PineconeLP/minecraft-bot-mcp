import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createAttackEntityTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "attack-entity",
    config: {
      description:
        "Attack (left-click) an entity by its ID. The entity must be within reach.",
      inputSchema: {
        botId: z.string(),
        entityId: z.number().int().describe("ID of the entity to attack"),
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
        bot.attackEntity(args.entityId);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ status: "attacked" }),
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
