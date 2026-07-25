import minecraftData from "minecraft-data";
import * as mineflayer from "mineflayer";
import { Item } from "prismarine-item";
import { Vec3 } from "vec3";
import { z } from "zod";

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

  getInventory() {
    return this.mineflayerBot.inventory.slots
      .filter((slot): slot is Item => slot !== null)
      .map((item) => ({
        name: item.name,
        count: item.count,
        slot: item.slot,
        customName: item.customName,
      }));
  }

  getOpenInventory() {
    const currentWindow = this.mineflayerBot.currentWindow;

    if (!currentWindow) {
      return null;
    }

    return {
      title: currentWindow.title,
      type: currentWindow.type,
      items: currentWindow.slots
        .filter((slot): slot is Item => slot !== null)
        .map((item) => ({
          name: item.name,
          count: item.count,
          slot: item.slot,
          customName: item.customName,
        })),
    };
  }

  async clickOpenInventorySlot(
    slot: number,
    button: "left" | "right",
    shift: boolean,
  ) {
    const window = this.mineflayerBot.currentWindow;

    if (!window) {
      throw new Error("No window is currently open");
    }

    if (slot < 0 || slot >= window.slots.length) {
      throw new Error(
        `Slot ${slot} is out of range for the current window (0-${window.slots.length - 1})`,
      );
    }

    const mouseButton = button === "left" ? 0 : 1;
    const mode = shift ? 1 : 0;

    await this.mineflayerBot.clickWindow(slot, mouseButton, mode);
  }

  async equipItem(
    itemName: string,
    destination: mineflayer.EquipmentDestination,
    customName?: string,
  ) {
    let items = this.mineflayerBot.inventory.slots
      .filter((slot): slot is Item => slot !== null)
      .filter((item) => item.name === itemName);

    if (customName !== undefined) {
      const customNameSchema = z.object({
        type: z.literal("string"),
        value: z.string(),
      });

      items = items.filter((item) => {
        if (!item.customName) {
          return false;
        }

        const parsed = customNameSchema.safeParse(item.customName);

        const nameStr = parsed.success
          ? parsed.data.value
          : String(item.customName);

        return nameStr.includes(customName);
      });
    }

    if (items.length === 0) {
      throw new Error(
        `No item found matching name "${itemName}"${customName ? ` with custom name "${customName}"` : ""}`,
      );
    }

    await this.mineflayerBot.equip(items[0], destination);
  }

  findNearbyEntities(
    entityType?: string,
    maxDistance: number = 16,
    count: number = 16,
  ) {
    const origin = this.mineflayerBot.entity.position;

    return Object.values(this.mineflayerBot.entities)
      .filter((entity) => entity !== this.mineflayerBot.entity)
      .filter(
        (entity) => entityType === undefined || entity.name === entityType,
      )
      .map((entity) => ({
        id: entity.id,
        name: entity.name ?? null,
        type: entity.type ?? null,
        username: entity.username ?? null,
        x: entity.position.x,
        y: entity.position.y,
        z: entity.position.z,
        distance: entity.position.distanceTo(origin),
      }))
      .filter((entity) => entity.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
  }

  async interactEntity(entityId: number) {
    const entity = this.mineflayerBot.entities[entityId];

    if (!entity) {
      throw new Error(`No entity found with id ${entityId}`);
    }

    await this.mineflayerBot.activateEntity(entity);
  }

  attackEntity(entityId: number) {
    const entity = this.mineflayerBot.entities[entityId];

    if (!entity) {
      throw new Error(`No entity found with id ${entityId}`);
    }

    this.mineflayerBot.attack(entity);
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
