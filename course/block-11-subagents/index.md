---
layout: block
title: "Sub-agents — Specialized Workers"
block_number: 11
description: "Build a team of AI specialists that Claude can delegate to -- a security reviewer, a K8s validator, and custom agents with their own tools, models, and isolation boundaries."
time: "~35 min (10 min presentation + 25 min practical)"
features:
  - Custom sub-agents (.claude/agents/)
  - Sub-agent frontmatter (model, allowed-tools)
  - Explore and Plan built-in agents
  - "isolation: worktree"
  - /agents command
objectives:
  - Understand sub-agents as specialized AI workers within a Claude Code session
  - See the built-in Explore and Plan agents in action
  - Create a security reviewer agent restricted to read-only tools
  - Create a K8s validator agent that can run kubectl dry-run
  - Use model selection to balance speed and cost across agents
  - Understand worktree isolation for safe parallel work
  - List and manage agents with /agents
overview_url: /course/block-11-subagents/
presentation_url: /course/block-11-subagents/presentation/
hands_on_url: /course/block-11-subagents/hands-on/
---
## From One Brain to a Team

In Block 6, you built skills -- reusable commands that tell Claude _what to do_. In Block 10, you put Claude into CI so it runs automatically. This block introduces something different: sub-agents, which are separate AI workers that Claude can _delegate_ to.

Think about how a real engineering team works. You do not ask the same person to do everything. The security engineer reviews for vulnerabilities. The SRE validates the Kubernetes manifests. The tech lead plans the architecture. Each person has their own expertise, their own tools, and their own scope of responsibility.

Sub-agents bring this model to Claude Code. Instead of one Claude session doing everything, you can have specialized workers -- each with its own system prompt, tool access, context window, and even model selection. The security reviewer only gets read access. The K8s validator can run `kubectl` but cannot edit source code. The fast-draft agent uses Haiku for speed, while a deeper architecture planner can use Opus if your plan includes it.

## What We'll Cover

1. **What sub-agents are** -- specialized AI workers running inside your session
2. **Built-in agents** -- Explore (read-only research) and Plan (architecture design)
3. **Custom agents** -- `.claude/agents/` directory and agent frontmatter
4. **Tool restrictions** -- controlling what each agent can and cannot do
5. **Model selection** -- Haiku for fast/cheap, Sonnet for the default balance, and Opus for complex reasoning when available on your plan
6. **Worktree isolation** -- agents working on separate git branches safely
7. **The `/agents` command** -- listing and managing your agent roster

## Why This Block Matters

There is a scaling problem with a single AI session. The more context you pile into one conversation -- security concerns, architecture decisions, test strategies, Kubernetes configs -- the more the AI has to juggle. Sub-agents solve this by decomposition. Each agent gets a focused task, a focused prompt, and a focused tool set.

There is also a trust problem. You might trust Claude to read your code and suggest changes, but do you trust it to run arbitrary bash commands while reviewing for security issues? Probably not. Sub-agents let you give each worker exactly the permissions it needs and nothing more. Principle of least privilege, applied to AI.

And there is a cost problem. Not every task needs the most powerful model. A quick code search does not need Opus. A complex architecture decision does not work well with Haiku. Sub-agents let you match the model to the task, keeping costs predictable, even if your day-to-day baseline is just Sonnet on Pro.

## Prerequisites

- Completed Blocks 0-10 (GitHub Actions CI configured)
- The ai-coderrank project with K8s manifests and source code
- Familiarity with `.claude/` directory structure from Blocks 5-6
- kubectl configured and pointing at your k3s cluster from Block 7

## Choose Your Format

Pick the format that matches how you are using the block:

<div class="card-grid">
  <a href="{{ '/course/block-11-subagents/presentation/' | relative_url }}" class="quick-card">
    <h3>Presentation</h3>
    <p>Speaker notes, slide flow, and talking points for the voice-over part of this block.</p>
  </a>

  <a href="{{ '/course/block-11-subagents/hands-on/' | relative_url }}" class="quick-card">
    <h3>Hands-On</h3>
    <p>Copy-pasteable terminal steps and prompts for the screen-sharing implementation part.</p>
  </a>
</div>
