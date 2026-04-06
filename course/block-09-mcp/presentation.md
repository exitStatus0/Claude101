---
layout: block-part
title: "MCP Servers — Connecting External Tools"
block_number: 9
description: "Presentation notes and speaking flow for Block 09."
part_name: "Presentation"
overview_url: /course/block-09-mcp/
presentation_url: /course/block-09-mcp/presentation/
hands_on_url: /course/block-09-mcp/hands-on/
permalink: /course/block-09-mcp/presentation/
locale: en
translation_key: block-09-presentation
---
> **Duration**: ~10 minutes
> **Goal**: Students understand what MCP is, how servers work, and how to configure Claude Code to use external tools.

---

### Slide 1: The Integration Problem

Here's your daily workflow as a developer:

1. Read a GitHub issue
2. Open the codebase in your editor
3. Make changes
4. Run tests
5. Push a branch
6. Open a PR linking to the issue
7. Respond to review comments
8. Post an update in Slack

Steps 2-4? Claude Code handles those beautifully. But steps 1, 5-8? Claude can't see your GitHub issues. It can't open PRs. It doesn't know Slack exists. It's stuck inside your local terminal.

That's the integration problem. Claude is great at code, but code doesn't exist in a vacuum. It exists inside a workflow that spans multiple tools, platforms, and services. Without access to those tools, Claude is like a chef who can cook anything but can't read the menu or serve the food.

MCP solves this.

---

### Slide 2: What MCP Actually Is

**MCP = Model Context Protocol.** It's an open standard that defines how AI models connect to external tools and data sources.

Think of it like USB for AI. Before USB, every peripheral had its own connector — printers, keyboards, mice, cameras all used different cables. USB said "one standard plug, everything connects the same way." MCP does the same thing for AI integrations.

```
Before MCP:                          With MCP:
  Claude ──custom code──> GitHub       Claude ──MCP──> GitHub
  Claude ──custom code──> Slack        Claude ──MCP──> Slack
  Claude ──custom code──> Jira         Claude ──MCP──> Linear
  Claude ──custom code──> Database     Claude ──MCP──> PostgreSQL
  (Each requires building & maintaining a custom integration)
  (One protocol. Plug any server in.)
```

An MCP **server** is a small process that:
1. Exposes a set of **tools** (functions Claude can call)
2. Communicates with Claude using the MCP protocol
3. Handles the actual API calls to the external service

From Claude's perspective, MCP tools look and work exactly like its built-in tools. It doesn't know (or care) that `create_issue` comes from an MCP server rather than being baked into the binary. It just has more tools available.

---

### Slide 3: Available MCP Servers

The MCP ecosystem is growing fast. Here are the servers you'll encounter most:

#### Official / Well-Maintained Servers

| Server | What It Provides | Use Case |
|--------|-----------------|----------|
| **GitHub** | Issues, PRs, reviews, comments, repo management | Full GitHub workflow from Claude |
| **Filesystem** | Read/write files in additional directories | Access files outside your project |
| **PostgreSQL** | Query and inspect databases | Debug data issues, explore schemas |
| **Slack** | Send messages, read channels | Team communication |
| **Linear** | Issues, projects, cycles | Project management |
| **Docker** | Container management | Build, run, inspect containers |
| **Puppeteer** | Browser automation | Testing, screenshots |

#### Community Servers

The community has built 50+ MCP servers for everything from Notion to Google Drive to AWS. Quality varies — check the GitHub stars, last commit date, and whether the maintainer is responsive to issues.

> **Where to find them**: https://github.com/modelcontextprotocol/servers — the official list. Also check https://mcp.so for a searchable directory.

---

### Slide 4: Configuration — `.mcp.json`

MCP servers are configured in a JSON file. Here's the structure:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/allowed/directory"
      ]
    }
  }
}
```

Each server entry has:
- **`command`** — what to run (usually `npx` for Node-based servers)
- **`args`** — arguments passed to the command (the package name, plus any server-specific config)
- **`env`** (optional) — environment variables the server needs (API tokens, etc.)

This file lives at `.mcp.json` for project-level config. User-level config is stored in `~/.claude.json` (managed automatically by `claude mcp add --scope user`).

When Claude Code starts (or when you restart a session), it launches each configured MCP server as a background process. The servers stay running for the duration of your session.

---

### Slide 5: How Claude Uses MCP Tools

Once an MCP server is configured, its tools appear in Claude's toolbox automatically. Here's what that looks like in practice:

**You say**: "List all open issues on the ai-coderrank repo labeled `bug`"

**Claude thinks**: "I have a `list_issues` tool from the GitHub MCP server. Let me use it."

**What happens**:
1. Claude calls the `list_issues` tool with parameters `{owner: "your-name", repo: "ai-coderrank", state: "open", labels: ["bug"]}`
2. The MCP server receives the call
3. The server makes the actual GitHub API request
4. Results come back to Claude
5. Claude presents the issues to you in a readable format

You didn't write any code. You didn't configure any API calls. You just asked a question, and Claude used the right tool to answer it.

The same flow works for creating issues, commenting on PRs, reading files from other directories, querying databases — any tool that any configured MCP server exposes.

---

### Slide 6: Permissions — Controlling MCP Access

Here's the thing about giving Claude access to your GitHub account: you might not want it to do _everything_. Maybe you're fine with it reading issues but not comfortable with it pushing code. Maybe it can list PRs but shouldn't merge them.

That's where permissions come in. The `/permissions` command in Claude Code shows and manages tool access:

```
> /permissions

Allowed:
  - mcp__github__list_issues
  - mcp__github__get_issue
  - mcp__github__create_issue
  - mcp__github__list_pull_requests

Denied:
  - mcp__github__merge_pull_request
  - mcp__github__delete_branch
```

MCP tools follow the naming convention `mcp__<server>__<tool>`. You can allow or deny each one individually, or use patterns:

- Allow all GitHub read operations: `mcp__github__get_*`, `mcp__github__list_*`
- Block all destructive operations: deny `mcp__github__delete_*`, `mcp__github__merge_*`

This gives you fine-grained control. Claude can be a helpful assistant that reads your issues and opens PRs, without being able to merge to main or delete branches.

> **Rule of thumb**: Start with read-only access. Add write permissions as you build trust. Never auto-approve destructive operations.

---

### Key Takeaways

| Concept | What It Is | Why It Matters |
|---------|-----------|----------------|
| MCP | Model Context Protocol — AI's plugin standard | One protocol to connect any tool |
| MCP server | A process exposing tools via MCP | Each server adds capabilities to Claude |
| `.mcp.json` | MCP configuration file | Where you declare which servers to run |
| MCP tools | Functions exposed by MCP servers | Claude calls them like built-in tools |
| `/permissions` | Tool access management | Control exactly what Claude can do |
| `mcp__server__tool` | MCP tool naming convention | Used for fine-grained permission rules |

> **Transition**: Time to wire things up. You're about to connect Claude to GitHub and watch it create issues, comment on PRs, and navigate your project management workflow — all from the terminal.

---
