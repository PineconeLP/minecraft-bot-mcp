import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createInteractEntityTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "interact-entity",
    config: {
      description:
        "Right-click (use) an entity by its ID. The entity must be within reach.",
      inputSchema: {
        botId: z.string(),
        entityId: z
          .number()
          .int()
          .describe("ID of the entity to interact with"),
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
        await bot.interactEntity(args.entityId);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ status: "interacted" }),
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
