import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createClickOpenInventorySlotTool({
  botRegistry,
}: ToolContext): Tool {
  return {
    name: "click-open-inventory-slot",
    config: {
      description: "Click a slot in the bot's currently open window",
      inputSchema: {
        botId: z.string(),
        slot: z.int().min(0).describe("The slot index to click"),
        button: z.enum(["left", "right"]).default("left"),
        shift: z.boolean().default(false).describe("Hold shift while clicking"),
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
        await bot.clickOpenInventorySlot(args.slot, args.button, args.shift);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ status: "clicked" }),
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
