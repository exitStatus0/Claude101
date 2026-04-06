---
layout: block-part
title: "Memory & Project Intelligence"
block_number: 5
description: "Presentation notes and speaking flow for Block 05."
part_name: "Presentation"
overview_url: /course/block-05-memory/
presentation_url: /course/block-05-memory/presentation/
hands_on_url: /course/block-05-memory/hands-on/
permalink: /course/block-05-memory/presentation/
---
> **Duration**: ~8 minutes
> **Goal**: Students understand the memory hierarchy, know when to use each layer, and grasp how auto memory works.

---

### Slide 1: The First Thing Claude Reads

Here's a fun fact that changes how you think about Claude Code:

**CLAUDE.md is loaded every single session. It's literally the first thing Claude reads about your project.**

Before it looks at your code. Before it reads your prompt. Before anything — it reads its memory files. Think of it like walking into the office and checking the team wiki before opening Slack.

And here's the kicker: you control what's on that wiki.

---

### Slide 2: The Memory Hierarchy

Claude's memory works in layers, like a cake — each layer adds flavor, and they all combine into the final result.

```
┌─────────────────────────────────────────────┐
│  Layer 3: CLAUDE.local.md                   │
│  Your machine only. Gitignored. Secrets,    │
│  local paths, personal overrides.           │
├─────────────────────────────────────────────┤
│  Layer 2: Project CLAUDE.md + .claude/rules │
│  Committed to git. Shared with team.        │
│  The "team agreement" layer.                │
├─────────────────────────────────────────────┤
│  Layer 1: ~/.claude/CLAUDE.md               │
│  Your personal preferences. Follows you     │
│  across every project on your machine.      │
└─────────────────────────────────────────────┘
```

**Layer 1 — User-level** (`~/.claude/CLAUDE.md`):
Your personal coding DNA. Prefer functional style over classes? Always want commit messages in conventional format? Hate semicolons? This is where that goes. It applies to _every_ project you open.

**Layer 2 — Project-level** (`CLAUDE.md` at the project root + `.claude/rules/`):
Team standards. "We use Tailwind, not CSS modules." "All API routes return a standard error shape." "K8s manifests use label `app.kubernetes.io/name`." This lives in version control — when a teammate pulls, they get the same instructions.

**Layer 3 — Local** (`CLAUDE.local.md`):
Your machine-specific details. The path to your local Kubernetes config. Your staging environment URL. That API key you use for local testing. This file is gitignored by default — it never leaves your machine.

> **Analogy**: Think of it like CSS specificity. User-level is the browser default. Project-level is the stylesheet. Local is the inline style — highest priority, most specific.

---

### Slide 3: The `.claude/rules/` Directory — Conditional Intelligence

This is where things get really clever.

Instead of dumping everything into one giant CLAUDE.md, you can create focused rule files that activate **only when relevant files are being edited**.

```
.claude/
  rules/
    testing.md      # Loads when you edit tests/**
    k8s.md          # Loads when you edit k8s/**
    docker.md       # Loads when you edit Dockerfile*
    api.md          # Loads when you edit src/app/api/**
```

Each file has a path filter at the top:

```markdown
---
path: "k8s/**"
---

When working with Kubernetes manifests:
- Always include resource limits (cpu and memory)
- Use label convention: app.kubernetes.io/name, app.kubernetes.io/component
- Never use `latest` tag for images...
```

**Why this matters**: Claude doesn't need to think about your K8s conventions when you're editing a React component. Conditional rules keep context focused and relevant — less noise, better results.

It's like how a surgeon doesn't review the cafeteria menu before an operation. Right information, right time.

---

### Slide 4: Auto Memory — Claude Learns From You

This one's almost magical.

When you correct Claude during a session — "No, we use `pnpm` here, not `npm`" or "Our tests use `vitest`, not `jest`" — Claude can remember that correction for next time.

**How it works**:
1. You correct Claude on something project-specific
2. Claude recognizes this as a learnable convention
3. It offers to save the insight to your project's memory
4. Next session, it already knows

You can also use the **`/memory`** command at any time to:
- See everything Claude currently has loaded
- Edit memory entries directly
- Add new conventions on the fly

**Pro tip**: After a code review where you gave a lot of feedback, start a Claude session and just say "I want to add some conventions to our project memory." Then list what you told the PR author. Now Claude enforces those conventions automatically.

---

### Slide 5: `@path` Imports — Pointing Claude at References

Sometimes you want Claude to read a specific file as context, even if it wouldn't naturally look there. That's what `@path` does.

In any CLAUDE.md or rules file, you can reference other files:

```markdown
For our API response format, follow the pattern in @src/lib/api-response.ts
For deployment conventions, see @docs/deployment-guide.md
```

Claude will load those referenced files as additional context. It's like saying "before you start, read this."

---

### Slide 6: Putting It All Together

Here's what a well-configured project looks like:

```
~/.claude/
  CLAUDE.md              # "I prefer TypeScript strict mode, conventional commits"

ai-coderrank/
  CLAUDE.md              # "Next.js 14 app, pnpm, Tailwind CSS, team conventions"
  CLAUDE.local.md        # "My staging URL is..., my API key is..."
  .claude/
    rules/
      testing.md         # Testing patterns (path: tests/**)
      k8s.md             # K8s conventions (path: k8s/**)
      docker.md          # Docker best practices (path: Dockerfile*)
```

When you open a session and edit a K8s manifest, Claude loads:
1. Your personal `~/.claude/CLAUDE.md`
2. The project `CLAUDE.md`
3. Your `CLAUDE.local.md`
4. The `k8s.md` rule (because you're touching K8s files)

That's four layers of context, loaded automatically, before you type a single word.

**This is how you turn a general-purpose AI into your team's expert.**

---

### Key Takeaways

| Layer | File | Shared? | Use Case |
|-------|------|---------|----------|
| User | `~/.claude/CLAUDE.md` | No (personal) | Coding style, preferred tools, commit format |
| Project | `CLAUDE.md` | Yes (git) | Team standards, tech stack, conventions |
| Local | `CLAUDE.local.md` | No (gitignored) | Env vars, local paths, secrets |
| Rules | `.claude/rules/*.md` | Yes (git) | Conditional, path-specific conventions |
| Auto | Learned from corrections | Per project | Accumulated knowledge from usage |

> **Transition**: Alright — enough theory. Let's build out the full memory system for ai-coderrank. By the end of the practical, Claude will know this project like a senior engineer who's been on the team for a year.

---
