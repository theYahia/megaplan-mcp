# @theyahia/megaplan-mcp

MCP server for **Megaplan** project management. Provides tools for managing tasks and deals via API v3.

## Tools

| Tool | Description |
|------|------------|
| `get_tasks` | List tasks with filters by status, responsible, search |
| `create_task` | Create a new task with name, description, deadline |
| `get_deals` | List deals with filters by status, responsible, search |

## Setup

1. In Megaplan, go to **Settings > Integration > API**
2. Generate an access token

## Usage with Claude Desktop

```json
{
  "mcpServers": {
    "megaplan": {
      "command": "npx",
      "args": ["-y", "@theyahia/megaplan-mcp"],
      "env": {
        "MEGAPLAN_DOMAIN": "yourcompany.megaplan.ru",
        "MEGAPLAN_TOKEN": "your-access-token"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MEGAPLAN_DOMAIN` | Yes | Your Megaplan domain (e.g. `yourcompany.megaplan.ru`) |
| `MEGAPLAN_TOKEN` | Yes | Bearer access token |

## License

MIT
