# Claude Code 101

A hands-on course teaching DevOps, SRE, QA, and developers to use Claude Code in daily workflows.

**Live site**: [exitstatus0.github.io/Claude101](https://exitstatus0.github.io/Claude101)

## What This Is

14 progressive blocks that take you from your first `claude` command to deploying a real application on Kubernetes via GitOps. Each block has a presentation (talking points) and a practical (step-by-step screen-sharing guide).

The course uses [ai-coderrank](https://github.com/exitStatus0/ai-coderrank) as the real-world project. By the end, you'll have deployed a modified version (dark theme) to a k3s cluster on DigitalOcean, accessible via public internet.

## Course Blocks

| # | Block | Key Features |
|---|-------|-------------|
| 00 | Welcome & Setup | Installation, auth, `/help` |
| 01 | Understanding Your Codebase | `/init`, CLAUDE.md |
| 02 | Running & Testing Locally | Bash tool, permissions |
| 03 | Planning with ADRs & Diagrams | Plan mode, Mermaid |
| 04 | Making Changes — Dark Theme | Edit/Write, git |
| 05 | Memory & Project Intelligence | `.claude/rules/`, auto memory |
| 06 | Custom Skills | Skills, `$ARGUMENTS`, `/simplify` |
| 07 | Infrastructure — k3s on DO | k3s, DigitalOcean |
| 08 | Hooks — Workflow Automation | Hooks, `settings.json` |
| 09 | MCP Servers | MCP, external tools |
| 10 | GitHub Actions & CI/CD | `@claude`, Actions |
| 11 | Sub-agents | `/agents`, worktrees |
| 12 | GitOps Finale — ArgoCD | ArgoCD, `/schedule` |
| 13 | Advanced Patterns | Agent teams, `/batch`, plugins |

## Local Development

```bash
# Install Jekyll dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Open in browser
open http://localhost:4000/Claude101/
```

## Cost

- Claude Pro: $20/month
- DigitalOcean droplet: ~$24/month (free with new account credit)
- Total for the course: ~$25-45

## License

MIT
