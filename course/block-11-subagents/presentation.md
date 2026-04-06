---
layout: block-part
title: "Sub-agents — Specialized Workers"
block_number: 11
description: "Presentation notes and speaking flow for Block 11."
part_name: "Presentation"
overview_url: /course/block-11-subagents/
presentation_url: /course/block-11-subagents/presentation/
hands_on_url: /course/block-11-subagents/hands-on/
quiz_url: /course/block-11-subagents/quiz/
permalink: /course/block-11-subagents/presentation/
locale: en
translation_key: block-11-presentation
---
> **Duration**: ~10 minutes
> **Goal**: Students understand sub-agents as delegated AI workers with their own prompts, tools, and models -- and why decomposition beats a single overloaded session.

---

### Slide 1: The Manager and the Team

Let me give you an analogy.

You are the engineering manager. Claude Code is your right hand -- your senior engineer who can do a bit of everything. But even the best senior engineer does not personally handle every task. They delegate.

"Hey, can someone from the security team eyeball this PR?"
"Can the SRE on call validate these manifests before we ship?"
"Can someone do a quick spike on whether this architecture will work?"

Sub-agents are those specialists. They run _inside_ your Claude Code session, spawned by Claude when it needs focused expertise. Each one gets:

- **Its own system prompt** -- what it knows and how it thinks
- **Its own tool access** -- what it can and cannot do
- **Its own context window** -- a fresh, focused context for the task
- **Its own model** -- the right brain for the job

When the sub-agent finishes, it reports back to your main Claude session with its findings. Claude synthesizes the results and continues your conversation. You stay in control -- the manager who delegates, reviews, and decides.

---

### Slide 2: Built-in Agents -- Explore and Plan

Claude Code ships with two built-in agents that you have probably already seen in action:

**Explore** -- The read-only researcher.

When you ask Claude a broad question like "how does authentication work in this app?" or "what's the data flow from the API to the UI?", Claude often delegates to the Explore agent behind the scenes. This agent can read files, search code, and traverse the codebase, but it cannot modify anything. It is a scout -- sent ahead to gather intelligence and report back.

```
You: "How does the scoring algorithm work?"

Claude: [delegates to Explore agent]
  Explore: [reads 8 files, traces the data flow, returns a summary]
Claude: "Here's how scoring works..."
```

**Plan** -- The architecture designer.

When you ask Claude to plan something complex -- "design a caching layer for the leaderboard" or "plan the migration from REST to GraphQL" -- it can delegate to the Plan agent. This agent thinks through the problem, considers trade-offs, and produces a structured plan. Also read-only -- it plans but does not implement.

You have been using these without knowing it. Every time Claude pauses to "think" before a big answer, there is a good chance it delegated to one of these agents internally.

---

### Slide 3: Custom Agents -- Your Specialists

The real power is building your own. Custom agents live in `.claude/agents/`:

```
.claude/
  agents/
    security-reviewer.md     <- Checks code for OWASP top 10
    k8s-validator.md         <- Validates K8s manifests
    quick-search.md          <- Fast Haiku-powered codebase search
```

Here is what an agent definition looks like:

```markdown
---
name: security-reviewer
description: Reviews code for OWASP top 10 vulnerabilities and security best practices
model: sonnet
allowed-tools:
  - Read
  - Grep
  - Glob
---

You are a senior application security engineer conducting a security review.

Focus on the OWASP Top 10:
1. Injection (SQL, NoSQL, command, LDAP)
2. Broken Authentication
3. Sensitive Data Exposure
...
```

The frontmatter is where the magic happens:

- **`model`**: Which Claude model to use. `haiku` for fast/cheap tasks, `sonnet` for balanced, `opus` for complex reasoning. If omitted, it uses the same model as the parent session.
- **`allowed-tools`**: Tool restrictions, just like skills. A security reviewer should not need to run bash commands.
- **`description`**: Helps Claude (and you) know when to use this agent.

The body is the system prompt -- the instructions that define the agent's expertise and behavior.

---

