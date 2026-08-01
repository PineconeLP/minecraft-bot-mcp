import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createPlaceBlockTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "place-block",
    config: {
      description:
        "Place the currently held item as a block against a reference block face. The new block is placed adjacent to the reference block in the direction of the face vector. Equip the block to place in the bot's hand first.",
      inputSchema: {
        botId: z.string(),
        x: z.number().int().describe("X coordinate of the reference block"),
        y: z.number().int().describe("Y coordinate of the reference block"),
        z: z.number().int().describe("Z coordinate of the reference block"),
        faceX: z
          .number()
          .int()
          .describe("X component of the face vector (-1, 0, or 1)"),
        faceY: z
          .number()
          .int()
          .describe("Y component of the face vector (-1, 0, or 1)"),
        faceZ: z
          .number()
          .int()
          .describe("Z component of the face vector (-1, 0, or 1)"),
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
        await bot.placeBlock(args.x, args.y, args.z, {
          x: args.faceX,
          y: args.faceY,
          z: args.faceZ,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ status: "placed" }),
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
