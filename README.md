# @theyahia/megaplan-mcp

MCP server for **Megaplan** project management. Tasks, deals, projects, employees, comments via API v3.

## Tools (8)

| Tool | Description |
|------|------------|
| `get_tasks` | List tasks with filters by status, responsible, search |
| `create_task` | Create a task with name, description, deadline |
| `get_deals` | List deals with filters |
| `create_deal` | Create a deal with pipeline, amount, contact |
| `get_projects` | List projects with filters |
| `get_employees` | List employees with search, department filter |
| `get_comments` | List comments on task/deal/project |
| `create_comment` | Add a comment to task/deal/project |

## Skills (Prompts)

| Skill | Description |
|-------|------------|
| `my-tasks-today` | "Мои задачи на сегодня" — active tasks sorted by urgency |
| `create-deal-wizard` | "Создай сделку" — guided deal creation |

## Setup

### Option A: Access Token

1. In Megaplan, go to **Settings > Integration > API**
2. Generate an access token

### Option B: Login + Password

Use your Megaplan login credentials (email + password).

## Usage with Claude Desktop

```json
{
  "mcpServers": {
    "megaplan": {
      "command": "npx",
      "args": ["-y", "@theyahia/megaplan-mcp"],
      "env": {
        "MEGAPLAN_DOMAIN": "yourcompany",
        "MEGAPLAN_TOKEN": "your-access-token"
      }
    }
  }
}
```

Or with login/password:

```json
{
  "mcpServers": {
    "megaplan": {
      "command": "npx",
      "args": ["-y", "@theyahia/megaplan-mcp"],
      "env": {
        "MEGAPLAN_DOMAIN": "yourcompany",
        "MEGAPLAN_LOGIN": "user@example.com",
        "MEGAPLAN_PASSWORD": "your-password"
      }
    }
  }
}
```

## Streamable HTTP Transport

Run with `--http` flag for HTTP-based transport (useful for remote/cloud deployments):

```bash
MEGAPLAN_DOMAIN=yourcompany MEGAPLAN_TOKEN=xxx npx @theyahia/megaplan-mcp --http
# Listening on http://localhost:3000/mcp
```

Custom port via `PORT` env var.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MEGAPLAN_DOMAIN` | Yes | Megaplan subdomain (e.g. `yourcompany`) |
| `MEGAPLAN_TOKEN` | One of | Bearer access token |
| `MEGAPLAN_LOGIN` | One of | Login email (if no token) |
| `MEGAPLAN_PASSWORD` | One of | Password (if no token) |
| `PORT` | No | HTTP port for `--http` mode (default: 3000) |

## Referral

Get **20-50% recurring** commission by referring Megaplan:

- [Megaplan Partner Program](https://megaplan.ru/partners/)
- Sign up as a partner, get your referral link
- Every client you bring = recurring revenue share

## Development

```bash
npm install
npm run build
npm test
npm run dev          # stdio mode with tsx
npm run start:http   # HTTP mode
```

## License

MIT

---

Часть [WWmcp](https://github.com/theYahia/WWmcp) · Telegram: [@vhodvai](https://t.me/vhodvai)
