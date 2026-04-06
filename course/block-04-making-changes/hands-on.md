---
layout: block-part
title: "Making Changes — The Dark Theme"
block_number: 4
description: "Hands-on implementation steps for Block 04."
time: "~25 minutes"
part_name: "Hands-On"
overview_url: /course/block-04-making-changes/
presentation_url: /course/block-04-making-changes/presentation/
hands_on_url: /course/block-04-making-changes/hands-on/
permalink: /course/block-04-making-changes/hands-on/
---
> **Direct speech:** "Everything on this hands-on page is built so you can follow me line by line. When you see a command or prompt block, you can copy it directly into your terminal or Claude session unless I explicitly tell you it is just reference material. As we go, compare your result with mine on screen so you can catch mistakes early instead of stacking them up."

> **Duration**: ~25 minutes
> **Outcome**: A fully working dark theme implementation with a clean git commit
> **Prerequisites**: Block 3 completed (ADR and diagrams created, plan reviewed), Claude Code running in the ai-coderrank project directory

---

### Step 1: Kick Off the Implementation (3 min)

We have a plan from Block 3. Now we execute. Make sure you're in **Act mode** (not Plan mode — press Shift+Tab if needed).

**Type:**

```text
We planned a dark theme in our last session. The ADR is at docs/adr/001-dark-theme.md.
Implement the dark theme now. Start with the CSS variables and Tailwind config, then
update the ThemeProvider to support toggling, and finally adjust any component styles
that need dark variants.

Use the existing CSS variable architecture — define dark values under
[data-theme="dark"] so components pick them up automatically.
```

**What to watch for:**
- Claude will read the current CSS file, `tailwind.config.ts`, and the ThemeProvider component
- It will use the **Edit tool** multiple times — one targeted replacement per change
- Watch the tool calls: each one shows `old_string` (what it found) and `new_string` (what it replaced it with)
- The first edits will likely be in the global CSS file, adding dark theme variable overrides

**You should see Claude making changes like:**

1. Adding `[data-theme="dark"]` CSS variable block with dark colors
2. Updating `tailwind.config.ts` to reference CSS variables (if not already)
3. Modifying the ThemeProvider to handle theme toggling and persistence
4. Adjusting the `switch-theme.sh` script if needed

Let Claude work through the full implementation. Don't interrupt unless you see something clearly wrong — let it finish its chain of edits first.

---

### Step 2: Preview the Changes (3 min)

Time to see what we've got. Ask Claude to start the dev server:

```text
Run npm run dev so I can preview the changes.
```

Claude will run the command. Open your browser and go to **http://localhost:3000**.

**Toggle the theme** using whatever mechanism the ThemeProvider exposes (a button in the UI, or use the script):

```text
Run scripts/switch-theme.sh to toggle to the dark theme, or tell me how to
toggle it in the browser.
```

**Look at the result in your browser.** You're the eyes here — Claude can't see your screen. Take note of:
- Is the background dark?
- Is the text readable?
- How do the charts look? (Recharts might need color adjustments)
- Does the sidebar look right?
- Are there any elements that are still "stuck" in light mode?

---

### Step 3: Iterate on the Design (8 min)

This is the fun part. You're going to refine the theme through conversation. Here are some prompts to try — pick the ones that match what you see in the browser:

#### If the sidebar needs work:

```text
The sidebar background is too light for dark mode. Make it darker — something
like a very dark gray or near-black. The sidebar text should be light gray,
not white, so it's easy on the eyes.
```

#### If the charts need contrast:

```text
The Recharts charts are hard to read in dark mode. The line colors and bar
colors need to be brighter and more saturated against the dark background.
Adjust the chart color palette for dark mode.
```

#### If the accent color isn't right:

```text
The accent color looks washed out in dark mode. Change it to a brighter blue —
something like #3b82f6 — and make sure it has enough contrast against the
dark background.
```

#### If cards or panels blend into the background:

```text
The card components are blending into the page background. Add a subtle
border or make the card background slightly lighter than the page background
so they stand out.
```

#### If text contrast is off:

```text
Some of the secondary text is too dim in dark mode. Increase the contrast —
the secondary text color should be at least #9ca3af, not darker.
```

**After each change, refresh your browser and evaluate.** Tell Claude what you see. This back-and-forth is the core workflow — describe the problem in plain English, let Claude make the targeted edit, check the result, repeat.

**Pro tip:** You don't need to know the exact file or variable name. Saying "the sidebar text is too dark" is enough — Claude will find the right CSS variable and adjust it.

---

### Step 4: Check the Diff (2 min)

Before we run tests, let's see everything that changed. Ask Claude:

```text
Show me the full git diff of all changes we've made.
```

