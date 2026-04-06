---
layout: block
title: "Understanding Your Codebase"
block_number: 1
description: "Let Claude analyze the project, generate CLAUDE.md, and explore the architecture through conversation."
time: "~28 min (8 min presentation + 20 min practical)"
features:
  - /init
  - CLAUDE.md
  - Read Tool
  - Grep Tool
  - Glob Tool
objectives:
  - Generate a CLAUDE.md file using /init and understand its purpose
  - Explore the ai-coderrank architecture through conversational queries
  - Understand how Claude uses Read, Grep, and Glob tools under the hood
  - Navigate API routes, component structure, and theme switching through dialogue
  - Learn the difference between conversational exploration and direct commands
overview_url: /course/block-01-understanding/
presentation_url: /course/block-01-understanding/presentation/
hands_on_url: /course/block-01-understanding/hands-on/
quiz_url: /course/block-01-understanding/quiz/
locale: en
translation_key: block-01
---
## From "What Is This?" to "I Know This Codebase"

You've joined a new team. There's a repo with 50 files, no documentation, and a Slack message that says "check out the code and get up to speed." Sound familiar?

This is where Claude Code transforms from "interesting tool" to "how did I ever work without this." Instead of spending hours clicking through files, reading imports, and mentally mapping the architecture, you have a conversation. You ask questions. Claude reads the code and gives you answers grounded in what's actually there — not what someone remembered to document six months ago.

## What We'll Cover

1. **CLAUDE.md** — what it is, why it matters, and how `/init` generates it automatically
2. **How Claude reads code** — the Read, Grep, and Glob tools working behind the scenes
3. **Conversational exploration** — asking Claude to explain architecture, data flow, and design decisions
4. **The ai-coderrank deep dive** — understanding every layer of the project through dialogue

## Why CLAUDE.md Matters

Every project has tribal knowledge — conventions, gotchas, "we do it this way because..." reasons that live in people's heads. CLAUDE.md captures that knowledge in a format Claude Code reads automatically at the start of every session.

Think of it this way:
- **README.md** is for humans joining the team
- **CLAUDE.md** is for Claude joining the team

When you run `/init`, Claude analyzes your entire codebase and generates a CLAUDE.md that captures the project structure, tech stack, conventions, and important patterns. You can (and should) edit it over time as you learn more about the project — but the auto-generated version is a remarkably good starting point.

## How Claude Reads Code

Claude Code doesn't just have access to your files — it has specialized tools for different kinds of exploration:

| Tool | What it does | Analogy |
|------|-------------|---------|
| **Read** | Opens and reads a specific file | `cat filename` |
| **Grep** | Searches for patterns across files | `rg "pattern"` |
| **Glob** | Finds files matching a pattern | `find . -name "*.ts"` |

When you ask Claude "how does the theme switching work?", it doesn't guess. It uses Grep to find theme-related code, Read to examine the relevant files, and Glob to check if there are related config files. You can watch these tool calls happen in real time during your session.

## Choose Your Format

Pick the format that matches how you are using the block:

<div class="card-grid">
  <a href="{{ '/course/block-01-understanding/presentation/' | relative_url }}" class="quick-card">
    <h3>Presentation</h3>
    <p>Speaker notes, slide flow, and talking points for the voice-over part of this block.</p>
  </a>

  <a href="{{ '/course/block-01-understanding/hands-on/' | relative_url }}" class="quick-card">
    <h3>Hands-On</h3>
    <p>Copy-pasteable terminal steps and prompts for the screen-sharing implementation part.</p>
  </a>

  <a href="{{ '/course/block-01-understanding/quiz/' | relative_url }}" class="quick-card">
    <h3>Quiz</h3>
    <p>Test your knowledge from this block with 6-8 questions.</p>
  </a>
</div>
