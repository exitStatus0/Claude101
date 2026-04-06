---
layout: block-part
title: "MCP Servers — Connecting External Tools"
block_number: 9
description: "Hands-on implementation steps for Block 09."
time: "~25 minutes"
part_name: "Hands-On"
overview_url: /course/block-09-mcp/
presentation_url: /course/block-09-mcp/presentation/
hands_on_url: /course/block-09-mcp/hands-on/
permalink: /course/block-09-mcp/hands-on/
locale: en
translation_key: block-09-hands-on
---
> **Direct speech:** "Everything on this hands-on page is built so you can follow me line by line. When you see a command or prompt block, you can copy it directly into your terminal or Claude session unless I explicitly tell you it is just reference material. As we go, compare your result with mine on screen so you can catch mistakes early instead of stacking them up."

> **Duration**: ~25 minutes
> **Outcome**: GitHub MCP integration for managing issues and PRs, filesystem MCP for cross-directory access, and permissions management for MCP tools.
> **Prerequisites**: Completed Blocks 0-8, a GitHub account, `gh` CLI installed and authenticated, Node.js installed

---

### Step 1: Add the GitHub MCP Server (~5 min)

The preferred way to configure MCP servers is the `claude mcp add` command. It writes the config to `.mcp.json` (project-scoped with `--scope project`) or `~/.claude.json` (user-scoped with `--scope user`) automatically — no hand-editing JSON.

First, you need a GitHub personal access token. If you don't have one:

1. Go to https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Name it `claude-code-mcp`
4. Select scopes: `repo` (full control of private repositories), `read:org`
5. Generate and copy the token

Set the environment variable (add this to your `~/.zshrc` or `~/.bashrc` to make it permanent):

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

Now add the GitHub MCP server using the CLI:

```bash
claude mcp add github --scope project -- npx -y @modelcontextprotocol/server-github
```

This creates `.mcp.json` in your project root with the server configuration. You can inspect it:

```bash
cat .mcp.json
```

You'll see something like:

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
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

> **Security note**: The `${GITHUB_TOKEN}` syntax references your shell environment variable at runtime — the actual token is never stored in the file. If `.mcp.json` is committed to git, this is safe. For extra caution, add `.mcp.json` to `.gitignore`.
>
> **Why `claude mcp add` instead of hand-editing?** The CLI command handles JSON formatting, validates the server config, and supports `--scope project` vs `--scope user` to control where the config is stored. It's the officially recommended approach.

---

### Step 2: Restart Claude and Verify MCP (~2 min)

MCP servers load when a session starts. Exit your current Claude session and start a new one:

```bash
cd ~/ai-coderrank
claude
```

When Claude starts, it will launch the GitHub MCP server in the background. You might see a brief initialization message.

Verify the MCP tools are available by asking:

```text
What MCP tools do you have available? List them.
```

Claude should report tools like:
- `create_or_update_file` — Create or update a file in a repository
- `create_issue` — Create a new issue
- `create_pull_request` — Create a new pull request
- `get_issue` — Get details of an issue
- `list_issues` — List issues in a repository
- `add_issue_comment` — Comment on an issue
- `search_repositories` — Search for repositories
- `get_file_contents` — Get file contents from a repo
- And more...

If Claude says it doesn't have MCP tools, check:
1. Is `GITHUB_TOKEN` exported in your current shell?
2. Is `.mcp.json` valid JSON? (ask Claude to validate it)
3. Try `npx -y @modelcontextprotocol/server-github` manually to see if it runs

---

### Step 3: List Issues with MCP (~3 min)

Now let's use the GitHub MCP tools. Ask Claude:

```text
List all open issues on the ai-coderrank repository. 
My GitHub username is <your-github-username>.
```

Claude will use the `list_issues` tool from the GitHub MCP server. It makes the actual GitHub API call and returns the results.

