---
layout: block
title: "Welcome & Setup"
block_number: 0
description: "Install Claude Code, authenticate, and have your first AI conversation inside a real codebase."
time: "~25 min (10 min presentation + 15 min practical)"
features:
  - Installation
  - Authentication
  - /help
  - Basic Conversation
objectives:
  - Install Claude Code from the official installer
  - Authenticate with an Anthropic Pro subscription
  - Run your first interactive session and use /help
  - Fork and clone the ai-coderrank project
  - Launch Claude Code inside a real Next.js codebase and see it orient itself
---

## The Starting Line

Every tool has a moment where it clicks. For `git`, it was the first time you realized you could undo anything. For Docker, it was the first time `docker run` gave you a running database in two seconds. For Claude Code, that moment is about to happen — right now.

This block gets you from zero to your first real conversation with an AI agent that can read your code, run your commands, and explain what it finds. Not autocomplete. Not a chatbot with a text box. A full-blown agent living in your terminal.

## What We'll Cover

1. **What Claude Code actually is** — and why it's fundamentally different from IDE copilots
2. **Installation** — one command, done in under a minute
3. **Authentication** — connecting your Anthropic Pro subscription
4. **First run** — launching `claude` and getting oriented with `/help`
5. **The course project** — forking `ai-coderrank` and letting Claude see it for the first time

## The Course Project: ai-coderrank

Throughout this course, we'll work with **ai-coderrank** — a Next.js 14 dashboard that compares AI coding models by performance and pricing. It's a real application with real infrastructure:

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Recharts
- **Backend**: Next.js API routes
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes manifests
- **GitOps**: ArgoCD configuration
- **CI/CD**: GitHub Actions workflows

This isn't a toy project. It's exactly the kind of codebase you'd encounter on the job — and the perfect playground for learning Claude Code.

## Prerequisites

- A terminal (macOS Terminal, iTerm2, or any Linux terminal)
- Node.js 18+ installed
- Git installed and configured
- A GitHub account
- An Anthropic Pro subscription ($20/month)

## Cost Breakdown

Let's talk money upfront — no surprises:

| Item | Cost |
|------|------|
| Anthropic Pro subscription | $20/month |
| DigitalOcean droplet (later blocks) | ~$24/month |
| GitHub account | Free |
| **Total** | **~$44/month** |

You can cancel the DigitalOcean droplet the moment you finish the infrastructure blocks. The Pro subscription is the only ongoing cost, and honestly — once you see what Claude Code can do, you won't want to cancel it.

## Part 1: Presentation {#presentation}

**Target duration**: ~10 minutes
**Tone**: High-energy opener. This is the hook. Make them excited to be here.

---

### Slide 1: The Opening Hook (1 min)

**Talking points:**

> "Raise your hand if you've used GitHub Copilot. Or ChatGPT for code. Or pasted a stack trace into an AI chatbot and asked 'what's wrong?'
>
> Great. Now forget all of that.
>
> Claude Code is not autocomplete. It's not a chat window next to your editor. It's a full AI agent that lives in your terminal — it reads your files, runs your commands, edits your code, and reasons about your entire project. It's the difference between having someone whisper suggestions in your ear... and having a senior engineer sit down at your desk and pair-program with you."

**Key point**: Set the expectation early — this is agent-based coding, not autocomplete.

---

### Slide 2: What Is Claude Code, Actually? (2 min)

**Talking points:**

