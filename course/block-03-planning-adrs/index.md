---
layout: block
title: "Planning with ADRs & Diagrams"
block_number: 3
description: "Use Plan mode to think before acting, create Architecture Decision Records, and generate Mermaid infrastructure diagrams — all before writing a single line of code."
time: "~35 min (10 min presentation + 25 min practical)"
features:
  - Plan Mode (/plan, Shift+Tab)
  - Edit/Write Tools
  - Structured Output
  - Mermaid Diagrams
objectives:
  - Understand why planning matters even when working with AI
  - Use Plan mode to outline a multi-file theme change before touching code
  - Create an Architecture Decision Record (ADR) that captures the *why* behind a decision
  - Generate Mermaid diagrams for infrastructure topology, traffic flow, and deployment pipeline
  - Review and iterate on a plan before committing to implementation
overview_url: /course/block-03-planning-adrs/
presentation_url: /course/block-03-planning-adrs/presentation/
hands_on_url: /course/block-03-planning-adrs/hands-on/
locale: en
translation_key: block-03
---
## Measure Twice, Cut Once

Here's a pattern that kills projects: someone opens a file, starts hacking, and three hours later they've changed 47 files and can't remember why they started. AI makes this worse — it's so fast at making changes that you can dig yourself into a hole at superhuman speed.

Plan mode is the antidote. It's Claude Code's way of saying: "Let me think about this first, show you what I'd do, and get your approval before I touch anything."

This block is about discipline. Not the boring kind — the kind that makes you faster. We're going to plan the dark theme change we'll implement in Block 4, and we'll leave behind documentation that future-you will actually thank present-you for writing.

## What We'll Cover

1. **Plan mode** — how Shift+Tab and `/plan` switch Claude from "doer" to "thinker"
2. **Architecture Decision Records** — lightweight docs that capture decisions and their reasoning
3. **Mermaid diagrams** — text-based diagrams that live in your repo and render on GitHub
4. **The dark theme plan** — mapping out every file we'll touch, every variable we'll change, before writing a single line of code

## What You'll Create

By the end of this block, your repo will have four new files:

| File | Purpose |
|------|---------|
| `docs/adr/001-dark-theme.md` | Decision record for the theme change |
| `docs/diagrams/infrastructure.md` | Mermaid diagram of the DO + k3s topology |
| `docs/diagrams/traffic-flow.md` | Mermaid diagram of request routing |
| `docs/diagrams/deployment-pipeline.md` | Mermaid diagram of the CI/CD pipeline |

These aren't homework assignments. They're the kind of artifacts that senior engineers produce before making infrastructure-level changes — and Claude can generate them in minutes.

## Why This Matters for DevOps

If you've ever inherited a project and asked "why is this configured this way?" — only to find zero documentation — you know the pain. ADRs solve that. They're not design docs (those are long and nobody reads them). ADRs are short, opinionated, and answer one question: **why did we make this choice?**

And Mermaid diagrams? They're version-controlled, diff-friendly, and GitHub renders them natively. No more Lucidchart links that expire when someone leaves the company.

## Choose Your Format

Pick the format that matches how you are using the block:

<div class="card-grid">
  <a href="{{ '/course/block-03-planning-adrs/presentation/' | relative_url }}" class="quick-card">
    <h3>Presentation</h3>
    <p>Speaker notes, slide flow, and talking points for the voice-over part of this block.</p>
  </a>

  <a href="{{ '/course/block-03-planning-adrs/hands-on/' | relative_url }}" class="quick-card">
    <h3>Hands-On</h3>
    <p>Copy-pasteable terminal steps and prompts for the screen-sharing implementation part.</p>
  </a>
</div>
