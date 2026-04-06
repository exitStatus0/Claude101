---
layout: block-part
title: "Advanced Patterns & What's Next"
block_number: 13
description: "Hands-on implementation steps for Block 13."
time: "~15 minutes"
part_name: "Hands-On"
overview_url: /course/block-13-advanced/
presentation_url: /course/block-13-advanced/presentation/
hands_on_url: /course/block-13-advanced/hands-on/
quiz_url: /course/block-13-advanced/quiz/
permalink: /course/block-13-advanced/hands-on/
locale: en
translation_key: block-13-hands-on
---
> **Direct speech:** "Everything on this hands-on page is built so you can follow me line by line. When you see a command or prompt block, you can copy it directly into your terminal or Claude session unless I explicitly tell you it is just reference material. As we go, compare your result with mine on screen so you can catch mistakes early instead of stacking them up."

> **Duration**: ~15 minutes
> **Outcome**: Hands-on experience with agent teams, `/batch` across K8s manifests, headless mode for scripting, and a scheduled vulnerability check -- plus a full retrospective of the course.
> **Prerequisites**: Completed Blocks 0-12 (everything deployed, GitOps working), a working Claude Code installation with authenticated sessions

---

### Step 1: Enable and Use Agent Teams (~5 min)

> **Experimental feature**: Agent teams are experimental as of April 2026. The API, environment variable, and behavior may change in future releases. What you learn here is the concept and pattern -- the specific flags may evolve.

Agent teams let you spin up multiple Claude instances that work in parallel on different aspects of the same task. This is experimental -- the API may change -- but the concept is powerful and worth experiencing.

Enable the feature:

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

Start Claude Code:

```bash
cd ~/ai-coderrank
claude
```

Now create a team to review ai-coderrank from three different angles simultaneously:

```text
Create an agent team to review the ai-coderrank project from 3 perspectives:

Team member 1 — Security Reviewer:
Review the codebase for security vulnerabilities. Check for XSS, injection risks,
exposed secrets, insecure dependencies, and missing authentication/authorization.
Focus on the API routes and data handling.

Team member 2 — Performance Analyst:
Review the codebase for performance issues. Check for N+1 queries, missing caching,
large bundle sizes, unoptimized images, unnecessary re-renders in React components,
and slow API endpoints.

Team member 3 — Code Quality Auditor:
Review the codebase for code quality. Check for dead code, inconsistent patterns,
missing error handling, insufficient test coverage, unclear naming, and violations
of the project conventions in CLAUDE.md.
```

Watch the three agents spin up and work in parallel. Each one reads the codebase independently and focuses on its assigned domain. This is what coordination looks like — three specialized reviews, happening simultaneously, in the time one would take.

When they finish, you'll have three separate reports. Read through them. You'll likely find:
- Security issues you hadn't considered (exposed environment variables, missing input validation)
- Performance bottlenecks you didn't notice (component re-renders, unoptimized queries)
- Code quality improvements you've been meaning to make (dead code, inconsistent patterns)

> **When to use agent teams in real work**: Complex code reviews before a major release. Architecture audits. Migration planning where security, performance, and compatibility all need separate analysis. Any task where multiple perspectives are more valuable than one deep dive.

---

### Step 2: /batch — Parallel Changes Across Files (~3 min)

Time to see `/batch` in action. A common DevOps task: add resource limits to all Kubernetes deployments.

In your Claude Code session:

```text
/batch "add CPU and memory resource limits to all K8s deployments in k8s/. Use
sensible defaults: 100m CPU request, 250m CPU limit, 128Mi memory request,
256Mi memory limit. If limits already exist, leave them unchanged."
```

Claude will:
1. Find all deployment manifests in `k8s/`
2. Read each one to understand the workload
3. Add resource limits where missing
4. Skip files that already have limits
5. Show you a summary of all changes

Review the diff. Notice that Claude doesn't just paste the same block everywhere — it understands context. A web server might get different limits than a background worker.

Other `/batch` operations worth trying:

```text
/batch "add readiness and liveness probes to all deployments in k8s/ that don't
have them. Use HTTP GET on /health for the web service and TCP checks for others."
```

```text
/batch "add the label team: platform to all K8s resources in k8s/"
```

```text
/batch "ensure all container images in k8s/ use a specific tag, not latest"
```

