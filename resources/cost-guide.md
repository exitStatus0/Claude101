---
layout: resource
title: "Cost Guide"
purpose: "Make cost decisions obvious in one screen."
verified: "2026-04-06"
permalink: /resources/cost-guide/
summary_cards:
  - label: "Minimum"
    value: "$20"
    note: "Claude Pro only"
  - label: "Recommended"
    value: "~$44/mo"
    note: "Pro + DO droplet"
  - label: "With Block 10"
    value: "~$45-50"
    note: "Adds API key"
locale: en
translation_key: cost-guide
---

## At A Glance

| Item | Cost | Required? |
|------|------|-----------|
| Claude Pro | $20/mo | Yes |
| DO droplet (s-2vcpu-4gb) | $24/mo | Blocks 7, 12 |
| Anthropic API key | ~$1-5 total | Block 10 only |
| Domain | ~$10/yr | Optional |

DigitalOcean gives new accounts **$200 in free credit** (60 days) -- enough to cover the entire course.

## Required Costs

### Claude Pro ($20/mo)

- **Included**: Claude Code in terminal, IDE, desktop, and web
- **Models**: Sonnet (default) + Haiku
- **Usage**: metered, shared with Claude chat -- not unlimited
- **Opus**: available on Max plan ($100/mo), not Pro
- Details at [anthropic.com/pricing](https://anthropic.com/pricing)

### DigitalOcean Droplet ($24/mo)

- **s-2vcpu-4gb** -- locked recommendation, do not go smaller
- New accounts get **$200 free credit** (valid 60 days)
- **Tear down after the course** to stop charges -- your code lives in git, the droplet is disposable

## Optional Costs

<div class="card-grid card-grid--compact">
  <div class="quick-card">
    <span class="badge badge-optional">Optional</span>
    <h3>Block 10 API key</h3>
    <p>~$1-5 total. Pay-per-token for the Claude GitHub Action. Skip Block 10 entirely if you want to avoid this cost.</p>
  </div>

  <div class="quick-card">
    <span class="badge badge-optional">Optional</span>
    <h3>Domain</h3>
    <p>~$10/yr. Not needed for the course.</p>
  </div>
</div>

## Which Plan Do I Need?

| Plan | Price | What you get in Claude Code |
|------|-------|-----------------------------|
| **Pro** | $20/mo | Sonnet + Haiku -- sufficient for the whole course |
| **Max** | $100/mo | Opus access, higher limits -- for heavy usage |
| **Team** | varies | Depends on seat type -- see caveat below |

<div class="callout-important" markdown="1">

**Team plans**: Standard Team seats do **not** include Claude Code. Check with your admin or see [Anthropic's Team plan docs](https://support.anthropic.com/en/articles/9267289-how-is-my-team-plan-bill-calculated) before purchasing.

</div>

## API Pricing

<div class="callout-optional" markdown="1">

Approximate rates as of April 2026 -- **these are volatile and may change**.

| Model | Input | Output |
|-------|-------|--------|
| Claude Sonnet | $3/MTok | $15/MTok |
| Claude Opus | $15/MTok | $75/MTok |
| Claude Haiku | $0.80/MTok | $4/MTok |

Always check [anthropic.com/pricing](https://anthropic.com/pricing) for current rates.

</div>

## How To Spend Less

- `/compact` often -- compresses conversation, saves tokens
- `--model haiku` for simple tasks
- `/clear` between unrelated tasks
- `--max-turns` in scripts to cap iterations
- `/cost` in session to check spend

## Budget Paths

### $20 path

Pro only. Skip DO blocks (7, 12). Focus on learning Claude Code features, hooks, MCP, and agents locally.

### $25-45 path

Full course. Pro + DO droplet. With free credit the real cost is closer to **~$20** for the first two months.

### Team / company path

Max or Team plan, company covers infra. Use your org's cloud account for the droplet.

---

Need a tailored path? <a href="{{ '/mentoring/' | relative_url }}">Get mentoring</a>.
