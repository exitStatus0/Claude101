---
layout: block-part
title: "Advanced Patterns & What's Next"
block_number: 13
description: "Presentation notes and speaking flow for Block 13."
part_name: "Presentation"
overview_url: /course/block-13-advanced/
presentation_url: /course/block-13-advanced/presentation/
hands_on_url: /course/block-13-advanced/hands-on/
quiz_url: /course/block-13-advanced/quiz/
permalink: /course/block-13-advanced/presentation/
locale: en
translation_key: block-13-presentation
---
> **Duration**: ~10 minutes
> **Goal**: Show students the broader Claude Code ecosystem, introduce advanced patterns they'll grow into, and send them off with a roadmap. This is the closing chapter -- make it feel complete.

---

### Slide 1: Beyond the Single Agent

Everything you've done so far has been one conversation with one Claude instance. That's powerful, but it's also single-threaded. What if you could spin up multiple Claude instances that each focus on a different aspect of a problem — and they coordinate?

That's **agent teams**.

```
You (coordinator)
     |
     ├── Agent 1: Security Reviewer
     |   "Review ai-coderrank for security vulnerabilities"
     |
     ├── Agent 2: Performance Analyst
     |   "Profile the app for performance bottlenecks"
     |
     └── Agent 3: Code Quality Auditor
         "Check code quality, patterns, and test coverage"
```

Each agent works independently, in parallel, using its own context window and tool access. They can read the same codebase simultaneously without stepping on each other. When they're done, you get three separate reports — security findings, performance issues, and code quality improvements — generated in the time it would take one agent to do one review.

> **Status**: This feature is experimental. Enable it with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. The API and behavior may change. But the concept is stable, and it's worth understanding because this is where AI-assisted development is heading.

Think of it like this: you're the tech lead in a code review meeting. Your security person, your performance person, and your code quality person each review the same PR from their angle. Agent teams are exactly that, except the reviews happen in 2 minutes instead of 2 days.

---

### Slide 2: /batch — One Change, Many Files

Every codebase has moments where you need to make the same change everywhere. Rename a config key in 30 YAML files. Add resource limits to every K8s deployment. Update an import path across the entire project. Add a license header to every source file.

Doing this manually is tedious and error-prone. Find-and-replace is dangerous for anything beyond literal strings. `/batch` is the sweet spot:

```
/batch "add CPU and memory resource limits to all K8s deployments in k8s/"
```

Claude will:
1. Find all the relevant files
2. Understand the context of each file (not just pattern-matching)
3. Make the appropriate change in each file
4. Show you a summary of all changes

The key word is **appropriate**. A batch change to "add resource limits" will produce different values for a web server vs. a database vs. a Redis cache — because Claude understands what each deployment does. That's the difference between `/batch` and `sed`.

Other `/batch` use cases for DevOps/SRE:
- Add health check probes to all deployments
- Update the base image version across all Dockerfiles
- Add standard labels to all K8s resources
- Insert a security header in all API route handlers
- Update environment variable names across all config files

---

### Slide 3: Headless Mode — Claude Without the Chat

Sometimes you don't want a conversation. You want to run Claude as part of a script, a cron job, or a CI pipeline. That's headless mode.

```bash
# Run a prompt, get the result, exit
claude -p "run all tests and report results" --output-format json

# Pipe output to another tool
claude -p "list all TODO comments in the codebase" --output-format text | sort

# Use in a CI pipeline
claude -p "review the diff in this PR for security issues" --output-format json \
  > security-report.json
```

The `-p` flag (for "prompt") sends a single prompt to Claude, gets the response, and exits. No interactive session. No back-and-forth. Just input -> processing -> output.

The `--output-format` flag controls the output:
- `text` — plain text, good for piping to other commands
- `json` — structured JSON, good for parsing in scripts
- `stream-json` — streaming JSON events, good for real-time processing

This is how you integrate Claude Code into existing automation. Your monitoring script can call `claude -p "analyze these logs for anomalies"` and process the result programmatically. Your deployment script can call `claude -p "verify the K8s manifests are valid"` as a pre-flight check. Your nightly cron job can call `claude -p "check for dependency vulnerabilities"` and email the report.

> **Key insight**: Headless mode turns Claude Code from an interactive tool into a building block. You can compose it into any workflow that accepts stdin/stdout.

---

### Slide 4: /schedule — Your Cloud Operations Team

You saw `/schedule` briefly in Block 12 for daily health checks. Let's go deeper.

`/schedule` creates cloud-based agents that run on a cron schedule. They're not running on your laptop — they run in the cloud, even when your computer is off.

```
# Daily vulnerability check
/schedule create "dependency audit" --cron "0 8 * * *" \
  --prompt "Check all dependencies for known vulnerabilities. Report any \
  critical or high severity CVEs with affected packages and remediation steps."

# Weekly infrastructure review
/schedule create "infra review" --cron "0 10 * * 1" \
  --prompt "Review the K8s cluster state. Check for pods in CrashLoopBackOff, \
  nodes with high resource utilization, certificates approaching expiration, \
  and any ArgoCD applications that are out of sync."

# Nightly test run
/schedule create "nightly tests" --cron "0 2 * * *" \
  --prompt "Pull the latest code, run the full test suite, and report any \
  failures with context about what changed since the last successful run."
```

Managing your schedules:

