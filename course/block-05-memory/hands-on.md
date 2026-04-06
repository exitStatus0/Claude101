---
layout: block-part
title: "Memory & Project Intelligence"
block_number: 5
description: "Hands-on implementation steps for Block 05."
time: "~20 minutes"
part_name: "Hands-On"
overview_url: /course/block-05-memory/
presentation_url: /course/block-05-memory/presentation/
hands_on_url: /course/block-05-memory/hands-on/
permalink: /course/block-05-memory/hands-on/
---
> **Attention point:** Every command or prompt block on this page is meant to be copied directly into your terminal or Claude session unless the text says otherwise.

> **Duration**: ~20 minutes
> **Outcome**: A complete memory system for ai-coderrank -- user preferences, conditional rules for K8s and testing, local environment config, and auto-learned conventions.
> **Prerequisites**: Completed Blocks 0-4 (Claude Code installed, ai-coderrank running locally, dark theme implemented)

---

### Step 1: Create Your User-Level CLAUDE.md (~3 min)

This file lives outside any project — it's YOUR preferences, applied everywhere.

Create the directory if it doesn't exist, then create the file:

```bash
mkdir -p ~/.claude
```

Now create `~/.claude/CLAUDE.md` with your personal preferences. Here's a template — **customize it to match how you actually work**:

```markdown
# Personal Coding Preferences

## Style
- I prefer functional programming patterns over class-based OOP
- Use TypeScript strict mode whenever possible
- Prefer named exports over default exports
- Use `const` by default, `let` only when reassignment is needed

## Commits
- Follow Conventional Commits format: type(scope): description
- Types: feat, fix, docs, style, refactor, test, chore, ci
- Keep subject line under 72 characters
- Write commit messages in imperative mood ("add feature" not "added feature")

## Communication
- Be concise in explanations — I prefer bullet points over paragraphs
- When showing code changes, always explain WHY not just WHAT
- If something could break production, flag it loudly

## Tools
- I use pnpm as my package manager
- My terminal is zsh with oh-my-zsh
- I use vim keybindings
```

> **Important**: This is YOUR file. Change it to reflect your real preferences. Use npm instead of pnpm? Prefer classes? Like verbose explanations? Make it yours. The whole point is that Claude adapts to you, not the other way around.

---

### Step 2: Review the Project CLAUDE.md (~2 min)

Back in Block 1, when we first explored ai-coderrank, a project-level `CLAUDE.md` was already there. Let's look at it again with fresh eyes, now that we understand what it does.

```bash
cd ~/ai-coderrank
cat CLAUDE.md
```

You should see something like:

```markdown
# CLAUDE.md

This is a Next.js 14 application that compares AI coding models.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts for data visualization
- pnpm as package manager

## Commands
- `pnpm dev` — start development server
- `pnpm build` — production build
- `pnpm test` — run tests
- `pnpm lint` — run ESLint

## Project Structure
- `src/app/` — Next.js app router pages and API routes
- `src/components/` — React components
- `src/lib/` — Utility functions and data
- `k8s/` — Kubernetes manifests
- `argocd/` — ArgoCD application config
```

This file is committed to git. Every developer on the team (and every Claude session) sees it. Think of it as the project's "hello, here's who I am" introduction.

> **Discussion point**: What's missing from this CLAUDE.md? What conventions would you add for your team? Keep this in mind — we'll come back to it.

---

### Step 3: Create Conditional Rules for Testing (~4 min)

Now for the good stuff. Let's create rules that activate only when Claude is working with test files.

Create the rules directory:

```bash
mkdir -p ~/ai-coderrank/.claude/rules
```

Create `.claude/rules/testing.md`:

```markdown
---
path: "**/*.test.*"
---

# Testing Conventions

## Framework
- We use Vitest as our test runner
- React components are tested with @testing-library/react
- API routes are tested with supertest

## Structure
- Test files live next to the code they test: `Component.tsx` -> `Component.test.tsx`
- Use `describe` blocks to group related tests
- Each `it` block should test exactly ONE behavior
- Name tests as sentences: `it('renders the model comparison chart with data')`

## Patterns
- Prefer `screen.getByRole()` over `getByTestId()` for accessibility
- Use `userEvent` over `fireEvent` for realistic user interactions
- Mock external APIs at the fetch level, not at the module level
- Always clean up: if you add to the DOM, make sure it's removed

## Coverage
- New features require tests — no exceptions
- Bug fixes require a regression test that would have caught the bug
- Minimum meaningful coverage, not chasing percentages

## Example Structure
```
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModelCard } from './ModelCard';

describe('ModelCard', () => {
  it('displays the model name and provider', () => {
    render(<ModelCard model={mockModel} />);
    expect(screen.getByRole('heading')).toHaveTextContent('GPT-4');
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
  });

  it('highlights the top-ranked model with a badge', () => {
    render(<ModelCard model={mockModel} rank={1} />);
    expect(screen.getByRole('status')).toHaveTextContent('#1');
  });
});
```text
```

> **What just happened?** The `path: "**/*.test.*"` frontmatter tells Claude: "Only load these instructions when test files are involved." When you're editing a Kubernetes manifest, this file stays out of the way. When you touch a test? It's right there.

---

### Step 4: Create Conditional Rules for Kubernetes (~4 min)

Same concept, but for K8s manifests. This is where domain-specific knowledge really shines.

Create `.claude/rules/k8s.md`:

```markdown
---
path: "k8s/**"
---

# Kubernetes Manifest Conventions

## Labels (Required on All Resources)
Every resource MUST include these labels:
```
metadata:
  labels:
    app.kubernetes.io/name: ai-coderrank
    app.kubernetes.io/component: <component>  # e.g., frontend, api, worker
    app.kubernetes.io/part-of: ai-coderrank
    app.kubernetes.io/managed-by: argocd
```text

## Resource Limits (Required on All Containers)
Never deploy a container without resource limits. Use these as starting points:
```
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```text

## Security
- Never run containers as root — always set `runAsNonRoot: true`
- Always set `readOnlyRootFilesystem: true` where possible
- Drop all capabilities, add back only what's needed:
```
securityContext:
  runAsNonRoot: true
  readOnlyRootFilesystem: true
  capabilities:
    drop: ["ALL"]
```text

## Images
- NEVER use the `latest` tag — always pin to a specific version
- Use the project's container registry: `ghcr.io/your-org/ai-coderrank`
- Multi-arch images preferred (amd64 + arm64)

## Naming
- Use kebab-case for resource names
- Prefix with `ai-coderrank-`: e.g., `ai-coderrank-deployment`, `ai-coderrank-service`
- Namespace: `ai-coderrank` (don't use `default`)

## Health Checks
Every Deployment must have:
- `livenessProbe` — is the process alive?
- `readinessProbe` — is it ready to receive traffic?
- `startupProbe` for containers with slow initialization
```

> **This is powerful.** Next time you ask Claude to "add a new Kubernetes deployment for a Redis cache," it will automatically include resource limits, security contexts, proper labels, and health checks — because it knows your team's rules.

---

### Step 5: Create CLAUDE.local.md (~3 min)

This file is for things that are true on YOUR machine but shouldn't be shared. Local paths, personal environment details, staging URLs.

Create `CLAUDE.local.md` in the project root:

```markdown
# Local Environment — DO NOT COMMIT

## Environment
- Local K8s cluster: minikube (profile: ai-coderrank)
- Kubeconfig path: ~/.kube/config
- Docker daemon: Docker Desktop on macOS

## Local URLs
- App: http://localhost:3000
- K8s Dashboard: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

## Credentials (for local development only)
- GitHub Container Registry: Use `gh auth token` for authentication
- ArgoCD admin password: see `argocd admin initial-password -n argocd`

## Personal Preferences for This Project
- I'm currently focused on the dark theme feature (Block 4)
- My preferred branch naming: feature/<block-number>-<short-description>
- I review diffs before committing — always show me the diff first
```

Now verify it's gitignored:

```bash
cd ~/ai-coderrank
cat .gitignore | grep -i claude
```

You should see `CLAUDE.local.md` in the gitignore. If it's not there, add it:

```bash
echo "CLAUDE.local.md" >> .gitignore
```

> **Why this matters**: CLAUDE.local.md is where you put things that would be a security incident if they hit GitHub. Local credentials, internal URLs, paths that reveal your username. It's gitignored by default in Claude Code projects, but always double-check.

---

### Step 6: Run `/memory` to See the Full Picture (~2 min)

Now let's see everything Claude has loaded. Start a Claude Code session in the ai-coderrank project:

```bash
cd ~/ai-coderrank
claude
```

Once inside, type:

```text
/memory
```

Claude will show you a summary of all loaded memory:
- Your user-level `~/.claude/CLAUDE.md`
- The project-level `CLAUDE.md`
- Your `CLAUDE.local.md`
- Any `.claude/rules/` files and their path filters

You should see both your testing rules and K8s rules listed, with their activation conditions.

> **Try this**: Ask Claude "What do you know about how we write tests in this project?" It should reference your testing conventions from the rules file — even though you never mentioned them in the conversation.

---

### Step 7: Auto Memory — Watch Claude Learn (~2 min)

This is the "whoa" moment. Let's teach Claude something by correcting it.

In your Claude Code session, try this:

```text
Show me how to run the linter for this project
```

If Claude suggests `npm run lint` or `yarn lint`, correct it:

```text
Actually, we use pnpm in this project. The command is pnpm lint.
```

Claude will recognize this as a learnable convention and may offer to remember it. Accept the suggestion.

Now, **exit the session and start a new one**:

```text
/exit
claude
```

In the new session, ask:

```text
How do I run the linter?
```

Claude should now respond with `pnpm lint` without being told — it learned from your correction.

> **Behind the scenes**: Auto memory persists corrections to the project memory. Over time, these small corrections add up. After a few weeks of real usage, Claude knows your project as well as someone who's been on the team for months.

---

### Checkpoint

At this point, you should have:

| File | Location | Purpose |
|------|----------|---------|
| `~/.claude/CLAUDE.md` | Home directory | Personal preferences across all projects |
| `CLAUDE.md` | Project root | Team standards (already existed) |
| `CLAUDE.local.md` | Project root | Local env, gitignored |
| `.claude/rules/testing.md` | `.claude/rules/` | Test conventions (activates for test files) |
| `.claude/rules/k8s.md` | `.claude/rules/` | K8s conventions (activates for k8s/ files) |

**Five files. Zero repetition. Every session starts with full context.**

---

### Bonus Challenge

Create one more rule file: `.claude/rules/docker.md` with a path filter for `Dockerfile*`. Include conventions for:
- Multi-stage builds (separate builder and runtime stages)
- Non-root user in the final image
- Ordering `COPY` instructions for optimal layer caching (dependencies first, code second)
- Using `.dockerignore` to keep images small

Then ask Claude to review your existing Dockerfile against these new rules. See what it flags.

---

> **Next up**: In Block 6, we'll take this concept even further. If memory is what Claude _knows_, skills are what Claude can _do_. You'll create custom slash commands that turn complex workflows into one-liners.