> **The difference from find-and-replace**: `/batch` understands YAML structure, knows what a K8s deployment looks like, and makes contextually appropriate changes. It won't break your indentation, won't add limits inside a Service spec, and won't duplicate a probe that already exists.

---

### Step 3: Headless Mode — Claude as a Script (~3 min)

Headless mode strips away the interactive conversation and turns Claude Code into a command you can call from scripts, cron jobs, and CI pipelines. The key flags:

- **`-p "prompt"`** -- print mode (non-interactive, one-shot, exits when done)
- **`--output-format json`** -- machine-readable JSON output
- **`--output-format text`** -- plain text output (no ANSI formatting)
- **`--max-turns N`** -- limit the number of tool-use turns
- **`--max-budget-usd N`** -- cap the cost of the session

Try it in your terminal (not inside Claude Code -- in a regular shell):

```bash
# Run all tests and get a JSON report
claude -p "run the test suite for ai-coderrank and report the results: total tests,
passed, failed, and any failure details" --output-format json
```

The output is machine-readable JSON. You can parse it with `jq`, pipe it to another script, or save it to a file.

More headless examples:

```bash
# Quick codebase question — no session needed
claude -p "what version of Next.js does ai-coderrank use?" --output-format text

# Pre-commit validation
claude -p "check if the K8s manifests in k8s/ are valid YAML and reference
existing Docker images" --output-format json > validation-report.json

# Generate a changelog from recent commits
claude -p "read the last 10 git commits and generate a changelog entry in
Keep a Changelog format" --output-format text >> CHANGELOG.md
```

The real power shows up in scripts:

```bash
#!/bin/bash
# pre-deploy-check.sh — run before every deployment

echo "Running pre-deployment checks..."

RESULT=$(claude -p "verify that all K8s manifests in k8s/ are valid, all
container images exist, and no secrets are hardcoded. Return a JSON object
with {valid: boolean, issues: string[]}" --output-format json)

VALID=$(echo "$RESULT" | jq -r '.valid')

if [ "$VALID" != "true" ]; then
  echo "Pre-deployment checks failed:"
  echo "$RESULT" | jq -r '.issues[]'
  exit 1
fi

echo "All checks passed. Proceeding with deployment."
```

> **Key mental model**: Interactive Claude Code is for exploratory work — investigating, planning, implementing. Headless mode is for automated work — checks, reports, validations that run without human interaction. Same intelligence, different interface.

---

### Step 4: Scheduled Cloud Task — Deeper Dive (~2 min)

In Block 12, you set up a basic health check. Let's create something more sophisticated — a daily dependency vulnerability audit:

The `/schedule` command creates cloud-based scheduled agents (also called triggers). The syntax is:

```text
/schedule create "name" --cron "cron-expression" --prompt "what to do"
```

Let's create a daily vulnerability audit:

```text
/schedule create "dependency vulnerability scan" --cron "0 7 * * *" \
  --prompt "Run a comprehensive dependency audit for ai-coderrank:
  1. Check package.json for any packages with known CVEs
  2. Look for outdated dependencies that are more than 2 major versions behind
  3. Check if any dependencies have been deprecated or archived
  4. Review the Dockerfile base image for known vulnerabilities
  5. Produce a report with: critical findings (act now), warnings (plan to fix),
     and informational notes (nice to know).
  Format the report as markdown."
```

Check your existing schedules:

```text
/schedule list
```

You should see both the health check from Block 12 and this new vulnerability scan. Two automated agents, running daily, keeping an eye on your infrastructure and dependencies while you focus on building features.

Trigger a manual run to verify it works:

```text
/schedule run "dependency vulnerability scan"
```

Review the output. This is the kind of report that most teams only generate when something breaks. You're generating it proactively, every single morning.

---

### Step 5: Quick Command Sweep — The Missing 20% (~2 min)

These are high-value commands that do not need their own full block, but absolutely belong in your day-to-day toolkit.

Inside your current Claude Code session, run:

```text
/status
/context
/diff
/skills
/mcp
/hooks
/model
```

What to notice:

- `/status` shows the current model, version, account, and connectivity state
- `/context` helps you see when the session is getting heavy
- `/diff` is the fast way to inspect what changed before you commit
- `/skills`, `/mcp`, and `/hooks` tell you what extension layers are active
- `/model` lets you inspect or change the current model without restarting the session

Now, in a regular shell, try the CLI-side management commands:

```bash
claude auth status --text
claude agents
claude update
```

