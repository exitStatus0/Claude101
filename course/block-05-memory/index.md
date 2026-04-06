---
layout: block
title: "Memory & Project Intelligence"
block_number: 5
description: "Teach Claude Code how your team works — once. Memory files, conditional rules, and auto-learning turn a generic AI into your project's expert."
time: "~28 min (8 min presentation + 20 min practical)"
features:
  - Memory Hierarchy
  - ~/.claude/CLAUDE.md
  - Project CLAUDE.md
  - CLAUDE.local.md
  - .claude/rules/
  - Auto Memory
  - /memory
  - "@path imports"
objectives:
  - Understand the three-layer memory hierarchy (user, project, local)
  - Create a user-level CLAUDE.md with personal preferences
  - Write conditional rules that activate only for specific file paths
  - Configure local-only memory for environment-specific details
  - Use /memory to inspect everything Claude loads at session start
  - Trigger and verify auto memory from corrections
overview_url: /course/block-05-memory/
presentation_url: /course/block-05-memory/presentation/
hands_on_url: /course/block-05-memory/hands-on/
locale: en
translation_key: block-05
---
## The "New Hire" Problem

You've been there. A new developer joins the team. Smart, capable — but for the first two weeks, every pull request comes back with the same comments: "We don't use default exports here." "Our K8s labels follow this convention." "Tests go in `__tests__/`, not `test/`."

Claude Code has the same problem. Out of the box, it's a brilliant generalist who knows nothing about _your_ project's conventions. Every session starts fresh, and you end up repeating yourself.

Memory fixes that. Permanently.

## What We'll Cover

1. **The memory hierarchy** — three layers that stack like CSS specificity: user, project, and local
2. **User-level CLAUDE.md** — your personal preferences that follow you everywhere
3. **Project CLAUDE.md** — team standards committed to version control (you've already seen this one)
4. **CLAUDE.local.md** — your machine-specific secrets and paths, safely gitignored
5. **Conditional rules** — `.claude/rules/` files that activate only when relevant files are touched
6. **Auto memory** — how Claude learns from your corrections without you writing a single config line
7. **The `/memory` command** — X-ray vision into what Claude knows about your project

## Why This Block Matters

Here's the thing about AI tools: the difference between "occasionally useful" and "indispensable" is almost never about the model's intelligence. It's about context. A doctor who doesn't know your medical history can still give generic advice. A doctor with your full chart? That's a different conversation entirely.

After this block, Claude Code will know your team's commit conventions, your testing patterns, your K8s labeling strategy, and your personal coding preferences. Every session. Automatically. Without you saying a word.

## Prerequisites

- Completed Blocks 0-4 (Claude Code installed, ai-coderrank running locally, dark theme implemented)
- The ai-coderrank project open in your terminal
- A willingness to tell Claude how you actually like things done (be honest — it won't judge)

---

## Choose Your Format

Pick the format that matches how you are using the block:

<div class="card-grid">
  <a href="{{ '/course/block-05-memory/presentation/' | relative_url }}" class="quick-card">
    <h3>Presentation</h3>
    <p>Speaker notes, slide flow, and talking points for the voice-over part of this block.</p>
  </a>

  <a href="{{ '/course/block-05-memory/hands-on/' | relative_url }}" class="quick-card">
    <h3>Hands-On</h3>
    <p>Copy-pasteable terminal steps and prompts for the screen-sharing implementation part.</p>
  </a>
</div>
