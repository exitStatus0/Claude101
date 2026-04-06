---
layout: block-part
title: "Custom Skills — Your Team's Playbook"
block_number: 6
description: "Presentation notes and speaking flow for Block 06."
part_name: "Presentation"
overview_url: /course/block-06-skills/
presentation_url: /course/block-06-skills/presentation/
hands_on_url: /course/block-06-skills/hands-on/
permalink: /course/block-06-skills/presentation/
locale: en
translation_key: block-06-presentation
---
> **Duration**: ~8 minutes
> **Goal**: Students understand what skills are, how they're structured, and why they're a game-changer for team consistency.

---

### Slide 1: Shell Aliases for AI

You know shell aliases, right?

```bash
alias k="kubectl"
alias gs="git status"
alias deploy="./scripts/deploy.sh --env staging --notify slack"
```

One short command that expands into something longer and more complex. Skills are the same idea, but for AI workflows.

```
/review-k8s     →  Read all K8s manifests, check against best practices,
                    report issues with severity and fix suggestions

/check-docker   →  Audit the Dockerfile for security, performance,
                    and build optimization issues

/explain app.ts →  Read the file, explain what it does in plain English,
                    note any non-obvious patterns
```

The difference? Shell aliases run commands. Skills run _thinking_. They give Claude a structured set of instructions, optional constraints, and let it apply its reasoning to your specific codebase.

---

### Slide 2: Anatomy of a Skill

Every skill lives in `.claude/skills/<skill-name>/SKILL.md`. Here's the structure:

```
.claude/
  skills/
    review-k8s/
      SKILL.md          ← This is the skill definition
    check-docker/
      SKILL.md
    explain/
      SKILL.md
```

And here's what a SKILL.md looks like inside:

```markdown
---
name: review-k8s
description: Reviews Kubernetes manifests for best practices and security issues
allowed-tools:
  - Read
  - Glob
  - Grep
---

You are a Kubernetes security and best-practices reviewer.

Read all YAML files in the k8s/ directory. For each manifest, check:
1. Resource limits are set (cpu and memory)
2. Security context is configured (non-root, read-only root filesystem)
3. Health checks are present (liveness, readiness)
...

Output a report with: file name, issue, severity, suggested fix.
```

Three parts:
1. **Frontmatter** — name, description, and optional tool restrictions
2. **Instructions** — what Claude should do when the skill is invoked
3. **That's it.** No build step, no compilation, no registration. Drop the file in and it works.

---

### Slide 3: The `$ARGUMENTS` Variable

Some skills need input. "Explain _this_ file." "Review _this_ PR." "Generate tests for _this_ component."

That's what `$ARGUMENTS` does. It's a placeholder in your skill instructions that gets replaced with whatever the user types after the slash command.

```markdown
---
name: explain
description: Explains any file in plain English
---

Read the file at $ARGUMENTS.

Explain what this file does in plain, jargon-free English. Structure:
1. **Purpose**: One sentence — what problem does this file solve?
2. **How it works**: Walk through the logic step by step
3. **Key patterns**: Note any design patterns or non-obvious techniques
4. **Dependencies**: What does this file rely on?
```

Usage:

```
/explain src/app/api/models/route.ts
/explain k8s/deployment.yaml
/explain Dockerfile
```

The `$ARGUMENTS` gets replaced with whatever follows the command. Simple, flexible, powerful.

> **Tip**: You can reference `$ARGUMENTS` multiple times in the same skill. For example, a skill that reads a file AND its tests: "Read `$ARGUMENTS` and look for a corresponding test file."

---

### Slide 4: Built-in Skills

Claude Code ships with some skills out of the box. The one we'll use today:

**`/simplify`** — Reviews your changed code and looks for:
- Opportunities to reuse existing utilities instead of reimplementing
- Code quality improvements
- Performance optimizations
- Then automatically fixes what it finds

This is perfect for running after a big feature implementation (like our dark theme from Block 4). You write the code to make it work, then `/simplify` makes it clean.

Other useful built-in skills:
- **`/batch`** — Makes the same change across many files (rename a variable everywhere, update an import path, change a pattern)
- **`/debug`** — Activates a troubleshooting mode with enhanced diagnostic output

---

### Slide 5: `allowed-tools` — The Safety Net

Here's where skills get interesting from a safety perspective.

By default, a skill can use any tool Claude has access to — read files, write files, run commands, the works. But sometimes you want a skill to be **read-only**. A review skill shouldn't modify anything. An explanation skill shouldn't create files.

That's what `allowed-tools` does:

```yaml
---
name: review-k8s
allowed-tools:
  - Read
  - Glob
  - Grep
---
```

This skill can read files, search for patterns, and list files — but it **cannot** write, edit, or execute commands. It's physically unable to make changes. This is great for:

- **Review skills** — look but don't touch
- **Audit skills** — report problems but let the human decide the fix
- **Explanation skills** — read and explain, nothing else

Compare that to an unrestricted skill:

```yaml
---
name: fix-k8s
# No allowed-tools = unrestricted
---
```

This skill can make changes, run kubectl, modify files — the full toolkit. Use this for skills that need to _do_ things, not just report.

> **Rule of thumb**: If a skill's purpose is to _tell you something_, restrict its tools. If its purpose is to _do something_, leave it unrestricted.

---

### Slide 6: Project vs. User Skills

Just like memory, skills come in two flavors:

**Project skills** (`.claude/skills/` inside your repo):
- Committed to git, shared with the whole team
- Anyone who clones the repo gets the skills
- Great for team playbooks and project-specific workflows

**User skills** (`~/.claude/skills/`):
- Personal skills that follow you across projects
- Your custom productivity tools
- Things like "summarize this PR" or "write a commit message in my style"

```
~/.claude/
  skills/
    my-commit/SKILL.md    ← Personal, everywhere
    daily-summary/SKILL.md

ai-coderrank/
  .claude/
    skills/
      review-k8s/SKILL.md  ← Team, this project only
      check-docker/SKILL.md
```

When you type `/` in Claude Code, you'll see both project and personal skills in the autocomplete list.

---

### Key Takeaways

| Concept | What It Is | When to Use |
|---------|-----------|-------------|
| SKILL.md | Skill definition file | Always — it's the only required file |
| `$ARGUMENTS` | Placeholder for user input | When the skill needs a target (file, path, name) |
| `allowed-tools` | Restrict available tools | Review/audit skills that shouldn't modify anything |
| Project skills | `.claude/skills/` in repo | Team playbooks, shared workflows |
| User skills | `~/.claude/skills/` | Personal productivity tools |
| `/simplify` | Built-in cleanup skill | After implementing a feature |

> **Transition**: Time to build. You're about to create three custom skills, test them on real infrastructure code, and run `/simplify` on the dark theme you built in Block 4. Let's go.

---
