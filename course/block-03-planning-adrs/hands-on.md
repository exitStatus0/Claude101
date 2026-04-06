---
layout: block-part
title: "Planning with ADRs & Diagrams"
block_number: 3
description: "Hands-on implementation steps for Block 03."
time: "~25 minutes"
part_name: "Hands-On"
overview_url: /course/block-03-planning-adrs/
presentation_url: /course/block-03-planning-adrs/presentation/
hands_on_url: /course/block-03-planning-adrs/hands-on/
permalink: /course/block-03-planning-adrs/hands-on/
---
> **Attention point:** Every command or prompt block on this page is meant to be copied directly into your terminal or Claude session unless the text says otherwise.

> **Duration**: ~25 minutes
> **Outcome**: An ADR, three Mermaid diagrams, and a solid implementation plan for the dark theme
> **Prerequisites**: Block 2 completed, Claude Code running inside the ai-coderrank project directory

---

### Step 1: Enter Plan Mode (2 min)

We're going to plan the dark theme change before writing any code. First, let's switch Claude into planning mode.

**In your Claude Code session, press Shift+Tab.**

You'll see the mode indicator change. Claude is now in **Plan mode** — it will analyze and reason but won't edit files or run commands.

> **Alternative:** You can also type `/plan` to enter plan mode.

Now give Claude the big picture:

```text
We need to add a dark theme to ai-coderrank. The app currently uses a light theme
with CSS variables and a ThemeProvider component. There's also a scripts/switch-theme.sh
script for theme switching.

Before we implement anything, I want to plan this change. Analyze the current theme
system — look at the Tailwind config, CSS variables, ThemeProvider, and the switch-theme
script. Tell me every file we'll need to touch and what changes each one needs.
```

**What to watch for:**
- Claude will read files like `tailwind.config.ts`, the global CSS file, the ThemeProvider component, and `scripts/switch-theme.sh`
- It will produce a structured plan listing files, changes, and the order of operations
- It should identify CSS variable definitions, Tailwind's dark mode configuration, and component-level styles

**Take a moment to read the plan.** Does it make sense? Does it miss anything? This is your chance to course-correct before any code changes happen.

---

### Step 2: Create the ADR Directory and Document (8 min)

Now we'll ask Claude to create an Architecture Decision Record. Stay in Plan mode for the initial discussion, then switch to Act mode for the file creation.

**Still in Plan mode, type:**

```text
I want to create an ADR (Architecture Decision Record) for this dark theme decision.
The ADR should follow this structure:
- Title, Status, Date
- Context: why are we adding dark themes?
- Decision: what approach are we taking?
- Consequences: what are the trade-offs?
- Alternatives Considered: what else did we evaluate?

The context should mention: developer preference, reduced eye strain, industry standard
for dev tools, and that our target audience (developers comparing AI models) likely
prefers dark themes. The decision should reference the existing ThemeProvider and CSS
variable architecture.
```

Claude will draft the ADR content in Plan mode. Review it — suggest edits if needed.

**When you're satisfied with the plan, press Shift+Tab to switch back to Act mode.**

Now tell Claude to create the file:

```text
Create the ADR at docs/adr/001-dark-theme.md with the content we just planned.
```

