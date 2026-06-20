# Minecraft Bot MCP 

An MCP server to create and orchestrate multiple Minecraft bots via [Mineflayer](https://github.com/PrismarineJS/mineflayer).

## Installation

Add the server to your MCP client's config:

```json
{
  "mcpServers": {
    "minecraft-bot": {
      "command": "npx",
      "args": ["-y", "minecraft-bot-mcp"]
    }
  }
}
```

## Usage

> Note that bots can only connect to server's that have Microsoft authentication disabled (`online-mode=false`).

### Tools

| Tool | Description |
|------|-------------|
| `connect` | Connect a bot to a Minecraft server. Returns a `botId` to control the bot in subsequent calls. |
| `disconnect` | Disconnect a bot from the server. |
| `send-chat` | Send a chat message as a bot. |
| `open-container` | Open a container at given coordinates and return its contents. |
| `close-inventory` | Close the currently open container/inventory. |
| `find-nearby-blocks` | Find blocks of a given type within a radius. |

> More tools coming soon!

### Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Chat | `minecraft://{botId}/chat` | Recent chat messages seen by a bot. |

## Development

Install packages:

```bash
npm install
```

Build MCP server in watch mode:

```bash
npm run dev
```

Build and start MCP server in inspector:

```bash
npm run inspect
```

Point MCP client to local server build:

```json
{
  "mcpServers": {
    "minecraft-bot": {
      "command": "node",
      "args": ["/path/to/minecraft-bot-mcp/dist/index.js"]
    }
  }
}
```

## Contributing

Feel free to open an issue or pull request if you you have any feature ideas or encounter bugs!
