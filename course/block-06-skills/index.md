---
layout: block
title: "Custom Skills — Your Team's Playbook"
block_number: 6
description: "Build reusable slash commands that encode your team's best practices — Kubernetes reviews, Dockerfile audits, and one-command explanations."
time: "~33 min (8 min presentation + 25 min practical)"
features:
  - Custom Skills (.claude/skills/)
  - SKILL.md Frontmatter
  - "$ARGUMENTS"
  - "/simplify"
  - allowed-tools
objectives:
  - Understand skills as reusable, parameterized AI workflows
  - Create a K8s manifest review skill with allowed-tools restrictions
  - Create a Dockerfile audit skill that checks for best practices
  - Build a parameterized skill using $ARGUMENTS
  - Use the built-in /simplify skill on existing code
  - Know the difference between restricted and unrestricted skills
overview_url: /course/block-06-skills/
presentation_url: /course/block-06-skills/presentation/
hands_on_url: /course/block-06-skills/hands-on/
locale: en
translation_key: block-06
---
## From Knowledge to Action

Block 5 taught Claude what your team _knows_. This block teaches Claude what your team _does_.

Think about the playbooks that exist in every team — usually buried in a wiki page nobody reads or in the head of that one senior engineer who's been here since the beginning. "Before you deploy a new service, check these twelve things." "When reviewing Dockerfiles, look for these five antipatterns." "If a K8s pod keeps restarting, run these commands in this order."

Skills turn those playbooks into single commands. `/review-k8s` instead of a 15-point mental checklist. `/check-docker` instead of "ask Sarah, she knows what to look for." `/explain main.go` instead of reading code for 20 minutes before understanding what it does.

## What We'll Cover

1. **What skills are** — reusable slash commands defined in `.claude/skills/`
2. **SKILL.md anatomy** — frontmatter, instructions, and the `$ARGUMENTS` variable
3. **Built-in skills** — `/simplify`, and what ships out of the box
4. **Two custom skills from scratch** — a K8s reviewer and a Dockerfile auditor
5. **Parameterized skills** — passing arguments to make skills flexible
6. **`allowed-tools` restrictions** — controlling what a skill can and cannot do

## Why This Block Matters

Here's a question: how do you scale expertise?

You can write documentation (nobody reads it). You can do pair programming (doesn't scale). You can set up linters (catches syntax, not architecture). You can hope people learn from code reviews (takes months).

Or you can encode your expertise into a skill that anyone on the team can run with a single slash command. A junior engineer runs `/review-k8s` and gets the same review quality as your most experienced SRE. A contractor runs `/check-docker` and catches the same issues your lead DevOps engineer would.

Skills are how tribal knowledge becomes institutional knowledge — and they're shockingly easy to create.

## Prerequisites

- Completed Blocks 0-5 (memory system configured)
- The ai-coderrank project with K8s manifests and Dockerfile
- Familiarity with the `.claude/` directory structure from Block 5

---

## Choose Your Format

Pick the format that matches how you are using the block:

<div class="card-grid">
  <a href="{{ '/course/block-06-skills/presentation/' | relative_url }}" class="quick-card">
    <h3>Presentation</h3>
    <p>Speaker notes, slide flow, and talking points for the voice-over part of this block.</p>
  </a>

  <a href="{{ '/course/block-06-skills/hands-on/' | relative_url }}" class="quick-card">
    <h3>Hands-On</h3>
    <p>Copy-pasteable terminal steps and prompts for the screen-sharing implementation part.</p>
  </a>
</div>
