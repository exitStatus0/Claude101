---
layout: resource
title: "Claude Code Cheatsheet"
purpose: "Find the right command, file, or shortcut — fast."
verified: "2026-04-06"
permalink: /resources/cheatsheet/
---

## Start Fast

```bash
npm install -g @anthropic-ai/claude-code
```

Run `claude` once to authenticate, then you are ready to go.

```bash
claude                   # interactive session
claude "explain this repo"  # start with a prompt
claude -c                # continue last conversation
claude --resume          # pick a session to resume
```

Type `/help` inside any session to see all available commands.

## Daily Commands

| Command | Description |
|---------|-------------|
| `claude` | Start an interactive session |
| `claude -p "prompt"` | One-shot print mode (non-interactive) |
| `claude -c` | Continue the last conversation |
| `/clear` | Reset the conversation |
| `/compact` | Compress context to free up tokens |
| `/cost` | Check token usage and spend |
| `/permissions` | Manage tool access for the session |

## Slash Commands

<span class="badge badge-daily">Daily</span>

| Command | Description |
|---------|-------------|
| `/help` | Show all commands |
| `/clear` | Start fresh |
| `/compact` | Compress context |
| `/cost` | Check usage |
| `/memory` | View/edit loaded instructions |
| `/permissions` | Manage tool access |
| `/rename "name"` | Rename this session |

<span class="badge badge-advanced">Advanced</span>

| Command | Description |
|---------|-------------|
| `/plan` | Enter plan mode (read-only) |
| `/init` | Generate CLAUDE.md for this project |
| `/simplify` | Review and improve recent code |
| `/agents` | List configured sub-agents |
| `/add-dir` | Add directory access |
| `/config` | Configure settings |

<span class="badge badge-advanced">Automation</span>

| Command | Description |
|---------|-------------|
| `/loop 5m "prompt"` | Repeat a prompt on an interval |
| `/schedule` | Create cloud scheduled tasks |
| `/batch "instruction"` | Parallel changes across files |

<span class="badge badge-experimental">Experimental</span>

Agent teams -- coordinate multiple sub-agents on a single task. Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

## Models & Flags

**Common flags**

| Flag | Description |
|------|-------------|
| `--model opus\|sonnet\|haiku` | Choose a model |
| `--effort min\|low\|medium\|high\|max` | Reasoning depth (Opus only) |
| `-p` | Print mode (non-interactive) |
| `-c` | Continue last conversation |
| `-w <branch>` | Work in a git worktree |
| `-n "name"` | Name the session |

**Advanced flags**

| Flag | Description |
|------|-------------|
| `--output-format json` | JSON output for scripts |
| `--max-turns N` | Limit agentic iterations |
| `--max-budget-usd N` | Cap spend in USD |
| `--permission-mode` | `default`, `plan`, `acceptEdits`, `bypassPermissions` |
| `--add-dir ../path` | Add extra directory to context |
| `--mcp-config file.json` | Load custom MCP config |

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
| `Ctrl+O` | Toggle verbose mode |
| `Ctrl+T` | Toggle task list (agent teams) |
| `Shift+Down` | Cycle teammates |
| `/` | Open slash command autocomplete |
