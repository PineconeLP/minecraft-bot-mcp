import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createEquipItemTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "equip-item",
    config: {
      description: "Equip an item from the bot's inventory to a destination slot",
      inputSchema: {
        botId: z.string(),
        itemName: z
          .string()
          .describe("Base item type name (e.g. 'diamond_sword')"),
        customName: z
          .string()
          .optional()
          .describe("Custom display name if the item was renamed via anvil"),
        destination: z
          .enum(["hand", "off-hand", "head", "torso", "legs", "feet"])
          .default("hand"),
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
        await bot.equipItem(args.itemName, args.destination, args.customName);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ status: "equipped" }),
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
