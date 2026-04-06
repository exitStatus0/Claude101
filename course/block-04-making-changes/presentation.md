---
layout: block-part
title: "Making Changes — The Dark Theme"
block_number: 4
description: "Presentation notes and speaking flow for Block 04."
part_name: "Presentation"
overview_url: /course/block-04-making-changes/
presentation_url: /course/block-04-making-changes/presentation/
hands_on_url: /course/block-04-making-changes/hands-on/
permalink: /course/block-04-making-changes/presentation/
---
**Duration**: ~8 minutes
**Goal**: Explain how Claude edits files (Edit vs Write tools), how git integration works, and how iterative refinement lets you fine-tune changes conversationally.

---

### Opening Hook (1 min)

**Say something like:**

> "Have you ever watched someone use Find and Replace across a codebase and thought 'this is going to end badly'? Yeah. Bulk find-and-replace is a chainsaw. Claude's Edit tool is a scalpel.
>
> In the last block, we planned the dark theme. We have an ADR, we have diagrams, we have a clear list of files to touch. Now we execute — and you're going to see something that fundamentally changed how I work. You describe what you want in English, and Claude makes the precise edits, in the right files, without breaking anything around them."

**Key point:** This block is where the plan meets reality. Students will see their first multi-file code change driven entirely by conversation.

---

### How Claude Edits Files (3 min)

#### The Edit Tool — Surgical Replacements

- Claude's primary way of modifying existing files
- It works by specifying an **exact string to find** and an **exact string to replace it with**
- Think of it like `sed`, but Claude understands the context of what it's replacing — it's not pattern-matching blindly

**Example on screen:**

```
Edit tool call:
  file: src/styles/globals.css
  old_string: "--background: #ffffff;"
  new_string: "--background: #0a0a0a;"
```

- The string must be **unique** in the file — if it appears twice, Claude has to include more surrounding context to disambiguate
- This is intentional: it prevents accidental changes to the wrong location

**Why this matters for DevOps/SRE:**
> "When you're editing Kubernetes manifests or Terraform files, you really don't want an AI tool making approximate changes. You want it to change exactly the line it means to change. The Edit tool enforces that."

#### The Write Tool — Full File Creation

- Used when creating **new files** or doing a **complete rewrite** of an existing file
- Claude generates the entire file content from scratch
- Best for: new components, new config files, new scripts
- Not ideal for: tweaking one line in a 200-line file (use Edit for that)

**The rule of thumb:**
- Changing a few lines? **Edit tool.**
- Creating something new? **Write tool.**
- Rewriting most of a file? **Write tool.**

#### What it looks like in practice:

> "When Claude implements the dark theme, you'll see it use the Edit tool maybe 8-10 times — once for each targeted change. It'll update the CSS variables, modify the Tailwind config, adjust component classes. Each edit is a small, reviewable change. You can watch each one and say 'yes, that looks right' or 'no, let's try a different color.'"

---

### Git Integration (2 min)

#### Claude can drive your entire git workflow

- **Staging files:** Claude calls `git add` on the specific files it changed
- **Creating commits:** Claude writes a commit message based on what it actually did (not what you asked for — what it *did*)
- **Showing diffs:** You can ask "show me the diff" at any point and Claude will run `git diff`
- **Reviewing history:** "Show me the git log" works exactly as you'd expect

#### Commit messages that don't suck

> "Here's a hot take: Claude writes better commit messages than most developers. Not because developers are lazy — we are, but that's not the point — but because Claude has the full context of every change it made, and it summarizes them naturally.
>
> Instead of 'update styles' you get something like 'feat: add dark theme with CSS custom properties and ThemeProvider integration.' It includes what changed and why. Every time."

#### The workflow:

1. Claude makes edits
2. You review (live in the browser, or ask Claude to show the diff)
3. You say "commit this"
4. Claude stages the right files, writes a meaningful message, creates the commit
5. You check `git log` — clean history

**Key point:** Claude doesn't just `git add .` and slam everything in. It stages specifically the files it changed.

---

### Iterative Refinement (1.5 min)

#### The real power: conversation-driven design

> "Here's where Claude Code becomes something different from any other tool. You run `npm run dev`, look at the dark theme in your browser, and say 'the sidebar is too light.' Claude opens the right file, finds the sidebar background CSS variable, and darkens it. You say 'the charts need more contrast.' Claude adjusts the Recharts color palette. You say 'the accent color should be more blue, less purple.' Done.
>
> You're having a *design conversation* with an agent that can instantly implement what you describe. No switching between Figma and your editor. No googling hex codes. Just talking."

#### Tips for effective iteration:

- **Be specific:** "Make it darker" works. "Change the sidebar background from gray-800 to gray-900" works better.
- **Reference what you see:** "The text on the card components is hard to read" — Claude will figure out which CSS variable controls that.
- **Iterate in small steps:** Three small refinements beat one massive prompt. Each step, you verify the result.

---

### The Theme System Quick Reference (30 sec)

Quick recap for students who might not have worked with CSS variables + Tailwind before:

| Layer | What it does |
|-------|-------------|
| CSS Variables (`:root`) | Define the actual color values |
| `[data-theme="dark"]` | Override those values for dark mode |
| Tailwind Config | Maps CSS variables to Tailwind utility classes |
| ThemeProvider | React context that toggles the `data-theme` attribute |
| `switch-theme.sh` | CLI shortcut for toggling the theme |

> "The beauty of this architecture is that Claude only needs to define the dark color values and make sure the ThemeProvider toggles the right attribute. The components already use the CSS variables — they'll pick up the new colors automatically."

---

### Closing (30 sec)

> "This is the block where it gets real. You're going to go from a plan to a working dark theme in about 25 minutes. You'll make edits, preview them, iterate, run tests, and commit — all through conversation. By the end, you'll have your first real feature built with Claude Code. Let's do it."

---

### Common Student Questions

**Q: What if Claude makes an edit I don't like?**
A: You can always undo. Claude respects your git workflow — if something looks wrong, `git checkout -- <file>` or just tell Claude "undo that last change." You're always in control.

**Q: Does Claude run the dev server for me?**
A: Claude can start `npm run dev`, but you'll want to view the result in your own browser. Claude can't see your screen — you're the visual feedback loop. Tell it what you see, and it adjusts.

**Q: What if tests fail after the theme change?**
A: That's actually a great learning moment. Claude will read the test output, figure out what broke (probably a snapshot test or a color assertion), and fix it. This is exactly the kind of error-handling workflow you'll use constantly.

**Q: Can Claude handle merge conflicts?**
A: Yes, but that's not in scope for this block. We're working on a clean branch. Merge conflict resolution comes up naturally in later blocks.
