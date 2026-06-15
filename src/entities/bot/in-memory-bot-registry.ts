import { Bot } from "./bot.js";

export class InMemoryBotRegistry {
  private bots = new Map<string, Bot>();

  get(botId: string): Bot | undefined {
    return this.bots.get(botId);
  }

  add(bot: Bot): string {
    const botId = `bot_${this.bots.size}`;

    this.bots.set(botId, bot);

    return botId;
  }

  delete(botId: string): void {
    this.bots.delete(botId);
  }

  keys(): IterableIterator<string> {
    return this.bots.keys();
  }
}
