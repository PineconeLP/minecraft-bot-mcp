import minecraftData from "minecraft-data";
import * as mineflayer from "mineflayer";
import { Vec3 } from "vec3";

const MAX_CHAT_HISTORY = 100;

export interface ChatEntry {
  message: string;
  sender: "player" | "system";
  timestamp: string;
}

export class Bot {
  private readonly mineflayerBot: mineflayer.Bot;

  private chatHistory: ChatEntry[] = [];

  private constructor(mineflayerBot: mineflayer.Bot) {
    this.mineflayerBot = mineflayerBot;

    this.mineflayerBot.on("messagestr", (message, position) => {
      this.chatHistory.push({
        message,
        sender: position === "chat" ? "player" : "system",
        timestamp: new Date().toISOString(),
      });

      if (this.chatHistory.length > MAX_CHAT_HISTORY) {
        this.chatHistory.shift();
      }
    });
  }

  static async connect(options: mineflayer.BotOptions): Promise<Bot> {
    const inner = mineflayer.createBot(options);

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Connection timed out")),
        10000,
      );

      inner.once("login", () => {
        clearTimeout(timer);
        resolve();
      });

      inner.once("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    return new Bot(inner);
  }

  disconnect() {
    this.mineflayerBot.end();
  }

  getChat(): ChatEntry[] {
    return this.chatHistory;
  }

  sendChat(message: string) {
    this.mineflayerBot.chat(message);
  }

  async openContainer(x: number, y: number, z: number) {
    const block = this.mineflayerBot.blockAt(new Vec3(x, y, z));

    if (!block) {
      throw new Error("No block found at given coordinates");
    }

    return this.mineflayerBot.openContainer(block);
  }

  closeInventory() {
    if (!this.mineflayerBot.currentWindow) {
      throw new Error("No window is currently open");
    }

    this.mineflayerBot.closeWindow(this.mineflayerBot.currentWindow);
  }

  findNearbyBlocks(
    blockName: string,
    maxDistance: number = 16,
    count: number = 16,
  ) {
    const data = minecraftData(this.mineflayerBot.version);
    const block = data.blocksByName[blockName];

    if (!block) {
      throw new Error(`Unknown block name: ${blockName}`);
    }

    return this.mineflayerBot
      .findBlocks({
        matching: block.id,
        maxDistance,
        count,
      })
      .map((pos) => ({
        name: blockName,
        x: pos.x,
        y: pos.y,
        z: pos.z,
      }));
  }
}
