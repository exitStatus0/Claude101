---
layout: resource
title: "Claude Code Cheatsheet"
purpose: "Find the right command, file, or shortcut — fast."
verified: "2026-04-06"
permalink: /resources/cheatsheet/
locale: en
translation_key: cheatsheet
---

## Start Fast

```bash
# macOS / Linux / WSL (official native installer)
curl -fsSL https://claude.ai/install.sh | bash
```

```bash
# macOS alternative
brew install --cask claude-code

# Windows
winget install Anthropic.ClaudeCode
```

Authenticate and verify the setup:

```bash
claude auth login
claude auth status --text
claude                   # interactive session
claude "explain this repo"  # start with a prompt
claude -c                # continue last conversation
claude --resume          # pick a session to resume
```

Type `/help` inside any session to see all available commands.

This course is terminal-first, but Claude Code also runs in VS Code, JetBrains, Desktop, and Web.

## Daily Commands

| Command | Description |
|---------|-------------|
| `claude` | Start an interactive session |
| `claude -p "prompt"` | One-shot print mode (non-interactive) |
| `claude -c` | Continue the last conversation |
| `/resume` | Re-open a saved conversation |
| `/clear` | Reset the conversation |
| `/compact` | Compress context to free up tokens |
| `/cost` | Check token usage and spend |
| `/status` | See version, model, account, and connectivity |
| `/diff` | Review current and per-turn diffs |
| `/permissions` | Manage tool access for the session |

## CLI Commands

| Command | Description |
|---------|-------------|
| `claude auth login` | Sign in |
| `claude auth status --text` | Check authentication state |
| `claude update` | Update Claude Code |
| `claude agents` | List configured sub-agents |
| `claude mcp` | Manage MCP servers from the CLI |
| `claude plugin` | Manage plugins |
| `claude remote-control --name "my session"` | Start a Remote Control server session |

## Slash Commands

### Daily

| Command | Description |
|---------|-------------|
| `/help` | Show all commands |
| `/resume` | Resume a session |
| `/rename "name"` | Rename this session |
| `/clear` | Start fresh |
| `/compact` | Compress context |
| `/cost` | Check usage |
| `/status` | Show version, model, account, and connectivity |
| `/permissions` | Manage tool access |

### Advanced

| Command | Description |
|---------|-------------|
| `/plan` | Enter plan mode (read-only) |
| `/init` | Generate CLAUDE.md for this project |
| `/memory` | View/edit loaded instructions and auto-memory |
| `/model` | Inspect or switch models |
| `/effort` | Adjust reasoning depth |
| `/context` | Visualize context usage |
| `/diff` | Open interactive diff viewer |
| `/doctor` | Diagnose install and settings issues |
| `/hooks` | Inspect active hook configuration |
| `/mcp` | Manage MCP connections and auth |
| `/skills` | List available skills |
| `/plugin` | Manage plugins |
| `/agents` | List configured sub-agents |
| `/add-dir` | Add directory access |
| `/config` | Configure settings |
| `/remote-control` | Continue this session remotely |
| `/security-review` | Review current diff for security issues |

### Automation

| Command | Description |
|---------|-------------|
| `/loop 5m "prompt"` | Repeat a prompt on an interval |
| `/schedule` | Create cloud scheduled tasks |
| `/batch "instruction"` | Parallel changes across files |
| `/install-github-app` | Set up the GitHub Actions integration |

<div class="callout-advanced" markdown="1">
Claude Code shows built-in commands and bundled skills together in the slash menu. High-value bundled skills include <code>/simplify</code>, <code>/batch</code>, <code>/debug</code>, and <code>/loop</code>.
</div>

### Experimental

Agent teams -- coordinate multiple sub-agents on a single task. Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

## Models & Flags

**Common flags**