And if you want to hand this exact session to your phone or browser, use:

```text
/remote-control ai-coderrank-ops
```

You do not need to keep every one of these in muscle memory today. The point is to know they exist, know what category of problem they solve, and know where to reach when you need them.

---

### Step 6: A Quick Tour of the Ecosystem (~1 min)

You don't need to try all of these today — just know they exist:

**Desktop app** — If available, open it and connect it to the ai-coderrank project. Notice:
- Side-by-side file diffs when Claude makes changes
- Visual file tree showing which files have been modified
- Multiple parallel sessions in tabs (like having several terminals open, but visual)

**VS Code / JetBrains** — If you use either IDE, the extension puts Claude Code directly in your editor. You can select code, right-click, and say "explain this" or "refactor this" without leaving the file.

**Web-based Claude Code** (claude.ai/code) — Opens a full development environment in your browser. Comes with a virtual machine that can run code, install packages, and start servers. Perfect for quick sessions when you're away from your main machine.

**Plugins** — Package your skills, hooks, and agent configurations for distribution. If you've built useful tools during this course (the `/review-k8s` skill, the pre-commit hook, the sub-agents), you can bundle them into a plugin that your team installs with one command.

---

### Step 7: Course Wrap-Up (~1 min)

Let's look at what you've accomplished. In the ai-coderrank project, run:

```text
Summarize everything that's been built and configured in this project. List:
1. All custom skills in .claude/skills/
2. All memory files in .claude/
3. Any hooks configured in .claude/settings.json
4. The CI/CD pipeline in .github/workflows/
5. The ArgoCD configuration in argocd/
6. The K8s manifests in k8s/
7. The current deployment status (ArgoCD sync status, pod health)

Then give me a one-paragraph summary of the complete system.
```

Read Claude's summary. That's your system. All of it built through conversation, deployed through GitOps, monitored through automation.

---

### What You've Learned

Not just the tools — the patterns:

| Pattern | What you learned | Where you used it |
|---------|-----------------|------------------|
| Exploration before action | Read and understand before changing | Blocks 1-3 |
| Iterative refinement | Small changes, verify, adjust | Block 4 |
| Institutional memory | Encode knowledge so it persists | Block 5 |
| Reusable workflows | Skills turn expertise into commands | Block 6 |
| Infrastructure as conversation | Claude guides complex server setup | Block 7 |
| Automation at lifecycle events | Hooks trigger on actions | Block 8 |
| External tool integration | MCP connects to services | Block 9 |
| CI/CD as code | GitHub Actions automate the pipeline | Block 10 |
| Specialized delegation | Sub-agents focus on specific domains | Block 11 |
| GitOps delivery | Git is the single source of truth | Block 12 |
| Parallel and automated AI | Teams, batch, headless, scheduled | Block 13 |

These patterns transfer. They work with any codebase, any infrastructure, any team. The specific commands will evolve as Claude Code updates, but the patterns are durable.

---

### Your Next Moves

**Tomorrow**: Use Claude Code on real work. Pick a task you'd normally spend an hour on. See how it goes.

**This week**: Set up `.claude/CLAUDE.md` in your most-used project at work. Add one rule file and one skill.

**This month**: Integrate headless mode into one CI pipeline. Set up one `/schedule` task for something your team currently checks manually.

**Always**: Be the person on your team who knows these tools. Not because AI is magic — it's not — but because knowing how to collaborate with an AI agent is a skill multiplier. You're not 10x faster. You're the same engineer, with a tireless partner who remembers everything, never gets impatient, and can read 10,000 lines of code in seconds.

Use that partnership well.

---

### Thank You

You did the work. Thirteen blocks. Dozens of commands. A live application on the internet.

The next time someone asks "What can AI tools actually do for DevOps?" — you don't need to speculate. You can show them. Open a terminal, type `claude`, and demonstrate.

That's the best answer there is.

---

<div class="cta-block">
  <p>Ready to check your retention?</p>
  <a href="{{ '/course/block-13-advanced/quiz/' | relative_url }}" class="hero-cta">Take the Quiz &rarr;</a>
</div>

<div class="cta-block" style="margin-top: var(--space-lg);">
  <p>Completed the whole course? Take the final cumulative quiz.</p>
  <a href="{{ '/course/final-quiz/' | relative_url }}" class="hero-cta">Final Quiz &rarr;</a>
</div>
