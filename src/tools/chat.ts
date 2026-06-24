import { z } from "zod";
import type { Tool, ToolContext } from "./tool.js";

export function createReadChatTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "read-chat",
    config: {
      description: "Read recent chat messages for a bot",
      inputSchema: {
        botId: z.string().describe("The bot to read chat history from"),
        limit: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Number of recent messages to return (default: all)"),
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

      const history = bot.getChat();
      const messages =
        args.limit !== undefined ? history.slice(-args.limit) : history;

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(messages) },
        ],
      };
    },
  };
}

export function createSendChatTool({ botRegistry }: ToolContext): Tool {
  return {
    name: "send-chat",
    config: {
      description: "Send a chat message as a bot",
      inputSchema: {
        botId: z.string().describe("The bot to send the message as"),
        message: z.string().describe("The message to send"),
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

      bot.sendChat(args.message);

      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ status: "sent" }) },
        ],
      };
    },
  };
}