**What to look for in the diff:**
- CSS variable additions under `[data-theme="dark"]`
- Tailwind config modifications (if any)
- ThemeProvider changes for toggle logic
- Any component-level style adjustments
- No unintended changes to unrelated files

**If something looks wrong:**

```text
I see you changed [file] but I don't think that was necessary. Can you
revert that specific change?
```

Claude can selectively undo changes using the Edit tool — putting the original string back.

---

### Step 5: Run the Tests (3 min)

Let's make sure we didn't break anything:

```text
Run npm test and show me the results. If any tests fail, explain why and
fix them.
```

**What to watch for:**
- Claude runs the test command
- If tests pass: great, move on
- If tests fail: Claude will read the error output, identify the cause, and propose fixes

**Common test failures after a theme change:**

1. **Snapshot tests** — Components render differently with new CSS. Claude will update the snapshots.
2. **Color assertions** — If tests check for specific color values, they'll need updating.
3. **Accessibility tests** — Contrast ratio checks might flag colors that are too similar.

**If tests fail, let Claude fix them:**

```text
Fix the failing tests. If they're snapshot tests, update the snapshots.
If they're asserting specific colors, update them to match the dark theme values.
```

Run the tests again after fixes:

```text
Run npm test again to confirm everything passes.
```

---

### Step 6: Commit with Claude (4 min)

Everything works. Time to commit. This is where Claude's git integration shines:

```text
Commit all the dark theme changes. Write a descriptive commit message that
explains what was changed and why.
```

**What to watch for:**
- Claude runs `git add` on the specific files it changed (not `git add .`)
- It writes a commit message — watch the quality. It should mention:
  - What: dark theme implementation
  - How: CSS variables, ThemeProvider updates
  - Why: references the ADR or mentions the planning decision
- The commit is created cleanly

**The commit message should look something like:**

```text
feat: implement dark theme using CSS custom properties

Add dark theme color palette under [data-theme="dark"] selector,
update ThemeProvider to support theme toggling with localStorage
persistence, and adjust chart colors for dark mode contrast.

Implements the decision documented in docs/adr/001-dark-theme.md.
```

Not `"update styles"`. Not `"dark mode"`. A real, useful commit message.

---

### Step 7: Review the Git Log (2 min)

Let's verify everything is clean:

```text
Show me the git log with the last 5 commits, and then show me a summary
of the files changed in the most recent commit.
```

**You should see:**
- Your dark theme commit at the top
- A clean list of changed files (CSS, config, ThemeProvider, possibly components)
- No unexpected files in the commit

**Optional — verify the commit content:**

```text
Show me git show --stat for the latest commit.
```

This gives you a summary of files changed with lines added/removed — a nice final verification.

---

### Checkpoint

Before moving on, verify:

- [ ] The dark theme displays correctly at http://localhost:3000
- [ ] Text is readable in both light and dark modes
- [ ] Charts have adequate contrast in dark mode
- [ ] The theme toggle works (switching between light and dark)
- [ ] `npm test` passes with no failures
- [ ] A clean commit exists with a descriptive message
- [ ] `git log` shows the commit and `git diff` is clean (no unstaged changes)

**Milestone reached: Dark theme working locally!**

---

### Key Takeaways

1. **The Edit tool is precision, not brute force.** Each edit specifies an exact string to find and replace. This is why Claude can modify a single CSS variable in a 200-line file without touching anything else. It's also why you can trust it with config files and manifests.

2. **You are the visual feedback loop.** Claude can't see your browser. Your job is to describe what you see — "the text is hard to read," "the sidebar blends in," "the charts look great." Claude translates your feedback into precise code changes. The better you describe what you see, the fewer iterations you need.

3. **Iteration is the workflow, not a fallback.** Getting it right on the first prompt is nice. Getting it right after three refinements is *normal*. Professional designers iterate. Professional engineers iterate. You're iterating with an AI partner — that's not a limitation, it's the feature.

4. **Git integration closes the loop.** You don't need to context-switch to the terminal to commit. Claude stages the right files, writes a meaningful message, and keeps your git history clean. This matters more than it sounds — when you're in flow, staying in the conversation keeps you there.

5. **Tests catch what your eyes miss.** Always run the test suite after visual changes. A theme change can break snapshot tests, accessibility checks, and color-based assertions. Claude handles these fixes quickly, but you have to ask it to run the tests first.

---

### What's Next

In Block 5, we'll teach Claude to *remember* your preferences. Like the fact that you prefer dark mode. Or that your team uses conventional commits. Or that your Kubernetes manifests should always include resource limits. This is where Claude stops being a tool you use and starts being a collaborator that knows your codebase.
