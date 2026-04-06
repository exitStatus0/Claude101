---
layout: block-part
title: "Understanding Your Codebase"
block_number: 1
description: "Hands-on implementation steps for Block 01."
time: "~20 minutes"
part_name: "Hands-On"
overview_url: /course/block-01-understanding/
presentation_url: /course/block-01-understanding/presentation/
hands_on_url: /course/block-01-understanding/hands-on/
permalink: /course/block-01-understanding/hands-on/
---
> **Attention point:** Every command or prompt block on this page is meant to be copied directly into your terminal or Claude session unless the text says otherwise.

> **Duration**: ~20 minutes
> **Outcome**: A generated CLAUDE.md file and a thorough understanding of the ai-coderrank architecture gained through conversational exploration
> **Prerequisites**: Block 0 completed, Claude Code installed and authenticated

---

### Step 1: Launch Claude Code in the Project

Make sure you're in the ai-coderrank directory and start a session:

```bash
cd ai-coderrank
claude
```

You should see the Claude Code prompt. If you completed Block 0, this should feel familiar.

---

### Step 2: Generate CLAUDE.md with /init

This is the first "wow" moment. Type:

```text
/init
```

Watch what happens. Claude will:

1. Scan your entire project structure
2. Read key files like `package.json`, `tsconfig.json`, `Dockerfile`, etc.
3. Analyze the directory layout
4. Generate a `CLAUDE.md` file in the project root

This takes 15-30 seconds depending on project size. For ai-coderrank, it should be quick.

> **Attention point:** "Watch the tool calls scrolling by. Claude is reading package.json to understand dependencies, looking at tsconfig for TypeScript config, checking the Dockerfile, scanning the K8s manifests. It's doing in 20 seconds what would take you 10 minutes of clicking around."

---

### Step 3: Review the Generated CLAUDE.md

Once `/init` completes, ask Claude to show you what it generated:

```text
Show me the CLAUDE.md file you just created
```

Alternatively, you can read it yourself in another terminal:

```bash
cat CLAUDE.md
```

**Things to look for in the generated CLAUDE.md:**

- Does it correctly identify the tech stack (Next.js 14, React 18, TypeScript, Tailwind)?
- Does it mention the charting library (Recharts)?
- Does it document the project structure?
- Does it list useful commands (dev, build, test, lint)?
- Does it mention Docker and Kubernetes configs?

> **Attention point:** "The auto-generated CLAUDE.md is a solid starting point. It's maybe 80% of the way there. Over time, you'll add your own notes — team conventions, deployment quirks, things Claude should always remember. We'll cover that in Block 5 when we talk about memory."

---

### Step 4: Ask Claude to Explain the Architecture

Now let's use Claude as our personal architecture guide. Start broad:

```text
Explain the overall architecture of this project. What are the main layers and how do they connect?
```

Claude will read through the source files and give you a structured breakdown. Watch the tool calls — you'll see it reading files across `src/app/`, `src/components/`, and the API routes.

**Follow up with more specific questions:**

```text
What API routes does this project have and what does each one do?
```

Watch Claude use Glob to find the route files, then Read to examine each one. It should identify the API endpoints and explain the data they serve.

> **Attention point:** Pause here and point out the tool calls in the terminal output. Show viewers how Claude chains Glob -> Read to answer the question. This is a great teaching moment about how the agent works under the hood.

---

### Step 5: Explore the Component Structure

Dive into the frontend:

```text
Walk me through the main React components. What does each one render and how do they compose together?
```

Then get specific about a visual component:

```text
How do the charts work? What data do they receive and how is it visualized?
```

Claude should identify the Recharts usage and explain the data flow from API routes to chart components.

---

### Step 6: Investigate the Theme Switching

This is a great example of tracing a feature through multiple files:

```text
How does the theme switching mechanism work? Trace the flow from the UI toggle to the CSS changes.
```

Claude will typically:

1. Search for theme-related code across the codebase (Grep)
2. Find the theme toggle component (Read)
3. Trace the state management or context provider
4. Show how CSS variables or Tailwind classes change based on theme

> **Attention point:** "This is where Claude Code really shines. You asked one question and it traced a feature across multiple files — the toggle component, the context provider, the CSS variables. To do this manually, you'd be cmd-clicking through imports for five minutes."

---

### Step 7: Try a Direct Command

Now let's switch from conversational to direct mode. Instead of asking open-ended questions, give Claude a specific task:

```text
Find all files that contain "TODO" or "FIXME" comments
```

Then try:

```text
List every external npm dependency and its version from package.json
```

And:

```text
Show me the Dockerfile and explain each stage of the multi-stage build
```

Notice the difference in response style. Direct questions get focused, precise answers. Open-ended questions get broader, exploratory answers. Both are useful.

---

### Step 8: Test Claude's Understanding

Here's a fun exercise — quiz Claude on what it's learned:

```text
If I wanted to add a new AI model to the comparison dashboard, which files would I need to modify? Walk me through the steps.
```

This forces Claude to synthesize everything it knows about the data model, API routes, and frontend components into a practical answer. It should give you a clear, ordered list of files to touch and changes to make.

> **Attention point:** "This is the kind of question that separates Claude Code from a simple file reader. It's not just finding files — it's reasoning about how pieces fit together and giving you a practical action plan."

---

### Step 9: Check Context Usage and Exit

Let's see how much context this exploration used:

```text
/cost
```

Note the token count. Codebase exploration is one of the heavier token operations because Claude reads many files. This is normal and expected.

Now exit:

```text
/exit
```

---

### What Just Happened?

In about 20 minutes, you went from "I've never seen this codebase" to understanding:

1. **The project structure** — where everything lives and why
2. **The architecture** — how frontend components connect to API routes
3. **The data flow** — how model data moves from backend to charts
4. **The theme system** — a full feature traced across multiple files
5. **The infrastructure** — Docker builds, K8s manifests, CI config

You also generated a **CLAUDE.md** that will make every future Claude Code session smarter about this specific project.

This is the superpower. Not writing code (that comes next) — but *understanding* code. Every senior engineer will tell you: the hardest part isn't writing the fix, it's knowing where to look. Claude Code just shortcut that process from days to minutes.

---

### Going Further

If you want extra practice before Block 2, try these exploration exercises:

- Ask Claude to compare the development and production Docker configurations
- Ask it to explain the GitHub Actions workflow step by step
- Ask it to find any potential security concerns in the codebase
- Ask it to describe the testing setup and what kinds of tests exist
