---
layout: block
title: "MCP Servers — Connecting External Tools"
block_number: 9
description: "Extend Claude Code with the Model Context Protocol — connect to GitHub, filesystems, databases, and 50+ external tools without leaving your terminal."
time: "~35 min (10 min presentation + 25 min practical)"
features:
  - MCP config (.mcp.json)
  - claude mcp add
  - MCP tools in permissions
  - GitHub MCP server
  - Filesystem MCP server
objectives:
  - Understand MCP as Claude Code's plugin system for external tools
  - Configure the GitHub MCP server to interact with repos, issues, and PRs
  - Use Claude to create, list, and comment on GitHub issues
  - Configure the filesystem MCP server for cross-directory access
  - Manage MCP tool permissions via the /permissions command
  - Know where to find and evaluate community MCP servers
overview_url: /course/block-09-mcp/
presentation_url: /course/block-09-mcp/presentation/
hands_on_url: /course/block-09-mcp/hands-on/
locale: en
translation_key: block-09
---
## Claude's Plugin System

Up to this point, Claude Code has been working with what's in front of it — your local files, your terminal, your git repo. That's powerful, but it's also a walled garden. What if you want Claude to check your GitHub issues? Comment on a PR? Query a database? Post to Slack?

That's what MCP does. The Model Context Protocol is how Claude connects to the outside world. Think of MCP servers as plugins — each one gives Claude a new set of abilities. The GitHub MCP server lets Claude read issues, create PRs, and comment on code reviews. The filesystem MCP server lets Claude access directories outside the current project. The Slack MCP server lets Claude post messages. And there are dozens more.

The beauty of MCP is that Claude treats these external tools exactly like its built-in tools. It doesn't "call an API" or "run a script" — it just has new capabilities that show up in its toolbox, as natural as reading a file or running a command.

## What We'll Cover

1. **What MCP is** — the Model Context Protocol and why it exists
2. **How MCP servers work** — processes that expose tools to Claude
3. **Configuration** — setting up `.mcp.json`
4. **GitHub MCP in practice** — issues, PRs, and comments
5. **Filesystem MCP** — accessing directories outside your project
6. **Permissions** — controlling which MCP tools Claude can use
7. **The MCP ecosystem** — where to find more servers

## Why This Block Matters

Here's the real power move: when Claude can interact with both your code _and_ your project management tools, it stops being just a coding assistant and becomes a development workflow assistant.

Imagine this: "Look at the open issues labeled `bug`, find the one about the dark theme toggle, read the relevant source files, implement a fix, create a branch, push it, and open a PR linking back to the issue." That's not science fiction — that's a Claude session with MCP configured.

MCP is what turns Claude from "a really smart pair programmer" into "an engineer who can navigate your entire development ecosystem."

## Prerequisites

- Completed Blocks 0-8
- A GitHub account with access to a repository (ai-coderrank or any test repo)
- The `gh` CLI installed and authenticated (`gh auth status` should show you logged in)
- Node.js installed (MCP servers run as Node processes)

---

## Choose Your Format

Pick the format that matches how you are using the block:

<div class="card-grid">
  <a href="{{ '/course/block-09-mcp/presentation/' | relative_url }}" class="quick-card">
    <h3>Presentation</h3>
    <p>Speaker notes, slide flow, and talking points for the voice-over part of this block.</p>
  </a>

  <a href="{{ '/course/block-09-mcp/hands-on/' | relative_url }}" class="quick-card">
    <h3>Hands-On</h3>
    <p>Copy-pasteable terminal steps and prompts for the screen-sharing implementation part.</p>
  </a>
</div>