If there are no issues yet (it's a fresh repo), Claude will tell you that. That's fine — we're about to create some.

Try a broader query:

```text
Search for any repositories I own that have "coderrank" in the name.
```

This uses the `search_repositories` tool. Claude can navigate your entire GitHub presence through MCP.

---

### Step 4: Create a GitHub Issue via MCP (~3 min)

Here's where it gets fun. Ask Claude:

```text
Create a new issue on the ai-coderrank repository:
- Title: "Add dark theme documentation"
- Body: "The dark theme was implemented in Block 4 but there's no user-facing 
  documentation. We need:
  - A section in the README explaining the theme toggle
  - Screenshot showing both light and dark modes
  - Any relevant accessibility notes (contrast ratios, etc.)
  
  Priority: low
  Relates to: dark theme implementation"
- Labels: documentation, enhancement
```

Claude will use the `create_issue` tool. You should get back the issue number and URL.

Verify it worked:

```text
Show me the issue you just created. Include the full body and any labels.
```

Claude reads it back using `get_issue`. Then go to your GitHub repo in the browser to confirm it's there.

Now create another issue:

```text
Create an issue titled "Add health check endpoints" with a body describing 
the need for /health and /ready endpoints for Kubernetes liveness and 
readiness probes. Label it with "enhancement" and "infrastructure".
```

---

### Step 5: Comment on an Issue or PR via MCP (~3 min)

Let's interact with existing issues. Ask Claude:

```text
Add a comment to issue #1 on ai-coderrank that says:
"Investigated this — the dark theme implementation is in src/app/providers.tsx 
and uses next-themes. Documentation should cover:
1. How the ThemeProvider works
2. The useTheme() hook for components that need theme-aware styling
3. How to add new theme-sensitive components

Will pick this up in a future block."
```

Claude uses the `add_issue_comment` tool. The comment appears on the issue as if you typed it in the GitHub UI.

If you have any open PRs, try:

```text
List all open pull requests on ai-coderrank. For each one, show the title, 
author, and number of changed files.
```

And then:

```text
Add a review comment to PR #<number> that says "Looks good! Just one note — 
make sure the resource limits are set in the K8s deployment."
```

> **What you're seeing**: Claude is navigating your GitHub workflow entirely from the terminal. No browser tabs, no context switching. Issue tracking, code review, and development all in one place.

---

### Step 6: Configure Filesystem MCP (~3 min)

The filesystem MCP server lets Claude access directories outside your current project. This is useful when you need Claude to reference configs, scripts, or data in another location.

Ask Claude:

Use the CLI to add it:

```bash
claude mcp add filesystem --scope project -- npx -y @modelcontextprotocol/server-filesystem ~/.kube ~/scripts
```

This adds the filesystem server alongside the existing GitHub server in `.mcp.json`. The filesystem MCP server takes directory paths as arguments — Claude can only access files within those directories, not anywhere else.

Restart Claude and test:

```text
Using the filesystem MCP, read my kubeconfig at ~/.kube/config-do and tell me 
what cluster it points to, what user credentials it uses, and whether the 
certificate is Base64-encoded or a file reference.
```

Claude uses the filesystem MCP to read a file outside the project directory — something it normally can't do.

---

### Step 7: Manage MCP Permissions (~3 min)

Now that you have MCP tools, let's control what Claude can do with them.

In your Claude session, run:

```text
/permissions
```

You'll see the standard permissions list, plus MCP tools. They follow the naming pattern `mcp__<server>__<tool>`:

```text
mcp__github__create_issue
mcp__github__list_issues
mcp__github__create_pull_request
mcp__github__merge_pull_request
mcp__filesystem__read_file
mcp__filesystem__write_file
```

You can allow or deny specific tools. For safety, let's block the dangerous ones:

```text
Update permissions to deny these MCP tools:
- mcp__github__merge_pull_request (don't want accidental merges)
- mcp__github__delete_branch (protect branches)
- mcp__filesystem__write_file (read-only filesystem access)
```

This goes into your `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep", "Write", "Edit", "Bash",
      "mcp__github__list_issues",
      "mcp__github__get_issue",
      "mcp__github__create_issue",
      "mcp__github__add_issue_comment",
      "mcp__github__list_pull_requests",
      "mcp__github__create_pull_request",
      "mcp__filesystem__read_file",
      "mcp__filesystem__list_directory"
    ],
    "deny": [
      "mcp__github__merge_pull_request",
      "mcp__github__delete_branch",
      "mcp__filesystem__write_file"
    ]
  }
}
```

Now Claude can create issues and PRs but can't merge or delete. It can read your kubeconfig but can't modify it. This is the principle of least privilege applied to AI tools.

#### Test the Permissions

```text
Try to merge pull request #1 on ai-coderrank.
```

Claude should report that it doesn't have permission to use that tool.

---

### Step 8: Explore the MCP Ecosystem (~3 min)

The GitHub and filesystem servers are just the beginning. Here's a quick tour of what else is out there:

#### Where to Find MCP Servers

- **Official registry**: https://github.com/modelcontextprotocol/servers
- **MCP directory**: https://mcp.so
- **Anthropic's list**: Check the Claude Code documentation for officially supported servers

#### Notable Servers Worth Exploring

| Server | What It Does | Install |
|--------|-------------|---------|
| **Slack** | Send/read messages, manage channels | `@anthropic/mcp-slack` |
| **Linear** | Issues, projects, cycles | `@linear/mcp-server` |
| **PostgreSQL** | Query databases, inspect schemas | `@modelcontextprotocol/server-postgres` |
| **Docker** | Manage containers, images, volumes | `@modelcontextprotocol/server-docker` |
| **Puppeteer** | Browser automation, screenshots | `@modelcontextprotocol/server-puppeteer` |
| **Memory** | Persistent knowledge graph | `@modelcontextprotocol/server-memory` |

#### How to Evaluate a Community MCP Server

Before adding any MCP server to your configuration, check:

1. **Source code** — Is it open source? Can you read what it does?
2. **Permissions** — What API scopes does it need? (Minimal is better)
3. **Maintenance** — When was the last commit? Are issues being addressed?
4. **Stars/forks** — Community validation (not definitive, but a signal)
5. **Token handling** — Does it handle credentials securely?

> **Rule of thumb**: Official servers from Anthropic and the MCP organization are safe. Community servers should be reviewed like any open-source dependency — check the code, check the maintainer, check the permissions.

---

### Checkpoint

Your MCP setup:

```text
.mcp.json
├── github (MCP server)
│   ├── list_issues         ✓ allowed
│   ├── create_issue        ✓ allowed
│   ├── add_issue_comment   ✓ allowed
│   ├── create_pull_request ✓ allowed
│   ├── merge_pull_request  ✗ denied
│   └── delete_branch       ✗ denied
└── filesystem (MCP server)
    ├── read_file           ✓ allowed
    ├── list_directory      ✓ allowed
    └── write_file          ✗ denied
```

You've:
- Configured two MCP servers (GitHub and filesystem)
- Created issues and comments directly from Claude
- Set up fine-grained permissions for MCP tools
- Explored the MCP ecosystem

Claude is no longer confined to your local codebase. It can interact with your GitHub projects, read configs from other directories, and — with additional MCP servers — connect to almost any tool in your development workflow.

---

### Bonus Challenges

**Challenge 1: Full issue workflow**
Create an issue, make the code change to fix it, commit the fix, and ask Claude to open a PR that references the issue — all in one session, all using MCP tools. This is the dream workflow: issue to PR without leaving the terminal.

```text
Create an issue titled "Add /health endpoint for K8s readiness probe". Then 
implement the fix, commit it to a new branch, push it, and create a PR that 
closes the issue. Do the whole workflow.
```

**Challenge 2: Add Slack MCP**
If your team uses Slack, configure the Slack MCP server and have Claude post a message when a deployment completes. Combine this with the Stop hook from Block 8 for automatic notifications.

**Challenge 3: Database MCP**
If ai-coderrank uses a database, configure the PostgreSQL MCP server and ask Claude to explore the schema, describe the tables, and suggest index improvements.

---

> **Next up**: In Block 10, we take Claude beyond your terminal and into your CI/CD pipeline. GitHub Actions with Claude Code — automated PR reviews, issue implementation, and AI-powered workflows that run on every push.