| Flag | Description |
|------|-------------|
| `--model opus\|sonnet\|haiku` | Choose a model |
| `--effort low\|medium\|high\|max` | Reasoning depth |
| `-p` | Print mode (non-interactive) |
| `-c` | Continue last conversation |
| `-r "<session>"` | Resume a named or ID-based session |
| `-w [name]` | Work in a git worktree |
| `-n "name"` | Name the session |
| `--remote-control` | Start an interactive session with Remote Control enabled |

**Advanced flags**

| Flag | Description |
|------|-------------|
| `--output-format text\|json\|stream-json` | Choose scripting output format |
| `--max-turns N` | Limit agentic iterations |
| `--max-budget-usd N` | Cap spend in USD |
| `--permission-mode` | `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions` |
| `--add-dir ../path` | Add extra directory to context |
| `--mcp-config file.json` | Load custom MCP config |
| `--tools "Bash,Edit,Read"` | Restrict built-in tools for a session |
| `--bare` | Minimal scripted mode with less auto-discovery |

## Files & Locations

| File | Scope | Purpose |
|------|-------|---------|
| `CLAUDE.md` | Project (shared) | Project-level instructions |
| `.claude/CLAUDE.md` | Project (shared) | Alternative project location |
| `CLAUDE.local.md` | Project (gitignored) | Personal overrides |
| `~/.claude/CLAUDE.md` | User | Instructions for all projects |
| `.claude/rules/*.md` | Project (shared) | Path-specific rules |
| `.claude/settings.json` | Project (shared) | Project settings and hooks |
| `.claude/settings.local.json` | Project (gitignored) | Local settings |
| `~/.claude/settings.json` | User | User-wide settings |
| `.mcp.json` | Project (shared) | MCP server config |
| `.claude/skills/*/SKILL.md` | Project (shared) | Custom skills |
| `~/.claude/skills/*/SKILL.md` | User | Personal skills |
| `.claude/agents/*.md` | Project (shared) | Custom sub-agents |
| `~/.claude/agents/*.md` | User | Personal sub-agents |

## MCP Setup

```bash
claude mcp add <name> --scope project -- <command> [args...]
claude mcp list
claude mcp remove <name>
```

<div class="callout-daily" markdown="1">
Project scope stores config in <code>.mcp.json</code>. User scope stores config in <code>~/.claude.json</code>.
</div>

## Hooks Basics

Hooks live in `.claude/settings.json` under the `hooks` key.

**Hook types:** command, prompt, agent, http

**Key events**

| Event | When it fires |
|-------|---------------|
| `PreToolUse` | Before any tool runs |
| `PostToolUse` | After a tool succeeds |
| `SessionStart` | Session begins |
| `Stop` | Claude finishes responding |

**Exit codes:** `0` = proceed, `2` = block the action.

<div class="callout-advanced" markdown="1">
Hooks receive JSON on stdin. Use <code>jq</code> to extract fields in shell hooks.
</div>

## GitHub Actions

```yaml
# .github/workflows/claude.yml
on:
  issue_comment: { types: [created] }
  pull_request_review_comment: { types: [created] }
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Advanced

**Headless mode** -- pipe Claude into scripts:

```bash
claude -p "list TODO comments" --output-format json
```

**Remote control** -- continue the same local session from phone or browser:

```bash
claude --remote-control "my rollout"
```

**Agent teams** -- experimental multi-agent coordination:

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude "Review security, performance, and quality"
```

**Budget controls:**

| Flag | Description |
|------|-------------|
| `--max-budget-usd N` | Hard spend cap |
| `--max-turns N` | Limit agentic loops |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Shift+Tab` | Cycle permission modes |
| `Ctrl+C` | Interrupt current turn |
| `Ctrl+L` | Clear the terminal screen |
| `Ctrl+O` | Toggle verbose mode |
| `Esc` `Esc` | Edit the previous message |
| `Ctrl+T` | Toggle task list (agent teams) |
| `Shift+Down` | Cycle teammates |
| `/` | Open slash command autocomplete |
