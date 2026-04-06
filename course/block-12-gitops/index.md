---
layout: block
title: "GitOps Finale — ArgoCD & Live Deployment"
block_number: 12
description: "The grand finale. Install ArgoCD, point it at your repo, push code, and watch your dark-themed app go live on the internet — all through GitOps."
time: "~40 min (10 min presentation + 30 min practical)"
features:
  - ArgoCD installation and configuration
  - GitOps continuous delivery
  - NodePort public exposure
  - /loop for real-time monitoring
  - /schedule for recurring tasks
  - Remote control from mobile
objectives:
  - Understand GitOps as a deployment philosophy and why ArgoCD embodies it
  - Install ArgoCD on your existing k3s cluster
  - Configure ArgoCD to watch the ai-coderrank repository
  - Expose the app via NodePort on your droplet's public IP
  - Push the dark theme changes and watch ArgoCD auto-sync them live
  - Use /loop to poll ArgoCD sync status in real time
  - Set up a /schedule task for recurring health checks
  - Access and monitor your app remotely from a phone
overview_url: /course/block-12-gitops/
presentation_url: /course/block-12-gitops/presentation/
hands_on_url: /course/block-12-gitops/hands-on/
locale: en
translation_key: block-12
---
## This Is the Moment

Twelve blocks ago, you typed `claude` in a terminal for the first time. You didn't know what it would do. You didn't know if it was useful or just a toy.

Since then you've explored a codebase without reading a single file yourself. You've planned features with ADRs and diagrams. You've implemented a dark theme through conversation. You've built memory systems, custom skills, hooks, MCP integrations, CI/CD pipelines, and sub-agents. You've provisioned a real server, installed Kubernetes, and deployed your app to actual infrastructure.

But nobody can see it yet. Your app is running on a k3s cluster on a DigitalOcean droplet, behind a firewall, accessible only through port-forwarding. It exists, but it's invisible.

That changes in the next 40 minutes.

By the end of this block, you will push code to GitHub, ArgoCD will detect the change, Kubernetes will update, and anyone with a browser and your droplet's IP address will see your dark-themed ai-coderrank app. Live. On the internet. Deployed through GitOps.

This is the finish line.

## What We'll Cover

1. **GitOps philosophy** — why Git should be the single source of truth for your infrastructure
2. **ArgoCD installation** — getting it running on your k3s cluster
3. **ArgoCD configuration** — pointing it at your repo with `argocd/application.yaml`
4. **The sync loop** — watching ArgoCD detect and apply changes automatically
5. **Public exposure** — NodePort on your droplet's public IP (Ingress optional sidebar)
6. **The big push** — dark theme goes live via GitOps
7. **Monitoring with `/loop`** — real-time polling of sync status
8. **Scheduled tasks with `/schedule`** — recurring health checks
9. **Remote control** — monitoring from your phone

## Why This Block Matters

Here's the thing about deployment: most teams treat it as a separate discipline from development. You write code in one workflow, you deploy it in another, and the two are connected by fragile scripts, manual approvals, and that one person who knows the deployment process.

GitOps eliminates the gap. Your repository IS your deployment. The code you commit IS the infrastructure state. There's no "deployment process" separate from "development process" — there's just pushing to Git. ArgoCD handles the rest.

And here's the part that should genuinely excite you: this is the same pattern used by Spotify, Intuit, Tesla, and dozens of the most conservative banks on the planet. You're not learning a toy workflow. You're learning the real thing.

## Cost Notice

> **This block uses the same DigitalOcean droplet** (s-2vcpu-4gb) you provisioned in Block 7. No additional infrastructure cost. No API key needed -- everything runs through your Pro subscription.

## Prerequisites

- Completed Blocks 0-11 (k3s cluster running, app deployed, CI/CD configured)
- k3s cluster on DigitalOcean droplet (s-2vcpu-4gb, from Block 7) with kubectl access from your laptop
- The ai-coderrank repo pushed to GitHub
- Dark theme changes from Block 4 (committed or ready to push)
- The droplet's public IP address (you'll need it for NodePort access)

## Choose Your Format

Pick the format that matches how you are using the block:

<div class="card-grid">
  <a href="{{ '/course/block-12-gitops/presentation/' | relative_url }}" class="quick-card">
    <h3>Presentation</h3>
    <p>Speaker notes, slide flow, and talking points for the voice-over part of this block.</p>
  </a>

  <a href="{{ '/course/block-12-gitops/hands-on/' | relative_url }}" class="quick-card">
    <h3>Hands-On</h3>
    <p>Copy-pasteable terminal steps and prompts for the screen-sharing implementation part.</p>
  </a>
</div>
