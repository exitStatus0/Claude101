---
layout: block
title: "Infrastructure — k3s on DigitalOcean"
block_number: 7
description: "Provision a cloud server, install lightweight Kubernetes, and deploy ai-coderrank as real pods — all guided by Claude Code."
time: "~40 min (10 min presentation + 30 min practical)"
features:
  - Long-form infrastructure tasks
  - Script generation
  - Remote server guidance
  - SSH and kubeconfig management
objectives:
  - Understand why k3s is a great choice for lightweight Kubernetes
  - Provision a DigitalOcean droplet with Claude's help
  - Install k3s and verify the cluster is running
  - Copy kubeconfig locally for remote kubectl access
  - Deploy ai-coderrank K8s manifests to the cluster
  - Verify pods are running and port-forward to test
overview_url: /course/block-07-infrastructure/
presentation_url: /course/block-07-infrastructure/presentation/
hands_on_url: /course/block-07-infrastructure/hands-on/
quiz_url: /course/block-07-infrastructure/quiz/
locale: en
translation_key: block-07
---
## From Localhost to the Real World

Everything up to this point has been local. Your app runs on your machine, your Docker builds happen on your machine, your kubectl points at a local context. That changes now.

In this block, you go from "it works on my machine" to "it works on a server I can SSH into from anywhere." That's a massive mental shift. Suddenly you care about firewall rules, SSH keys, disk space, and network connectivity. Suddenly "deploy" means something real.

And here's the exciting part — Claude Code is genuinely useful for infrastructure work. Not because it replaces knowing what you're doing, but because it remembers the 47 flags you always forget, generates scripts you'd otherwise spend 20 minutes writing, and walks you through multi-step server setup without losing track of where you are.

## What We'll Cover

1. **Why k3s** — full Kubernetes in a single binary that runs on a $24/month server
2. **Provisioning a droplet** — Claude generates the setup script or walks you through the DO console
3. **Installing k3s** — one curl command, but understanding what it does
4. **Verifying the cluster** — nodes, system pods, and making sure everything is healthy
5. **Copying kubeconfig** — so you can kubectl from your laptop
6. **Deploying ai-coderrank** — applying the K8s manifests you've been reviewing
7. **Port-forwarding to verify** — seeing your app running on real infrastructure

## Why This Block Matters

There's a saying in DevOps: "Infrastructure is code you're afraid to run twice."

Claude Code takes some of that fear away. When you're SSHed into a remote server and not sure what the next step is, Claude can generate the exact command, explain what it does before you run it, and troubleshoot when something goes wrong. It doesn't replace your judgment — you still decide whether to hit Enter — but it dramatically reduces the "staring at a blank terminal wondering what to type" phase.

By the end of this block, you'll have a real Kubernetes cluster running your real application on a real server. That's not a simulation. That's production infrastructure.

## Cost Notice

> **This block requires a DigitalOcean droplet** (s-2vcpu-4gb, $24/month). New DigitalOcean accounts get **$200 in free credit** for 60 days, which is more than enough for the entire course. See the <a href="{{ '/resources/cost-guide/' | relative_url }}">Cost Guide</a> for details.
>
> No API key is needed -- everything runs through your Pro subscription.

## Prerequisites

- Completed Blocks 0-6 (skills and memory configured)
- A DigitalOcean account (or willingness to create one -- **s-2vcpu-4gb** droplet at $24/month, free with new-account credit)
- An SSH key pair on your local machine (`~/.ssh/id_ed25519` or similar)
- The ai-coderrank project with K8s manifests in `k8s/`

---

## Choose Your Format

Pick the format that matches how you are using the block:

<div class="card-grid">
  <a href="{{ '/course/block-07-infrastructure/presentation/' | relative_url }}" class="quick-card">
    <h3>Presentation</h3>
    <p>Speaker notes, slide flow, and talking points for the voice-over part of this block.</p>
  </a>

  <a href="{{ '/course/block-07-infrastructure/hands-on/' | relative_url }}" class="quick-card">
    <h3>Hands-On</h3>
    <p>Copy-pasteable terminal steps and prompts for the screen-sharing implementation part.</p>
  </a>

  <a href="{{ '/course/block-07-infrastructure/quiz/' | relative_url }}" class="quick-card">
    <h3>Quiz</h3>
    <p>Test your knowledge from this block with 6-8 questions.</p>
  </a>
</div>
