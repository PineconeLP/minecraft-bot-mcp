# Minecraft Bot MCP 

An MCP server to create and control Minecraft bots via [Mineflayer](https://github.com/PrismarineJS/mineflayer).

## Installation

> I'll publish to npm soon so it's easier to install.

1. Pull this repository locally:

```
git clone git@github.com:PineconeLP/minecraft-bot-mcp.git
```

2. Build the MCP server:

```
npm install
npm run build
```

3. Add the client to your MCP client's config:

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

## Usage

### Tools

| Tool | Description |
|------|-------------|
| `connect` | Spawn a bot and connect it to a Minecraft server |
| `disconnect` | Disconnect a bot from the server |
| `send-chat` | Send a chat message as a bot |
| `open-container` | Open a container at given coordinates and return its contents |
| `close-inventory` | Close the currently open container/inventory |
| `find-nearby-blocks` | Find blocks of a given type within a radius |

### Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Chat history | `minecraft://{botId}/chat` | Recent chat messages seen by a bot |

## Development

Build MCP server in watch mode:

```bash
npm run dev
```

Build and start MCP server in inspector:

```bash
npm run inspect
```

## Contributing

Feel free to open an issue or pull request if you you have any feature ideas or encounter bugs!