```
/schedule list                                    # See all scheduled tasks
/schedule show "dependency audit"                 # Check last run output
/schedule update "dependency audit" --cron "0 6 * * *"  # Change the schedule
/schedule delete "dependency audit"               # Remove a task
/schedule run "dependency audit"                  # Trigger manually right now
```

Think of `/schedule` as a team of junior SREs who work 24/7, never get bored, and always follow the checklist. They won't solve problems on their own (you'll review their reports), but they will reliably notice when something is wrong.

---

### Slide 5: The Missing 20% — Operator Commands

These are the commands that do not need their own 25-minute block, but absolutely deserve a place in your working memory:

**`/status`** — quick operational snapshot
- Current model
- Version
- Account / connectivity
- Session state

**`/doctor`** — installation and configuration diagnostics
- Broken install?
- Weird shell integration?
- Settings confusion?
- Start here before guessing

**`/context`** — see when the session is getting heavy
- Useful before long refactors
- Great when Claude starts feeling slower or less focused

**`/diff`** — inspect exactly what changed
- Current git diff
- Per-turn diffs
- Faster review loop before commit

**`/resume`** and `claude -r`
- Recover named sessions
- Pick up long-running work cleanly

**`/remote-control`**
- Turn the current local session into a phone/browser-accessible session at claude.ai
- Perfect for monitoring rollouts away from your laptop

**`/skills`, `/mcp`, `/hooks`, `/plugin`**
- These are your "what is actually loaded here?" and "what can I extend?" commands
- They matter once your setup gets more sophisticated

> "If Blocks 0 through 12 taught you the main workflows, this slide gives you the operator panel. These are the commands that save time when something feels off, when you need to recover a session, or when you want to understand what Claude can do right now on this machine."

---

### Slide 6: The Full Ecosystem

Claude Code isn't just a CLI. It's an ecosystem that's growing fast. Here's the landscape:

**Claude Code CLI** (what you've been using)
- Terminal-based, fully featured
- Best for: development, infrastructure, scripting, power users
- Works over SSH, in tmux, on remote servers

**Desktop App**
- Visual interface with side-by-side diffs
- Multiple parallel sessions in tabs
- File tree visualization
- Best for: visual learners, code review, complex refactoring where you want to see the full picture

**VS Code Extension**
- Claude Code integrated directly into your editor
- Inline suggestions, chat panel, terminal integration
- Best for: developers who live in VS Code and don't want to switch contexts

**JetBrains Extension**
- Same capabilities as VS Code extension, for IntelliJ/WebStorm/PyCharm users
- Best for: Java/Kotlin/Python developers on JetBrains IDEs

**Web-based Claude Code** (claude.ai/code)
- Full Claude Code experience in a browser
- Built-in virtual machine — runs code, installs packages, starts servers
- Best for: quick sessions, using someone else's computer, Chromebook users, demoing to others

**Plugins**
- Package and distribute skills, hooks, and agent configurations
- Share your team's tooling as an installable plugin
- Best for: teams that want to standardize Claude Code workflows across projects

---

### Slide 7: Where to Go From Here

You've completed Claude Code 101. Here's your roadmap for what comes next:

**Immediate next steps** (this week):
- Use Claude Code on a real task at work. Not a tutorial. A real PR, a real debugging session, a real infrastructure change.
- Set up project memory (`.claude/CLAUDE.md`) for your work projects
- Create 2-3 skills for tasks you repeat regularly

**Short-term growth** (next month):
- Integrate headless mode into one of your CI pipelines
- Set up `/schedule` for daily operational checks on a real system
- Try agent teams on a complex code review
- Explore the Desktop app for visual workflows

**Long-term mastery** (next quarter):
- Build and share a plugin with your team's operational playbooks
- Contribute to the Claude Code community (skills, hooks, patterns)
- Teach a colleague — the best way to learn is to explain

**Resources**:
- Official docs: [docs.anthropic.com/claude-code](https://docs.anthropic.com/en/docs/claude-code)
- GitHub: github.com/anthropics/claude-code
- Community Discord / forums for sharing skills and patterns
- This course's repo — revisit any block when you need a refresher

---

### Slide 8: What You've Built

Let's take a final look at the complete system you built in this course:

```
Block 0:  Installed Claude Code, first conversation
Block 1:  Explored ai-coderrank, generated CLAUDE.md
Block 2:  Ran tests, Docker builds, handled errors
Block 3:  Planned the dark theme with ADR and diagrams
Block 4:  Implemented the dark theme through conversation
Block 5:  Set up memory and project rules
Block 6:  Created reusable skills for K8s review and Docker audit
Block 7:  Provisioned a DigitalOcean droplet, installed k3s
Block 8:  Automated workflows with hooks
Block 9:  Connected external tools via MCP
Block 10: Set up CI/CD with GitHub Actions
Block 11: Built specialized sub-agents
Block 12: GitOps with ArgoCD — app live on the internet
Block 13: Advanced patterns and the ecosystem
```

That's not a tutorial progression. That's a professional DevOps workflow. You've used the same tools, the same patterns, and the same architecture that teams at companies of all sizes use in production every day.

The difference between you today and you 13 blocks ago isn't just that you know Claude Code. It's that you know how to work with an AI agent as a genuine collaborator — one that reads your code, understands your infrastructure, follows your rules, and helps you ship faster without cutting corners.
