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
| 1 | Official install paths are native installer (`curl -fsSL https://claude.ai/install.sh \| bash`), Homebrew, and WinGet | block-00 hands-on.md, cheatsheet | code.claude.com/docs/en/overview | 2026-04-06 | correct |
| 2 | Pro subscription $20/mo includes Claude Code (Sonnet + Haiku, metered) | index.html, cost-guide | anthropic.com/claude-code, support.anthropic.com | 2026-04-06 | correct |
| 3 | Claude Opus, Sonnet, and Haiku are available models (specific versions may change) | cheatsheet, block-00 index.md, cost-guide | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 4 | `/init` generates CLAUDE.md for the project | block-01 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 5 | Permission modes include `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, and `bypassPermissions` | cheatsheet | code.claude.com/docs/en/cli-reference | 2026-04-06 | correct |
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
| 17 | DO 4 GiB / 2 vCPU basic droplet is $24/mo | cost-guide, block-07 index.md | digitalocean.com/pricing/droplets | 2026-04-06 | correct |
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
| 40 | Claude Sonnet API pricing: ~$3/MTok input, ~$15/MTok output | cost-guide | docs.anthropic.com/en/docs/about-claude/pricing | 2026-04-06 | correct |
| 41 | Claude Opus API pricing: ~$15/MTok input, ~$75/MTok output | cost-guide | docs.anthropic.com/en/docs/about-claude/pricing | 2026-04-06 | correct |
| 42 | Claude Haiku API pricing: ~$0.80/MTok input, ~$4/MTok output | cost-guide | docs.anthropic.com/en/docs/about-claude/pricing | 2026-04-06 | correct |
| 43 | Max plan offers higher limits; Team CC access depends on seat type (deferred to anthropic.com/pricing) | cost-guide | claude.ai/pricing, support.anthropic.com | 2026-04-06 | correct |
| 44 | DigitalOcean offers $200 in credit for new accounts for 60 days | cost-guide | digitalocean.com/pricing, docs.digitalocean.com/platform/teams/how-to/refer-others | 2026-04-06 | correct |
| 45 | Pro plan gives metered Claude Code access (shared with Claude chat, not unlimited) | cost-guide | claude.ai/pricing, support.anthropic.com | 2026-04-06 | correct |
| 46 | Block 10 GitHub Actions requires separate Anthropic API key (not Pro) | cost-guide, block-10 index.md | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 47 | Claude Sonnet is the default model in Claude Code | cost-guide, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 48 | `Shift+Tab` cycles permission modes in-session | cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 49 | `Ctrl+O` toggles verbose mode | cheatsheet | code.claude.com/docs/en/interactive-mode | 2026-04-06 | correct |
| 50 | GitHub MCP server package is `@modelcontextprotocol/server-github` | block-09 index.md | github.com/modelcontextprotocol/servers, npmjs.com/package/@modelcontextprotocol/server-github | 2026-04-06 | correct |
| 51 | ai-coderrank project is a Next.js application | block-00 index.md | github.com/exitStatus0/ai-coderrank | course choice | correct |
| 52 | Ubuntu 22.04 (ubuntu-22-04-x64) as droplet image | block-07 index.md | digitalocean.com/docs | course choice | correct |
| 53 | ArgoCD admin password from `argocd-initial-admin-secret` | block-12 index.md | argoproj.github.io/argo-cd | 2026-04-06 | correct |
| 54 | `.claude/settings.json` for project settings (permissions, hooks) | block-08 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 55 | `CLAUDE.local.md` is gitignored by convention | block-05 index.md, cheatsheet | docs.anthropic.com/en/docs/claude-code | 2026-04-06 | correct |
| 56 | Course block count is 14 (blocks 00 through 13) | index.html, course index | course choice | -- | course choice |
| 57 | Default deployment path is NodePort 30080 on droplet public IP | index.html, block-12 index.md, course-contract | course choice | 2026-04-06 | correct |
| 58 | Each block has `index.md` overview plus `presentation.md` and `hands-on.md` | all block dirs, CLAUDE.md, prompt-v2, publish-checklist | repo structure | 2026-04-06 | correct |
| 59 | `/remote-control` continues the current session remotely; `claude --remote-control` starts an interactive session with Remote Control enabled | block-12 hands-on.md, block-13 hands-on.md, cheatsheet | code.claude.com/docs/en/remote-control, code.claude.com/docs/en/cli-reference | 2026-04-06 | correct |
| 60 | `/status` shows version, model, account, and connectivity information | block-13 hands-on.md, cheatsheet | code.claude.com/docs/en/commands | 2026-04-06 | correct |
| 61 | `/doctor` diagnoses installation and settings issues | block-13 hands-on.md, cheatsheet | code.claude.com/docs/en/commands | 2026-04-06 | correct |
| 62 | `/diff` opens an interactive diff viewer for current and per-turn changes | block-13 hands-on.md, cheatsheet | code.claude.com/docs/en/commands | 2026-04-06 | correct |
| 63 | `/context` visualizes current context usage and capacity warnings | block-13 hands-on.md, cheatsheet | code.claude.com/docs/en/commands | 2026-04-06 | correct |
| 64 | `/model` changes the model and `/effort` adjusts reasoning depth | block-13 hands-on.md, cheatsheet | code.claude.com/docs/en/commands | 2026-04-06 | correct |
| 65 | `/skills`, `/mcp`, `/hooks`, and `/plugin` expose the extension and integration layers from within Claude Code | block-13 hands-on.md, cheatsheet | code.claude.com/docs/en/commands | 2026-04-06 | correct |

---

## Verification Summary

- **Verified correct**: 65 / 65 (100%)
- **Needs verification**: 0 rows
- The matrix is fully green as of 2026-04-06. Pricing and promo rows remain the most volatile and should still be re-verified on the review cadence below.

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
