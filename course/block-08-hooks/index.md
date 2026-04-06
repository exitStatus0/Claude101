---
layout: block
title: "Hooks — Workflow Automation"
block_number: 8
description: "Automate your Claude Code workflow with hooks — auto-format on save, block dangerous edits, get notifications, and build safety rails into every session."
time: "~35 min (10 min presentation + 25 min practical)"
features:
  - Hooks in settings.json
  - Event types (PreToolUse, PostToolUse, SessionStart, Stop)
  - Exit codes (0 = proceed, 2 = block)
  - Verbose mode (Ctrl+O)
objectives:
  - Understand hooks as lifecycle event listeners for Claude Code sessions
  - Create a PostToolUse hook that auto-formats code after every file edit
  - Create a PreToolUse hook that blocks edits to protected files
  - Build a SessionStart hook that prints project status
  - Add a notification hook for long-running task completion
  - Use verbose mode to debug hook execution
  - Create a prompt hook that asks for confirmation before destructive commands
overview_url: /course/block-08-hooks/
presentation_url: /course/block-08-hooks/presentation/
hands_on_url: /course/block-08-hooks/hands-on/
quiz_url: /course/block-08-hooks/quiz/
locale: en
translation_key: block-08
---
## Teaching Claude Reflexes

In the last seven blocks, every action Claude took was something you explicitly asked for. "Add dark theme." "Review K8s manifests." "Generate a provisioning script." That's the conversational model — you ask, Claude does.

Hooks flip the script. Instead of you telling Claude what to do, you tell Claude what should _always happen_ — automatically, every time, without you having to remember. "After every file edit, run Prettier." "Before any edit to `.env`, stop and ask." "When a session starts, show me the git status."

Think of hooks as Claude's reflexes. You don't think about blinking — it just happens. Hooks are the same idea: actions that fire automatically at the right moment, so you can focus on the actual work instead of the ceremony around it.

## What We'll Cover

1. **What hooks are** — automated actions that fire at Claude Code lifecycle events
2. **The four hook types** — command, prompt, agent, and http
3. **Event types** — when hooks fire (before tools, after tools, session start, etc.)
4. **Exit codes** — how hooks control flow (proceed vs. block)
5. **Hands-on hooks** — auto-format, file protection, notifications, and confirmation prompts
6. **Verbose mode** — watching hooks fire in real time with `Ctrl+O`

## Why This Block Matters

Every team has rules that live in people's heads. "Don't edit `package-lock.json` manually." "Always run the linter before committing." "Ping the team channel when a deploy finishes." These rules get written in READMEs, mentioned in onboarding docs, and forgotten by the third week.

Hooks make these rules _enforceable_. Not by nagging people to follow them, but by making the right thing happen automatically. The file that shouldn't be edited? Blocked at the hook level. The formatter that should run after every change? Fires without anyone thinking about it. The notification that a long task finished? Pops up on its own.

This is the difference between a convention and a constraint. Conventions rely on memory. Constraints rely on code.

## Prerequisites

- Completed Blocks 0-7
- The ai-coderrank project open in Claude Code
- Basic familiarity with JSON configuration files
- macOS (for the notification hook example — Linux alternatives provided)

---

## Choose Your Format

Pick the format that matches how you are using the block:

<div class="card-grid">
  <a href="{{ '/course/block-08-hooks/presentation/' | relative_url }}" class="quick-card">
    <h3>Presentation</h3>
    <p>Speaker notes, slide flow, and talking points for the voice-over part of this block.</p>
  </a>

  <a href="{{ '/course/block-08-hooks/hands-on/' | relative_url }}" class="quick-card">
    <h3>Hands-On</h3>
    <p>Copy-pasteable terminal steps and prompts for the screen-sharing implementation part.</p>
  </a>

  <a href="{{ '/course/block-08-hooks/quiz/' | relative_url }}" class="quick-card">
    <h3>Quiz</h3>
    <p>Test your knowledge from this block with 6-8 questions.</p>
  </a>
</div>
