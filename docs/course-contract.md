# Course Contract / Brief

> This document freezes the course scope and removes ambiguity.
> Any change to scope, tooling, or infrastructure must be reflected here first.

---

## Target Audience

- Junior and mid-level DevOps engineers, SRE, QA engineers, software developers
- People wanting to start using AI in daily technical work (AI-curious practitioners)
- **They already know:** git, terminal, basic Docker concepts
- **They DON'T need to know:** Kubernetes, ArgoCD, Claude Code

---

## Skill Level

- **Entry:** comfortable with CLI and git
- **Exit:** can use Claude Code for infrastructure, CI/CD, planning, and daily workflows

---

## Course Promise

> "You will deploy a real application to Kubernetes on the public internet using Claude Code as your primary tool — learning progressively from basic commands to multi-agent orchestration."

---

## Exact End State

- **ai-coderrank** app with dark theme
- Running on **k3s** on a DigitalOcean **s-2vcpu-4gb** droplet
- Deployed via **ArgoCD** (GitOps)
- Accessible via **NodePort** on the droplet's public IP (port 30080)
- Traefik Ingress, domain, and TLS are **optional** (sidebar only)
- CI/CD pipeline with **GitHub Actions + Claude Code**
- Container images on **GHCR** (GitHub Container Registry)

---

## Fixed Infrastructure Path (Default Happy Path)

| Component | Choice | Why |
|-----------|--------|-----|
| Cloud Provider | DigitalOcean | Simple, cheap, good for learning |
| Droplet Size | s-2vcpu-4gb ($24/mo) | Minimum for k3s + ArgoCD + app |
| OS | Ubuntu 22.04 LTS | Standard, well-documented |
| K8s Distribution | k3s | Single binary, lightweight, production-ready |
| Public Exposure | NodePort (port 30080) | Simple, no Ingress config needed. Traefik Ingress available as optional sidebar |
| Container Registry | GHCR (ghcr.io) | Free for public repos, integrated with GitHub |
| GitOps | ArgoCD | Industry standard, good UI |
| CI/CD | GitHub Actions | Where the code lives |
| Domain | Optional sidebar | Public IP works fine for the course |
| TLS | Optional sidebar | Not needed for learning k3s |
| Load Balancer | **NOT used** | NodePort exposes the app directly, saves $12/mo |
| Monitoring | kubectl logs + ArgoCD health + readiness/liveness probes + `/loop` | Minimal, sufficient |

---

## Budget Ceiling

| Item | Cost | Required |
|------|------|----------|
| Claude Pro | $20/mo | Yes (all blocks) |
| DO Droplet | $24/mo | Yes (blocks 7, 12). Free with new account $200 credit |
| Anthropic API Key | ~$1-5 total | Only Block 10 (GitHub Actions). Skippable. |
| Domain | ~$10/yr | Optional |
| **Max total** | **~$45** | |

All pricing as of April 2026.

---

## Mandatory vs Optional

**Mandatory:** Blocks 0-9, 11-12 (core path to deployed app)

**Optional/Skippable:** Block 10 (GitHub Actions - needs API key), Block 13 (advanced patterns - no infra changes)

**Optional Sidebars:** Domain setup, TLS, multi-node k3s, external LB, Prometheus/Grafana

---

## Observability Scope (Minimum)

### What we teach

- Readiness and liveness probes in K8s manifests
- `kubectl logs` for debugging
- ArgoCD sync health status
- `/loop` for polling and monitoring
- Scheduled health check tasks
- `metrics-server` for basic `kubectl top`

### What we DON'T teach (mention as next steps)

- Prometheus/Grafana stack
- Centralized logging (EFK/Loki)
- Distributed tracing
- Sentry/error tracking

---

## Definition of "Done"

A student has completed the course when:

1. Claude Code is installed and authenticated
2. ai-coderrank repo is forked and explored with Claude
3. Dark theme is implemented and committed
4. CLAUDE.md, rules, and custom skills are configured
5. k3s cluster is running on DO droplet
6. Hooks, MCP servers are configured
7. App is deployed via ArgoCD and accessible via public IP
8. Student understands sub-agents and can create custom ones

---

## Content Quality Rules

- Every Claude Code feature claim must be verifiable against official docs
- Separate "course recommendation" from "product fact" (e.g., "we use Sonnet for this course" vs "Sonnet is the default model")
- All pricing dated ("as of April 2026")
- Every block has: outcome, prerequisites, presentation goal, practical steps, expected result, common failure modes, handoff
- Unstable/experimental features labeled as such
