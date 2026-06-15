import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createOpenContainerTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "open-container",
    config: {
      description:
        "Open a container block at the given coordinates and return its contents",
      inputSchema: {
        botId: z.string(),
        x: z.number().int(),
        y: z.number().int(),
        z: z.number().int(),
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
        const container = await bot.openContainer(args.x, args.y, args.z);

        const items = container.slots.flatMap((item) =>
          item ? [{ name: item.name, count: item.count, slot: item.slot }] : [],
        );

        return {
          content: [{ type: "text" as const, text: JSON.stringify({ items }) }],
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
