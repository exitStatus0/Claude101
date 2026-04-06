---
layout: default
title: "Claude Code Cheatsheet"
---

<section class="section">
<div class="container container--narrow">

# Claude Code Cheatsheet

A quick reference for everything covered in the course.

## Installation & Auth

```bash
# Install
npm install -g @anthropic-ai/claude-code

# Update
claude update

# Authenticate (happens automatically on first run)
claude

# Check version
claude --version
```

## Starting Sessions

```bash
claude                        # Interactive session
claude "explain this repo"    # Start with a prompt
claude -p "run tests"         # Print mode (non-interactive, one-shot)
claude -c                     # Continue last conversation
claude -r "session-name"      # Resume named session
claude --resume               # Pick session to resume
claude -n "dark-theme"        # Name this session
```

## MCP Setup

```bash
# Add an MCP server (recommended over hand-editing .mcp.json)
claude mcp add <name> --scope project -- <command> [args...]

# Example: add GitHub MCP
claude mcp add github --scope project -- npx -y @modelcontextprotocol/server-github

# List configured MCP servers
claude mcp list

# Remove an MCP server
claude mcp remove <name>
```

## Key Flags

```bash
claude --model opus           # Use Claude Opus (most capable)
claude --model haiku          # Use Claude Haiku (fast/cheap)
claude --effort max           # Maximum reasoning (Opus only)
claude --permission-mode plan # Plan mode (read-only)
claude -w my-feature          # Work in a git worktree
claude --add-dir ../other     # Add extra directory
claude --mcp-config mcp.json  # Load custom MCP config file
claude --output-format json   # JSON output (for scripts)
```

## Slash Commands (In-Session)

| Command | What it does |
|---------|-------------|
| `/help` | Show all commands |
| `/init` | Generate CLAUDE.md for this project |
| `/memory` | View/edit loaded memory and instructions |
| `/permissions` | Manage tool permissions |
| `/compact` | Compress conversation to save context |
| `/clear` | Start fresh (new conversation) |
| `/plan` | Enter plan mode |
| `/agents` | List configured sub-agents |
| `/simplify` | Review and improve recent code |
| `/batch "instruction"` | Parallel changes across files |
| `/loop 5m "prompt"` | Repeat prompt on interval |
| `/schedule` | Create cloud scheduled tasks |
| `/install-github-app` | Set up GitHub integration |
| `/debug` | Enable debug logging |
| `/rename "name"` | Rename this session |
| `/resume` | Resume another session |
| `/config` | Configure settings |
| `/add-dir` | Add directory access |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Shift+Tab` | Cycle permission modes |
| `Ctrl+C` | Interrupt Claude's current turn |
| `Ctrl+O` | Toggle verbose mode (see hooks, tools) |
| `Ctrl+T` | Toggle task list (agent teams) |
| `Shift+Down` | Cycle teammates (agent teams) |
| `/` | Open slash command autocomplete |

## Project Configuration Files

```
~/.claude/CLAUDE.md          # User-level instructions (all projects)
./CLAUDE.md                  # Project-level instructions (shared)
./.claude/CLAUDE.md          # Alternative project location
./CLAUDE.local.md            # Local-only instructions (gitignored)
./.claude/rules/*.md         # Path-specific rules
./.claude/settings.json      # Project settings (shared)
./.claude/settings.local.json # Local settings (gitignored)
./.mcp.json                  # MCP server config (project-scoped)
./.claude/skills/*/SKILL.md  # Custom skills
./.claude/agents/*.md        # Custom sub-agents
~/.claude/settings.json      # User settings
~/.claude/skills/*/SKILL.md  # Personal skills
~/.claude/agents/*.md        # Personal sub-agents
```

## Memory Hierarchy (Highest to Lowest Priority)

1. Managed Policy (org-wide, cannot override)
2. Project CLAUDE.md + `.claude/rules/`
3. User CLAUDE.md (`~/.claude/CLAUDE.md`)
4. CLAUDE.local.md (personal, gitignored)
5. Auto memory (Claude's self-written notes)

## Skill Frontmatter

```yaml
---
name: review-k8s
description: Review K8s manifests for best practices
allowed-tools:
  - Read
  - Grep
  - Glob
model: sonnet
---
```

## Hook Events

| Event | When it fires |
|-------|--------------|
| `SessionStart` | Session begins |
| `SessionEnd` | Session ends |
| `UserPromptSubmit` | User sends a message |
| `PreToolUse` | Before any tool runs |
| `PostToolUse` | After a tool succeeds |
| `PostToolUseFailure` | After a tool fails |
| `Stop` | Claude finishes responding |
| `FileChanged` | A watched file changes |
| `SubagentStart` | Sub-agent spawns |
| `SubagentStop` | Sub-agent finishes |

## Hook Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Proceed (allow) |
| `1` | Error (treated as proceed) |
| `2` | Block (prevent the action) |

## Sub-agent Frontmatter

```yaml
---
name: security-reviewer
description: Reviews code for security vulnerabilities
model: sonnet
tools:
  - Read
  - Grep
  - Glob
---
```

## GitHub Actions

```yaml
# .github/workflows/claude.yml
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Key Flags — Continued

| Flag | What it does |
|------|-------------|
| `--effort min\|low\|medium\|high\|max` | Control reasoning depth (only works with Opus). Higher effort = more thinking tokens, slower but more thorough. |
| `--permission-mode` | Set permission mode: `default`, `plan`, `acceptEdits`, `bypassPermissions` |

## Headless Mode (For Scripts)

```bash
# One-shot command
claude -p "run tests and report failures"

# JSON output for parsing
claude -p "list all TODO comments" --output-format json

# Limit iterations
claude -p "fix the linter errors" --max-turns 5

# With budget cap
claude -p "refactor auth module" --max-budget-usd 1.00
```

## Agent Teams

```bash
# Enable (experimental)
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# Start Claude — it will coordinate teammates automatically
claude "Review this project from security, performance, and code quality angles"
```

## Cost Tips

- Use `--model haiku` for simple tasks (cheapest)
- Use `--max-turns` to limit iterations in scripts
- Use `--max-budget-usd` to cap spending
- Use `/compact` to save context tokens
- Use sub-agents with `model: haiku` for fast lookups
- Check spending with `/cost` in session

</div>
</section>