**What to watch for:**
- Claude uses the **Write** tool to create the new file (since it doesn't exist yet)
- It creates the `docs/adr/` directory structure automatically
- The ADR should be clean, well-formatted markdown

**Verify the file was created:**

```text
Show me the contents of docs/adr/001-dark-theme.md
```

Your ADR should look something like this (Claude's version will vary):

```markdown
# ADR-001: Add Dark Theme to ai-coderrank

**Status:** Accepted
**Date:** 2026-04-05

## Context

ai-coderrank is a developer-facing dashboard for comparing AI coding models.
Our target audience — developers, DevOps engineers, and engineering managers —
overwhelmingly prefers dark themes in their tooling...

## Decision

We will implement a dark theme using the existing CSS variable architecture
and ThemeProvider component...

## Consequences

### Positive
- Better developer experience, especially for extended use
- Aligns with industry standards for developer tools
...

### Negative
- Increases CSS surface area (two complete color palettes to maintain)
- Chart colors in Recharts need separate dark-optimized palettes
...

## Alternatives Considered

1. **System-preference-only** — Follow OS dark/light setting automatically...
2. **CSS-only toggle without ThemeProvider** — Simpler but less flexible...
3. **Keep light theme only** — Rejected because...
```

---

### Step 3: Generate the Infrastructure Topology Diagram (5 min)

Now let's create Mermaid diagrams that document our infrastructure. These are useful on their own, and they give Claude (and future team members) a visual map of the system.

**Type:**

```text
Create a Mermaid diagram at docs/diagrams/infrastructure.md that shows our
infrastructure topology:

- DigitalOcean Droplet (the host machine, public IP)
  - k3s cluster running on the droplet
    - ai-coderrank app (pod with the Next.js container, exposed via NodePort 30080)
    - ArgoCD (pod for GitOps deployment)
    - System components (CoreDNS, Traefik, metrics-server)
- External: GitHub (source repo), GHCR (container registry)

Use a top-down graph. Include a brief explanation above the diagram of what
it shows. Wrap the Mermaid code in a ```mermaid fenced code block so GitHub
renders it automatically.
```

**What to watch for:**
- Claude creates the `docs/diagrams/` directory
- The Mermaid syntax should use `graph TD` (top-down) or `graph TB` (top-bottom)
- Nodes should have descriptive labels
- GitHub will render the diagram automatically when you view the file

**If the diagram isn't quite right, iterate:**

```text
Can you add the DigitalOcean floating IP as the entry point, and group the k3s
components inside a subgraph?
```

This is one of Claude's strengths — iterating on diagrams is much faster than dragging boxes around in a GUI tool.

---

### Step 4: Generate the Traffic Flow Diagram (4 min)

**Type:**

```text
Create a Mermaid diagram at docs/diagrams/traffic-flow.md that shows how a user
request reaches the ai-coderrank app:

1. User's browser hits http://DROPLET_IP:30080
2. DigitalOcean droplet receives traffic on NodePort 30080
3. k3s kube-proxy routes to the Kubernetes Service
4. Service forwards to ai-coderrank Pod on port 3000
5. Next.js serves the response back through the same chain

Use a left-to-right flow diagram. Include port numbers at each hop.
Add a brief description above the diagram.
```

**What to watch for:**
- The diagram should use `graph LR` for left-to-right flow
- It should clearly show the request path with port numbers at each hop
- NodePort 30080 is the external entry point, container port 3000 is internal

**Iterate if needed:**

```text
Add a note showing that this is the simplest exposure method — no DNS, no TLS,
no Ingress needed. Just the droplet's public IP and the NodePort.
```

---

### Step 5: Generate the Deployment Pipeline Diagram (4 min)

**Type:**

```text
Create a Mermaid diagram at docs/diagrams/deployment-pipeline.md that shows
the deployment pipeline:

1. Developer pushes to GitHub (main branch)
2. GitHub Actions triggers CI workflow
3. CI runs: lint, test, build
4. Docker image is built and pushed to container registry
5. ArgoCD detects the change (watches the repo or registry)
6. ArgoCD syncs the new image to the k3s cluster
7. k3s performs a rolling update of the ai-coderrank pod

Use a top-down flow. Color-code or use different shapes for: developer actions,
CI/CD automation, and Kubernetes operations. Add a description above the diagram.
```

**What to watch for:**
- Different node shapes for different concerns (rectangles for steps, diamonds for decisions, rounded for start/end)
- Clear separation between the CI phase and the CD phase
- ArgoCD's role as the bridge between "code pushed" and "app deployed"

**Iterate if needed:**

```text
Can you add a decision diamond after the CI step that shows "Tests pass?" with
a Yes path to Docker build and a No path to "Notify developer, stop pipeline"?
```

---

### Step 6: Review Everything (2 min)

Let's take stock of what we've created. Ask Claude to give you a summary:

```text
List all the files we created in this session with a one-line description of each.
Then give me a quick summary of the dark theme implementation plan — which files
will we change in Block 4 and in what order?
```

**You should see four files:**

| File | Description |
|------|-------------|
| `docs/adr/001-dark-theme.md` | Architecture Decision Record for the dark theme |
| `docs/diagrams/infrastructure.md` | Mermaid diagram of the DO/k3s infrastructure |
| `docs/diagrams/traffic-flow.md` | Mermaid diagram of request routing |
| `docs/diagrams/deployment-pipeline.md` | Mermaid diagram of the CI/CD pipeline |

**Optional — preview the diagrams:**

If you want to see the diagrams rendered, you can:
- Push the files to GitHub and view them in the browser (GitHub renders Mermaid natively)
- Use a VS Code extension like "Markdown Preview Mermaid Support"
- Paste the Mermaid code into [mermaid.live](https://mermaid.live) for a live preview

---

### Checkpoint

Before moving to Block 4, verify:

- [ ] `docs/adr/001-dark-theme.md` exists and has a complete ADR with Context, Decision, Consequences, and Alternatives
- [ ] `docs/diagrams/infrastructure.md` has a Mermaid diagram showing the DO droplet, k3s, and all pods
- [ ] `docs/diagrams/traffic-flow.md` has a Mermaid diagram showing the request path from user to pod
- [ ] `docs/diagrams/deployment-pipeline.md` has a Mermaid diagram showing the full CI/CD pipeline
- [ ] You have a clear mental model of which files will change for the dark theme (from the Plan mode output)
- [ ] You understand the difference between Plan mode and Act mode

---

### Key Takeaways

1. **Plan mode is your pre-flight checklist.** Use it for any change that touches more than 2-3 files. The few minutes you spend planning will save you from wrong turns.

2. **ADRs are surprisingly easy with Claude.** What normally takes 30 minutes of writing takes 2 minutes of prompting and reviewing. The hard part — capturing the *reasoning* — is exactly what Claude is good at.

3. **Mermaid diagrams are living documentation.** They live in your repo, they're diffable, and GitHub renders them. No more broken Lucidchart links.

4. **Iteration is the secret.** Your first prompt won't produce the perfect output. The second or third refinement will. This is normal and expected — it's how working with AI is supposed to feel.

---

### What's Next

In Block 4, we'll take this plan and *execute* it. Claude will edit Tailwind config, CSS variables, and component styles to implement the dark theme. You'll see the Edit tool in action — surgical, precise file modifications — and you'll learn how to iterate on visual changes with Claude until the result looks exactly right.

The plan is done. Time to build.
