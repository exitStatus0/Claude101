---
layout: block-part
title: "Planning with ADRs & Diagrams"
block_number: 3
description: "Presentation notes and speaking flow for Block 03."
part_name: "Presentation"
overview_url: /course/block-03-planning-adrs/
presentation_url: /course/block-03-planning-adrs/presentation/
hands_on_url: /course/block-03-planning-adrs/hands-on/
quiz_url: /course/block-03-planning-adrs/quiz/
permalink: /course/block-03-planning-adrs/presentation/
locale: en
translation_key: block-03-presentation
---
**Duration**: ~10 minutes
**Goal**: Convince students that planning with AI is a superpower, not a bottleneck. Introduce Plan mode, ADRs, and Mermaid diagrams.

---

### Opening Hook (1 min)

**Say something like:**

> "Raise your hand if you've ever started a 'quick change' that turned into a two-day refactor. Yeah — me too. Now imagine that, but with an AI that can edit 30 files per minute. Without a plan, AI doesn't just help you dig a hole faster — it helps you dig the *wrong* hole faster.
>
> This block is about the single habit that separates people who are productive with AI from people who are just busy with AI: **planning before doing**."

**Key point:** Speed without direction is just chaos. Plan mode turns Claude from a code-generating machine gun into a precision instrument.

---

### Plan Mode — Think Before You Act (3 min)

#### What is Plan mode?

- Two ways to enter it:
  - Type `/plan` in the conversation
  - Press **Shift+Tab** to toggle between Plan and Act modes
- In Plan mode, Claude will **analyze, reason, and outline** — but it will NOT edit files, run commands, or make changes
- Think of it as the difference between a surgeon studying the MRI before picking up the scalpel

#### What you get from Plan mode:

- A list of files that need to change
- The order of operations
- Potential risks or breaking changes
- An opportunity to say "no, actually, let's do it differently"

#### Why it matters:

- **Context is expensive.** Every wrong turn burns tokens and time. A 2-minute plan can save 20 minutes of backtracking.
- **It's a communication tool.** Plan mode output is something you can paste into a PR description, share with your team, or use as a checklist.
- **It catches misunderstandings early.** If Claude's plan doesn't match what you had in mind, you find out *before* it edits 15 files.

**Show on screen:** Toggle Shift+Tab in Claude Code and show how the mode indicator changes.

---

### Architecture Decision Records (3 min)

#### What are ADRs?

> "ADRs are like commit messages for decisions. A commit message tells you *what* changed. An ADR tells you *why*."

- Lightweight markdown documents
- Typically follow a standard template: Title, Status, Context, Decision, Consequences
- Numbered sequentially: `001-dark-theme.md`, `002-add-caching.md`, etc.
- Live in the repo — right next to the code they describe

#### Why ADRs and not a wiki/Confluence/Notion?

- **They're version-controlled.** The decision record evolves with the code.
- **They're discoverable.** `ls docs/adr/` — done. No searching through a wiki.
- **They survive team turnover.** People leave. Repos stay.
- **They're PR-reviewable.** Someone can comment "I disagree with this decision" right in the code review.

#### The template we'll use:

```
# ADR-001: [Title]
- Status: [Proposed / Accepted / Deprecated / Superseded]
- Date: [Date]
- Context: [Why are we making this decision?]
- Decision: [What did we decide?]
- Consequences: [What happens as a result?]
- Alternatives Considered: [What else did we think about?]
```

**Fun fact:** ADRs were popularized by Michael Nygard in 2011. They've since been adopted by teams at GitHub, Spotify, and Shopify. The format is intentionally short — if your ADR is longer than one screen, it's probably a design doc, not a decision record.

---

### Mermaid Diagrams — Diagrams as Code (2 min)

#### What is Mermaid?

- A text-based diagramming language
- You write something like:
  ```
  graph LR
    A[User :30080] --> B[NodePort]
    B --> C[Service]
    C --> D[Pod :3000]
  ```
  ...and it renders as an actual diagram
- GitHub, GitLab, and Notion all render Mermaid natively in markdown files

#### Why Mermaid for infrastructure docs?

- **Diffable.** When you add a new service, the diagram change shows up in the PR diff.
- **No external tools.** No Lucidchart, no draw.io, no "where's the Figma link?"
- **Claude is great at generating them.** Describe your architecture in plain English, get a diagram back. Iterate until it's right.

#### The three diagrams we'll create:

1. **Infrastructure topology** — DigitalOcean Droplet > k3s cluster > pods and services
2. **Traffic flow** — User > NodePort 30080 > Service > Pod :3000 (how a request reaches the app)
3. **Deployment pipeline** — git push > GitHub Actions > Docker build > registry > ArgoCD > k3s

**Show on screen:** A quick example of a Mermaid diagram rendered on GitHub.

---

### The Dark Theme Plan (1 min)

#### Setting up the practical:

> "In the practical, we're going to plan the dark theme change for ai-coderrank. Not implement it — that's Block 4. Just plan it.
>
> Here's what we'll ask Claude to do:
> 1. Enter Plan mode and analyze the current theme system
> 2. Create an ADR explaining *why* we're adding a dark theme
> 3. Generate three Mermaid diagrams documenting our infrastructure
> 4. Review everything and make sure we're happy before we write a line of code
>
> By the end, we'll have a plan we're confident in, documentation that would impress any code reviewer, and a clear roadmap for Block 4."

---

### Closing (30 sec)

> "Planning isn't the opposite of moving fast. Planning *is* moving fast — you just front-load the thinking. Let's go do it."

---

### Common Student Questions

**Q: Can I use Plan mode for everything?**
A: You *can*, but it's most valuable for multi-file changes, architecture decisions, or anything where you'd normally sketch on a whiteboard first. For a quick bug fix? Just ask Claude directly.

**Q: Do ADRs replace design docs?**
A: No. ADRs are for *decisions*. Design docs are for *designs*. An ADR might say "We chose PostgreSQL over MongoDB." A design doc would explain the schema, indexing strategy, and migration plan. ADRs are minutes; design docs are hours.

**Q: Does Mermaid support every kind of diagram?**
A: Most of them — flowcharts, sequence diagrams, class diagrams, state diagrams, Gantt charts, ER diagrams, and more. It doesn't replace specialized tools for complex UML, but for infrastructure and flow diagrams it's excellent.
