---
layout: block-part
title: "Running & Testing Locally"
block_number: 2
description: "Presentation notes and speaking flow for Block 02."
time: "~8 minutes"
part_name: "Presentation"
overview_url: /course/block-02-running-testing/
presentation_url: /course/block-02-running-testing/presentation/
hands_on_url: /course/block-02-running-testing/hands-on/
quiz_url: /course/block-02-running-testing/quiz/
permalink: /course/block-02-running-testing/presentation/
locale: en
translation_key: block-02-presentation
---
**Target duration**: ~8 minutes
**Tone**: "Now Claude stops being read-only and starts doing things. This is where it gets exciting."

---

### Slide 1: Claude as an Operator (2 min)

**Talking points:**

> "Up until now, Claude has been reading. It looked at your files, searched for patterns, explained architecture. Impressive — but passive.
>
> Starting now, Claude becomes an operator. It can run commands. It can install dependencies, start servers, execute tests, build Docker images. And when something goes wrong — and it will — it reads the error output and tries to fix it."

- The Bash tool is what makes Claude Code an *agent* rather than just an *assistant*
- Under the hood, Claude sends a command to your shell, reads stdout and stderr, and reasons about the output
- It's like having a junior developer who can run anything you tell them, but — critically — they also understand the output

**Analogy**: "Think of it this way. Block 1 was like having a colleague who can read the codebase and explain it. Block 2 is like giving that colleague a terminal. Same intelligence, now with the ability to act."

---

### Slide 2: The Permission Model — Safety First (2 min)

**Talking points:**

> "Before you get nervous about an AI running commands on your machine — let's talk about the permission model. Because Anthropic clearly thought about this."

- Claude Code asks for permission before running any command
- You see exactly what it wants to execute before you approve
- There's a clear prompt: the command is shown, and you type `y` or `n`
- This applies to everything: npm install, starting servers, writing files, running scripts

**Why this matters:**

- You stay in the loop — no surprise `rm -rf` moments
- You build trust gradually — after a few sessions, you'll approve routine commands quickly
- It's a teaching tool — watching what Claude wants to run teaches you how it thinks
- You can configure trust levels later (auto-approve safe commands, always prompt for dangerous ones)

> "The permission model is not a limitation. It's a feature. It means you can hand Claude Code to a junior developer and know they won't accidentally nuke the database — because they have to approve every command."

**Quick demo note**: "In the practical, you'll see these permission prompts in action. You'll see Claude ask to run `npm install`, `npm test`, `docker build`. Each time, you decide. That's the deal."

---

### Slide 3: The Error Handling Loop (2 min)

**Talking points:**

This is arguably the most valuable pattern in Claude Code:

1. Claude runs a command
2. The command fails (error in stdout/stderr)
3. Claude reads the error output
4. Claude figures out what went wrong
5. Claude proposes a fix
6. You approve the fix
7. Claude runs the command again

> "This is the loop that saves you the most time in practice. Not the code generation. Not the file reading. The error handling. Because how many hours of your career have you spent staring at a stack trace, googling the error message, trying solutions from Stack Overflow?
>
> Claude does that loop in seconds. It reads the error, has the context of your entire codebase, and usually gets it right on the first try."

**Real example**: "In the practical, we're going to deliberately break something — introduce a type error, mess up an import — and watch Claude detect it, diagnose it, and fix it. All in one fluid sequence."

---

### Slide 4: Context Management — /clear and /compact (1.5 min)

**Talking points:**

- Claude has a context window — a maximum amount of conversation it can hold at once
- Long sessions eventually fill it up, which can slow things down
- Two tools to manage this:

**`/clear`** — complete reset
- Wipes the entire conversation
- Use when switching tasks: "I'm done debugging, now I want to work on a new feature"
- Like closing all browser tabs

**`/compact`** — smart compression
- Claude summarizes the conversation into a compressed form
- Keeps the key facts, drops the verbose back-and-forth
- Use when you're deep into a task and want to keep going
- Like bookmarking important tabs and closing the rest

> "Here's my rule of thumb: if I'm changing topics, I `/clear`. If I'm still working on the same thing but the conversation is getting long, I `/compact`. Simple as that."

---

### Slide 5: Transition (0.5 min)

**Talking points:**

> "Time to get hands-on. We're going to set up the project, run the full test suite, build a Docker image, and then — my favorite part — deliberately break something and watch Claude fix it. Let's go."
