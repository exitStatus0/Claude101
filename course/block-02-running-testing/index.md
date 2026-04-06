---
layout: block
title: "Running & Testing Locally"
block_number: 2
description: "npm install, dev server, tests, Docker build — and watching Claude handle errors in real time."
time: "~33 min (8 min presentation + 25 min practical)"
features:
  - Bash Tool
  - Permission Prompts
  - /clear
  - /compact
objectives:
  - Understand how Claude Code executes shell commands via the Bash tool
  - Experience the permission model — Claude asks before running things
  - Set up the project with npm install and run the dev server
  - Run tests and the linter through Claude
  - Build a Docker image using Claude
  - Deliberately break something and watch Claude diagnose and fix it
  - Use /clear and /compact to manage conversation context
overview_url: /course/block-02-running-testing/
presentation_url: /course/block-02-running-testing/presentation/
hands_on_url: /course/block-02-running-testing/hands-on/
quiz_url: /course/block-02-running-testing/quiz/
locale: en
translation_key: block-02
---
## From Reading to Doing

In Block 1, Claude read your code and explained it. That was impressive — but Claude Code is not just a reader. It's a doer.

This block is where things get real. Claude will run `npm install`, start your dev server, execute your test suite, lint your code, and build a Docker image. And when something breaks — because we're going to break something on purpose — Claude will diagnose the error, figure out the fix, and apply it.

This is the Bash tool in action: Claude's ability to execute shell commands in your terminal, with a safety-first permission model that makes sure you're always in control.

## What We'll Cover

1. **The Bash tool** — how Claude executes commands and reads their output
2. **The permission model** — why Claude asks before running things, and how to manage it
3. **Project setup** — `npm install` and `npm run dev` via Claude
4. **Testing and linting** — running the full quality pipeline
5. **Docker builds** — multi-stage image building
6. **Error handling** — the break-and-fix exercise
7. **Context management** — using `/clear` and `/compact`

## The Permission Model

Here's something important: Claude Code does not just run commands willy-nilly. When Claude wants to execute a shell command, it asks you first. You'll see a prompt like:

```
Claude wants to run: npm install
Allow? (y/n)
```

This is intentional. Claude is powerful, and power requires guardrails. You stay in control of what actually executes on your machine. Over time, you'll develop a rhythm — approve routine commands quickly, pause and think about unfamiliar ones.

You can also configure which commands are auto-approved and which always require confirmation. We'll cover that customization in later blocks.

## Context Management: /clear and /compact

As your conversation grows, Claude's context window fills up. Two commands help manage this:

- **`/clear`** — nuclear option. Wipes the entire conversation and starts fresh. Use this when you're switching to a completely different task.
- **`/compact`** — smart option. Claude summarizes the conversation so far into a compressed form, freeing up context space while retaining the key information. Use this when you're deep into a long session and Claude starts feeling slow.

Think of `/clear` as closing all your browser tabs and starting over. `/compact` is more like bookmarking the important tabs and closing the rest.

## Choose Your Format

Pick the format that matches how you are using the block:

<div class="card-grid">
  <a href="{{ '/course/block-02-running-testing/presentation/' | relative_url }}" class="quick-card">
    <h3>Presentation</h3>
    <p>Speaker notes, slide flow, and talking points for the voice-over part of this block.</p>
  </a>

  <a href="{{ '/course/block-02-running-testing/hands-on/' | relative_url }}" class="quick-card">
    <h3>Hands-On</h3>
    <p>Copy-pasteable terminal steps and prompts for the screen-sharing implementation part.</p>
  </a>

  <a href="{{ '/course/block-02-running-testing/quiz/' | relative_url }}" class="quick-card">
    <h3>Quiz</h3>
    <p>Test your knowledge from this block with 6-8 questions.</p>
  </a>
</div>
