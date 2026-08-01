import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createDigBlockTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "dig-block",
    config: {
      description:
        "Dig (break) the block at the given coordinates. The block must be within reach.",
      inputSchema: {
        botId: z.string(),
        x: z.number().int().describe("X coordinate of the block to dig"),
        y: z.number().int().describe("Y coordinate of the block to dig"),
        z: z.number().int().describe("Z coordinate of the block to dig"),
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
        await bot.dig(args.x, args.y, args.z);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ status: "dug" }),
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
