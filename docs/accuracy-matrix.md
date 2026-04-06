# Accuracy Matrix — Claude Code 101

Track every factual claim in the course. Every row must be verified before publish.

**Legend**:
- **correct** — verified against source, accurate as of the date shown
- **needs fix** — verified and found to be inaccurate, must be corrected
- **needs verification** — not yet checked against the source
- **course choice** — not a product fact; a deliberate decision for the course

Last full review: 2026-04-06

---

| # | Claim | Location | Source | Verified | Status |
|---|-------|----------|--------|----------|--------|
| 1 | Install via `npm install -g @anthropic-ai/claude-code` | block-00 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-05 | correct |
| 2 | Pro subscription $20/mo includes Claude Code (Sonnet + Haiku, metered) | index.html, cost-guide | anthropic.com/claude-code, support.anthropic.com | 2026-04-06 | correct |
| 3 | Claude Opus, Sonnet, and Haiku are available models (specific versions may change) | cheatsheet, block-00 index.md, cost-guide | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 4 | `/init` generates CLAUDE.md for the project | block-01 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 5 | Permission modes: default, plan, acceptEdits, bypassPermissions | cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 6 | Hook events: PreToolUse, PostToolUse, SessionStart, SessionEnd, Stop, UserPromptSubmit, PostToolUseFailure, FileChanged, SubagentStart, SubagentStop | cheatsheet, block-08 index.md | docs.anthropic.com/en/docs/claude-code/hooks | 2026-04-06 | correct |
| 7 | `anthropics/claude-code-action@v1` is the official GitHub Action | block-10 index.md, cheatsheet | github.com/anthropics/claude-code-action | 2026-04-06 | correct |
| 8 | Agent teams require `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` | block-13 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 9 | MCP project config lives in `.mcp.json`, user config in `~/.claude.json` | block-09 index.md, cheatsheet, troubleshooting | code.claude.com/docs/en/mcp | 2026-04-06 | correct |
| 10 | `claude mcp add` is the preferred MCP setup method | block-09 index.md, cheatsheet | code.claude.com/docs/en/mcp | 2026-04-06 | correct |
| 11 | `/schedule` creates cloud scheduled tasks | block-12 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 12 | `/loop 5m "prompt"` repeats a prompt on interval | block-12 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 13 | Sub-agent frontmatter fields: name, description, model, tools/allowed-tools | block-11 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code/sub-agents | 2026-04-06 | correct |
| 14 | Skills frontmatter fields: name, description, allowed-tools, model | block-06 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code/skills | 2026-04-06 | correct |
| 15 | k3s install via `curl -sfL https://get.k3s.io \| sh -` | block-07 index.md | k3s.io | course choice | correct |
| 16 | ArgoCD install from `argoproj/argo-cd/stable/manifests/install.yaml` | block-12 index.md | argoproj.github.io/argo-cd | course choice | correct |
| 17 | DO s-2vcpu-4gb droplet at $24/mo | cost-guide, block-07 index.md | digitalocean.com/pricing | needs verification | needs verification |
| 18 | `claude update` updates to the latest version | cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 19 | `claude -p` runs in print/non-interactive mode | cheatsheet, block-13 index.md | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 20 | `claude -c` continues last conversation | cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 21 | `claude -r "name"` resumes a named session | cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 22 | `--model opus` / `--model haiku` flag selects model | cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 23 | `--effort max` enables maximum reasoning (Opus only) | cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 24 | `-w` flag works in a git worktree | cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 25 | `--output-format json` produces JSON output | cheatsheet, block-13 index.md | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 26 | `--max-turns N` limits iterations in headless mode | cheatsheet, cost-guide | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 27 | `--max-budget-usd N` caps spending per session | cheatsheet, cost-guide | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 28 | Memory hierarchy: Managed Policy > Project CLAUDE.md > User CLAUDE.md > CLAUDE.local.md > Auto memory | cheatsheet, block-05 index.md | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 29 | `~/.claude/CLAUDE.md` is the user-level instruction file | block-05 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 30 | `.claude/rules/*.md` for path-specific rules | cheatsheet, block-05 index.md | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 31 | `/compact` compresses conversation to save context | cheatsheet, cost-guide | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 32 | `/cost` shows token usage for the session | block-00 index.md, cost-guide | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 33 | Hook exit code 0 = proceed, 2 = block | cheatsheet, block-08 index.md | docs.anthropic.com/en/docs/claude-code/hooks | 2026-04-06 | correct |
| 34 | Hooks receive tool context as JSON on stdin (file path via `tool_input.file_path`); env vars: `$CLAUDE_PROJECT_DIR`, `$CLAUDE_ENV_FILE` | block-08 index.md | docs.anthropic.com/en/docs/claude-code/hooks | 2026-04-06 | correct |
| 35 | `/batch "instruction"` runs parallel changes across files | block-13 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 36 | `/install-github-app` sets up the GitHub integration | block-10 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 37 | Skills live in `.claude/skills/*/SKILL.md` | block-06 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code/skills | 2026-04-06 | correct |
| 38 | Sub-agents live in `.claude/agents/*.md` | block-11 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code/sub-agents | 2026-04-06 | correct |
| 39 | `/agents` lists configured sub-agents | cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 40 | Claude Sonnet API pricing: ~$3/MTok input, ~$15/MTok output | cost-guide | anthropic.com/pricing | needs verification | needs verification |
| 41 | Claude Opus API pricing: ~$15/MTok input, ~$75/MTok output | cost-guide | anthropic.com/pricing | needs verification | needs verification |
| 42 | Claude Haiku API pricing: ~$0.80/MTok input, ~$4/MTok output | cost-guide | anthropic.com/pricing | needs verification | needs verification |
| 43 | Max plan offers higher limits; Team CC access depends on seat type (deferred to anthropic.com/pricing) | cost-guide | claude.ai/pricing, support.anthropic.com | 2026-04-06 | correct |
| 44 | DigitalOcean $200 free credit for new accounts (60 days) | cost-guide | digitalocean.com/pricing | needs verification | needs verification |
| 45 | Pro plan gives metered Claude Code access (shared with Claude chat, not unlimited) | cost-guide | claude.ai/pricing, support.anthropic.com | 2026-04-06 | correct |
| 46 | Block 10 GitHub Actions requires separate Anthropic API key (not Pro) | cost-guide, block-10 index.md | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 47 | Claude Sonnet is the default model in Claude Code | cost-guide, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 48 | `Shift+Tab` cycles permission modes in-session | cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 49 | `Ctrl+O` toggles verbose mode | cheatsheet | docs.anthropic.com/en/docs/claude-code | needs verification | needs verification |
| 50 | GitHub MCP server package is `@modelcontextprotocol/server-github` | block-09 index.md | github.com/modelcontextprotocol/servers | needs verification | needs verification |
| 51 | ai-coderrank project is a Next.js application | block-00 index.md | github.com/exitStatus0/ai-coderrank | course choice | correct |
| 52 | Ubuntu 22.04 (ubuntu-22-04-x64) as droplet image | block-07 index.md | digitalocean.com/docs | course choice | correct |
| 53 | ArgoCD admin password from `argocd-initial-admin-secret` | block-12 index.md | argoproj.github.io/argo-cd | 2026-04-06 | correct |
| 54 | `.claude/settings.json` for project settings (permissions, hooks) | block-08 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 55 | `CLAUDE.local.md` is gitignored by convention | block-05 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 56 | Course block count is 14 (blocks 00 through 13) | index.html, course index | course choice | -- | course choice |
| 57 | Default deployment path is NodePort 30080 on droplet public IP | index.html, block-12 index.md, course-contract | course choice | 2026-04-06 | correct |
| 58 | Each block is a single index.md with Part 1: Presentation and Part 2: Hands-On sections | all block dirs, CLAUDE.md, prompt-v2, publish-checklist | repo structure | 2026-04-06 | correct |

---

## Verification Summary

- **Verified correct**: 51 / 58 (88%)
- **Needs verification**: 7 rows (#17, #40-42, #44, #49-50)
- Remaining unverified rows are: API token pricing (#40-42), DO droplet pricing (#17), DO free credit (#44), `Ctrl+O` shortcut (#49), and GitHub MCP server package name (#50). These require checking live pages or specific doc sections.
- These remaining rows require checking live pricing pages and specific env var docs — they cannot be verified from code alone

## How to verify a row

1. Open the **Source** URL
2. Search for the specific claim
3. If confirmed, set **Verified** to today's date and **Status** to `correct`
4. If the claim is wrong, set **Status** to `needs fix` and open an issue or fix immediately
5. If the source page no longer exists or the claim cannot be found, flag as `needs fix` and investigate

## Review cadence

- Full matrix review before every publish
- Spot check any row older than 30 days
- Re-verify all pricing rows monthly