### Slide 4: Skills vs. Agents -- What's the Difference?

Students always ask this, so let us make it clear:

| | Skills | Sub-agents |
|---|--------|------------|
| **What they are** | Reusable instructions for Claude | Separate AI workers with their own context |
| **How they run** | In your current Claude session | In a new, isolated context |
| **Context** | Shares your session's full context | Gets a fresh context window |
| **Invocation** | You type `/skill-name` | Claude delegates automatically, or you ask explicitly |
| **Model** | Uses your session's model | Can use a different model |
| **Best for** | Standardized tasks (review this, audit that) | Complex tasks needing focused attention |

Think of it this way: a skill is a recipe card. An agent is a sous-chef.

A skill says "here's how to review K8s manifests." Claude follows the instructions in its current session, with all the context of your conversation so far.

An agent says "you are a K8s expert, here are your tools, go validate these manifests." It gets its own workspace, focuses entirely on that task, and reports back.

**When to use which?** If the task is straightforward and benefits from the current conversation context, use a skill. If the task is complex, benefits from a fresh context, or needs different tools/model, use an agent.

---

### Slide 5: Worktree Isolation -- Safe Parallel Work

Here is a scenario: you ask Claude to experiment with a new approach to the leaderboard component. You want it to try something bold -- restructure the code, move files around, change the data model. But you do not want those experimental changes in your working directory. You are in the middle of something else.

Worktree isolation solves this:

```markdown
---
name: experimenter
description: Tries new approaches in an isolated worktree
isolation: worktree
---
```

When `isolation: worktree` is set, the sub-agent:

1. Creates a new git worktree (a separate checkout of the same repo)
2. Creates a new branch for its work
3. Makes all changes in that worktree, not in your working directory
4. Reports back with the branch name and a summary of changes
5. The worktree is cleaned up after

Your working directory stays exactly as it was. The agent's experimental changes live on a separate branch that you can review, merge, or discard.

This is incredibly powerful for:
- **Experimental implementations** -- "try this two different ways and let me compare"
- **Risky refactors** -- "restructure the auth module without touching my current work"
- **Parallel tasks** -- "fix this bug on a branch while I keep working here"

---

### Slide 6: Model Selection -- The Right Brain for the Job

Not every task needs the most powerful model. Sub-agents let you match model to task:

```markdown
# Quick codebase search -- fast and cheap
---
model: haiku
allowed-tools: [Read, Grep, Glob]
---

# Security review -- needs careful reasoning
---
model: sonnet
allowed-tools: [Read, Grep, Glob]
---

# Architecture planning -- complex trade-offs
---
model: opus
allowed-tools: [Read, Grep, Glob]
---
```

**Haiku** -- Fast, cheap, good for rote tasks. Searching code, formatting output, simple analysis. Runs in seconds, costs fractions of a cent.

**Sonnet** -- Balanced. Good for most review and analysis tasks. The sweet spot for code review, security scanning, and validation.

**Opus** -- Deep reasoning. Architecture decisions, complex debugging, nuanced trade-off analysis. Slower and more expensive, but sees things other models miss.

> **Cost tip**: If you have a sub-agent that runs frequently (like on every PR), make it Haiku. Reserve Opus for the tasks where the extra reasoning depth actually matters. Your wallet will thank you.

---

### Key Takeaways

| Concept | What It Is | When to Use |
|---------|-----------|-------------|
| Sub-agent | Separate AI worker with own context and tools | Complex tasks needing focused attention |
| Explore (built-in) | Read-only codebase researcher | Broad "how does X work" questions |
| Plan (built-in) | Architecture design agent | Planning complex changes |
| `.claude/agents/` | Custom agent definitions | Team-specific specialists |
| `allowed-tools` | Tool restrictions per agent | Security: limit what agents can do |
| `model` | Per-agent model selection | Balance speed, cost, and capability |
| `isolation: worktree` | Git worktree isolation | Safe experimentation without affecting your work |
| `/agents` | List all configured agents | See your full agent roster |
