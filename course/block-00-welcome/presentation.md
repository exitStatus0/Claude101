---
layout: block-part
title: "Welcome & Setup"
block_number: 0
description: "Presentation notes and speaking flow for Block 00."
time: "~10 minutes"
part_name: "Presentation"
overview_url: /course/block-00-welcome/
presentation_url: /course/block-00-welcome/presentation/
hands_on_url: /course/block-00-welcome/hands-on/
permalink: /course/block-00-welcome/presentation/
locale: en
translation_key: block-00-presentation
---
**Target duration**: ~10 minutes
**Tone**: High-energy opener. This is the hook. Make them excited to be here.

---

### Slide 1: The Opening Hook (1 min)

**Talking points:**

> "Raise your hand if you've used GitHub Copilot. Or ChatGPT for code. Or pasted a stack trace into an AI chatbot and asked 'what's wrong?'
>
> Great. Now forget all of that.
>
> Claude Code is not autocomplete. It's not just a chat window next to your editor. It's a full AI agent that can read your files, run your commands, edit your code, and reason about your entire project. In this course we're using the terminal-first workflow because it gives you the clearest mental model, but the same product now also shows up in IDEs, desktop, and the web. It's the difference between having someone whisper suggestions in your ear... and having a senior engineer sit down at your desk and pair-program with you."

**Key point**: Set the expectation early — this is agent-based coding, not autocomplete.

---

### Slide 2: What Is Claude Code, Actually? (2 min)

**Talking points:**

- Claude Code started as a terminal-first tool from Anthropic — the company behind Claude
- Today it is available across the terminal, IDEs, desktop, and the web; this course focuses on the terminal because it exposes the core workflow most clearly
- Under the hood, it has access to **tools**: it can Read files, Search (Grep), find files (Glob), Edit code, and run Bash commands
- Think of it as an AI pair programmer with `sudo` access to your project (with safety rails)
- It sees your whole repo — not just the file you have open
- It maintains context across a conversation — you can have a back-and-forth discussion about your architecture, debug a tricky bug step by step, or plan an entire feature

**Analogy**: "IDE copilots are like autocomplete on your phone — helpful, but limited to what's on screen. Claude Code is like calling a colleague who can SSH into your machine and actually look around."

**Fun fact**: "Here's something wild — Claude Code was partially built using Claude Code. Anthropic's engineers used earlier versions of the tool to help develop later versions. It's like a hammer that helped forge a better hammer."

---

### Slide 3: Course Overview — The Map (2 min)

**Talking points:**

> "Here's the journey we're going on. 14 blocks. Each one builds on the last."

Walk through the high-level arc:

1. **Blocks 0-2**: Setup, exploration, and local development (today)
2. **Blocks 3-4**: Planning and making real code changes
3. **Blocks 5-6**: Memory, project intelligence, and custom skills
4. **Blocks 7-8**: Infrastructure — a real K8s cluster on DigitalOcean, with hooks
5. **Blocks 9-10**: MCP servers and GitHub Actions CI/CD
6. **Blocks 11-12**: Sub-agents and the GitOps finale with ArgoCD
7. **Block 13**: Advanced patterns and what's next

> "By the end of this course, you will push a commit, and ArgoCD will automatically deploy your app to a live Kubernetes cluster. No manual kubectl. No SSH-ing into servers. Pure GitOps."

---

### Slide 4: The Course Project — ai-coderrank (2 min)

**Talking points:**

- Show the ai-coderrank screenshot/demo
- It's a Next.js 14 dashboard that compares AI coding models (GPT-4, Claude, Gemini, etc.) by performance and pricing
- Tech stack: React 18, TypeScript, Tailwind CSS, Recharts for visualization
- Has Docker multi-stage builds, K8s manifests, ArgoCD config, GitHub Actions
- Why this project? Because it has everything — frontend, API routes, containerization, orchestration, CI/CD
- It's realistic without being overwhelming. You could ship this at a startup.

> "We picked this project because it touches every layer of a modern web app. Frontend components, API routes, Docker builds, Kubernetes deployments, CI pipelines. If Claude Code can help you navigate and modify this, it can help you with anything in your day job."

---

### Slide 5: Cost Breakdown — No Surprises (1 min)

**Talking points:**

- Anthropic Pro subscription: $20/month — this gives you access to Claude Code
- DigitalOcean droplet (blocks 7+): ~$24/month for a 4GB RAM droplet running k3s
- Total: roughly $44/month while you're actively going through the infrastructure sections
- You can spin down the droplet immediately after the course
- The Pro subscription? That's the one you'll keep. Trust me.

> "I want to be transparent about costs. This isn't a free tool — but it's priced like a Netflix subscription, and it will save you hours every single week. That's not marketing — that's math."

---

### Slide 6: What You Need Before We Start (1 min)

**Talking points:**

Quick checklist — make sure everyone has:

- A terminal they're comfortable in (macOS Terminal, iTerm2, Warp, any Linux terminal)
- Node.js 18 or newer (`node --version`) for the project work we'll do after installation
- Git installed and configured (`git --version`)
- A GitHub account (we'll fork the project)
- An Anthropic account with a Pro subscription — go to [claude.ai](https://claude.ai) to sign up
- Use the current official install path for Claude Code: native installer on macOS/Linux/WSL, Homebrew on macOS if you prefer, or WinGet on Windows

> "If you don't have the Pro sub yet, now's a great time to sign up. You'll need it in about three minutes when we hit the practical section."

---

### Slide 7: Let's Go (1 min)

**Talking points:**

> "Alright, enough talking. Let's install this thing and get our hands dirty. Switch to the practical section — we're about to have our first conversation with Claude Code."

Transition into the practical session.