- Claude Code is a CLI tool from Anthropic — the company behind Claude
- It runs in your terminal, not in a browser, not in an IDE plugin
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
- Node.js 18 or newer (`node --version`)
- Git installed and configured (`git --version`)
- A GitHub account (we'll fork the project)
- An Anthropic account with a Pro subscription — go to [claude.ai](https://claude.ai) to sign up

> "If you don't have the Pro sub yet, now's a great time to sign up. You'll need it in about three minutes when we hit the practical section."

---

### Slide 7: Let's Go (1 min)

**Talking points:**

> "Alright, enough talking. Let's install this thing and get our hands dirty. Switch to the practical section — we're about to have our first conversation with Claude Code."

Transition into the practical session.

## Part 2: Hands-On {#practical}

> **Duration**: ~15 minutes
> **Outcome**: Claude Code installed, authenticated, and running inside the ai-coderrank project with a successful first conversation
> **Prerequisites**: Node.js 18+, Git, GitHub account, Anthropic Pro subscription

---

### Step 1: Install Claude Code

Open your terminal and install Claude Code via npm:

```bash
npm install -g @anthropic-ai/claude-code
```

That's it. One line. You need Node.js 18+ installed first (check with `node --version`). The npm package handles everything.

**Verify the installation:**

```bash
claude --version
```

You should see a version number printed. If you see `command not found`, restart your terminal (or run `source ~/.zshrc` / `source ~/.bashrc`) so your PATH picks up the new binary.

> **Note for the video**: Show the full install process on screen. It usually takes about 10-15 seconds. The install is a standard `npm install -g` — no curl piping, no Homebrew tap, no downloading a .dmg.

---

### Step 2: Authenticate

Now launch Claude Code for the first time:

```bash
claude
```

On first run, Claude Code will prompt you to authenticate. Follow the on-screen instructions — it will open a browser window where you sign into your Anthropic account and authorize Claude Code.

**Requirements**: You need an active Anthropic Pro subscription ($20/month, recommended for this course). Claude Code is included with Pro and Max plans. Pro gives you Sonnet and Haiku in Claude Code — that's all you need for this course. See the [Cost Guide]({{ '/resources/cost-guide' | relative_url }}) for details.

After authentication succeeds, you'll land in an interactive session. You should see a prompt that looks something like:

```
claude >
```

Congratulations — you're in. But before we start chatting, let's learn the controls.

> **Note for the video**: Show the auth flow on screen. If you already authenticated before recording, you can mention that Claude Code remembers your session — you don't need to log in every time.

---

### Step 3: Explore /help

While still in the Claude Code session, type:

```
/help
```

This shows you all available slash commands. Take a moment to scan through them. The ones we'll use most in this course:

| Command | What it does |
|---------|-------------|
| `/help` | Shows all available commands |
| `/init` | Generates a CLAUDE.md file for your project |
| `/clear` | Clears conversation history and starts fresh |
| `/compact` | Summarizes the conversation to save context window space |
| `/cost` | Shows how many tokens you've used in this session |

> **What to say on video**: "Think of `/help` as your cheat sheet. When you forget a command — and you will, because there are a lot of them — just type `/help` and it's all right there."

**Try a quick conversation:**

Type something simple to verify everything works:

```
What can you help me with?
```

Claude will respond with an overview of its capabilities. Notice how it mentions reading files, running commands, editing code — these aren't just claims, these are actual tools it has access to. We'll see them in action very soon.

Now exit the session:

```
/exit
```

---

### Step 4: Fork and Clone ai-coderrank

Head to the course project repository on GitHub:

```
https://github.com/exitStatus0/ai-coderrank
```

**Fork the repo** using the GitHub UI (click the "Fork" button in the top right).

Then clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/ai-coderrank.git
cd ai-coderrank
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**Quick sanity check** — make sure the project files are there:

```bash
ls
```

You should see the Next.js project structure: `package.json`, `src/`, `public/`, `Dockerfile`, `k8s/`, `.github/`, and more.

> **Note for the video**: Show the fork process on GitHub. Then show the clone command and the file listing. Point out the key directories — src for application code, k8s for Kubernetes manifests, .github for CI workflows.

---

### Step 5: Run Claude Code Inside the Project

This is the moment. Navigate into the project directory (if you aren't already there) and launch Claude Code:

```bash
cd ai-coderrank
claude
```

Now ask Claude something about the project:

```
What is this project? Give me a quick summary.
```

**Watch what happens.** Claude doesn't just guess based on the directory name. It actively reads files — you'll see it access `package.json`, `README.md`, maybe peek at `src/` — to build a real understanding of what this project does.

**Try a few more questions:**

```
What tech stack does this project use?
```

```
What does the file structure look like?
```

```
Are there any Docker or Kubernetes configs in this project?
```

Notice how Claude cites specific files and paths in its answers. It's not hallucinating — it's reading your actual codebase. This is the fundamental difference between Claude Code and a generic chatbot.

> **What to say on video**: "See those file reads happening? Claude is literally opening files on your machine and reading them. It's not guessing. It's not pulling from some training data about generic Next.js projects. It's reading YOUR code, right now, in real time."

---

### Step 6: Check Your Token Usage

Before wrapping up, let's see what that conversation cost:

```
/cost
```

This shows you the token count for the current session. In a typical first conversation, you'll use a relatively small number of tokens — the real usage comes when Claude starts reading many files and making edits (which we'll do starting in Block 1).

> **Note for the video**: Show the /cost output. Emphasize that the Pro plan includes generous usage, and for most development tasks you won't come close to hitting limits.

---

### Step 7: Exit

Clean exit:

```
/exit
```

---

### What Just Happened?

Let's recap what we accomplished:

1. **Installed** Claude Code with `npm install -g`
2. **Authenticated** with our Anthropic Pro subscription
3. **Explored** the `/help` system to see available commands
4. **Forked and cloned** the ai-coderrank project — our course companion
5. **Had our first conversation** with Claude Code inside a real codebase
6. **Watched Claude read actual files** to answer questions about our project

You now have a working Claude Code setup pointed at a real Next.js application. In the next block, we'll go much deeper — using `/init` to generate a CLAUDE.md file and having Claude explain the architecture, API routes, and component structure in detail.

---

### Troubleshooting

**"command not found: claude"**
Restart your terminal or source your shell config: `source ~/.zshrc` or `source ~/.bashrc`.

**Authentication fails or times out**
Make sure you have an active Pro subscription at [claude.ai](https://claude.ai). Free tier does not include Claude Code access.

**"Permission denied" during install**
If `npm install -g` fails with permission errors, either fix your npm global prefix (`npm config set prefix ~/.npm-global` and add `~/.npm-global/bin` to your PATH) or use a Node version manager like `nvm` which avoids this issue entirely.
