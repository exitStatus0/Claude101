---
layout: block-part
title: "Understanding Your Codebase"
block_number: 1
description: "Presentation notes and speaking flow for Block 01."
time: "~8 minutes"
part_name: "Presentation"
overview_url: /course/block-01-understanding/
presentation_url: /course/block-01-understanding/presentation/
hands_on_url: /course/block-01-understanding/hands-on/
permalink: /course/block-01-understanding/presentation/
---
**Target duration**: ~8 minutes
**Tone**: "Let me show you something that changed how I onboard to new projects."

---

### Slide 1: The Onboarding Problem (1.5 min)

**Talking points:**

> "How long does it take you to really understand a new codebase? Not just 'I can find the main file' — but truly understand the architecture, the patterns, the why behind the design decisions?
>
> For most of us, it's days. Sometimes weeks. You read files, follow imports, check git blame, ask teammates questions, read outdated documentation...
>
> What if you could have a 20-minute conversation instead?"

**Key point**: Claude Code turns codebase exploration from a solo scavenger hunt into a guided tour.

---

### Slide 2: How Claude Actually Reads Code (2.5 min)

**Talking points:**

- Claude Code isn't magic — it uses concrete tools to interact with your filesystem
- Three core exploration tools:
  - **Read** — opens a file and reads its contents (like `cat` but smarter — it can read specific line ranges)
  - **Grep** — searches for patterns across your codebase (powered by ripgrep, so it's fast)
  - **Glob** — finds files matching patterns (like `find` but more ergonomic)
- When you ask a question, Claude decides which tools to use and in what order
- It chains them together: "Find all TypeScript files" (Glob) -> "Search for 'theme' in those files" (Grep) -> "Read the most relevant file" (Read)

**Analogy**: "It's like watching a senior developer orient themselves in a new codebase. They don't read every file top to bottom. They search for patterns, follow the trail, and build a mental model. Claude does exactly that — except it can do it in seconds."

> "Watch the tool calls in your terminal. You'll see lines like 'Reading src/app/layout.tsx' or 'Searching for pattern: theme'. That's not decoration — that's Claude actively exploring your code to answer your question."

---

### Slide 3: CLAUDE.md — Project Memory (2.5 min)

**Talking points:**

- CLAUDE.md is a special file that Claude Code reads automatically at the start of every session
- Think of it as a README, but for your AI pair programmer
- It contains: project overview, tech stack, file structure, conventions, common commands, gotchas
- The `/init` command auto-generates one by analyzing your codebase

> "Here's the mental model I want you to have. README.md is the onboarding doc for a new human teammate. CLAUDE.md is the onboarding doc for Claude. And just like a good README, a good CLAUDE.md gets better over time as you add to it."

**What goes in CLAUDE.md:**

- Project description and purpose
- Tech stack and key dependencies
- Directory structure overview
- Build/test/deploy commands
- Coding conventions and patterns
- Known quirks and gotchas

**Important nuance**: `/init` gives you a great starting point, but the real power comes from editing it yourself over time. When you discover that "oh, we always use named exports in this project" or "the API routes follow this specific pattern" — add it to CLAUDE.md. Every future session benefits.

---

### Slide 4: Conversational Exploration vs. Direct Commands (1 min)

**Talking points:**

Two modes of working with Claude Code:

1. **Conversational**: Ask open-ended questions
   - "Explain the architecture of this project"
   - "How does data flow from the API to the charts?"
   - "What testing strategy does this project use?"

2. **Direct**: Give specific commands
   - "Read the file src/app/api/models/route.ts and explain what it does"
   - "Find all files that import the ModelCard component"
   - "Search for TODO comments in the codebase"

> "Both are valid. Conversational is great for exploration — when you don't know what you don't know. Direct is great when you have a specific question. You'll develop an instinct for which to use."

---

### Slide 5: Transition to Practical (0.5 min)

**Talking points:**

> "Enough theory. Let's run `/init` on ai-coderrank and see what Claude discovers about our project. Then we'll have a real conversation about the architecture — API routes, component structure, theme switching, all of it. Switch to your terminal."
