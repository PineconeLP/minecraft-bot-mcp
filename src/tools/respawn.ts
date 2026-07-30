import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createRespawnTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "respawn",
    config: {
      description: "Respawn the bot after it has died",
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

      try {
        bot.respawn();

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ status: "respawned" }),
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
