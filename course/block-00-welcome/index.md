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
overview_url: /course/block-00-welcome/
presentation_url: /course/block-00-welcome/presentation/
hands_on_url: /course/block-00-welcome/hands-on/
quiz_url: /course/block-00-welcome/quiz/
locale: en
translation_key: block-00
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

## Choose Your Format

Pick the format that matches how you are using the block:

<div class="card-grid">
  <a href="{{ '/course/block-00-welcome/presentation/' | relative_url }}" class="quick-card">
    <h3>Presentation</h3>
    <p>Speaker notes, slide flow, and talking points for the voice-over part of this block.</p>
  </a>

  <a href="{{ '/course/block-00-welcome/hands-on/' | relative_url }}" class="quick-card">
    <h3>Hands-On</h3>
    <p>Copy-pasteable terminal steps and prompts for the screen-sharing implementation part.</p>
  </a>

  <a href="{{ '/course/block-00-welcome/quiz/' | relative_url }}" class="quick-card">
    <h3>Quiz</h3>
    <p>Test your knowledge from this block with 6-8 questions.</p>
  </a>
</div>
