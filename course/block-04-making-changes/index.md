---
layout: block
title: "Making Changes — The Dark Theme"
block_number: 4
description: "Implement the dark theme using Claude's Edit and Write tools, preview changes live, iterate on the design, run tests, and commit — all without leaving the terminal."
time: "~33 min (8 min presentation + 25 min practical)"
features:
  - Edit Tool (surgical replacements)
  - Write Tool (full file creation)
  - Git Integration (commit, diff)
  - Iterative Refinement
objectives:
  - Understand how the Edit tool makes targeted changes vs. the Write tool creating full files
  - Implement a complete dark theme across Tailwind config, CSS variables, and components
  - Use Claude's iterative refinement to adjust visual details like contrast and color
  - Run tests through Claude to catch regressions
  - Let Claude write a meaningful commit message and create a clean commit
overview_url: /course/block-04-making-changes/
presentation_url: /course/block-04-making-changes/presentation/
hands_on_url: /course/block-04-making-changes/hands-on/
quiz_url: /course/block-04-making-changes/quiz/
locale: en
translation_key: block-04
---
## Time to Build

Block 3 was the blueprint. Block 4 is the construction site.

This is the block where Claude Code earns its name. You're going to watch an AI agent open files, find the exact lines that need to change, replace them surgically, and leave everything else untouched. Then you'll run the dev server, look at the result, say "make the sidebar darker," and watch it do it again. In seconds.

If you've ever done a theme change by hand — hunting through CSS files, tweaking hex codes, refreshing the browser 400 times — this block will feel like time travel.

## What We'll Cover

1. **The Edit tool** — how Claude performs targeted string replacements in files (think `sed` but it understands context)
2. **The Write tool** — when Claude creates or completely rewrites a file
3. **Live iteration** — tweaking the theme by talking to Claude in plain English
4. **Running tests** — making sure the theme change didn't break anything
5. **Git integration** — staging, committing, and reviewing the diff, all through Claude

## The Theme System in ai-coderrank

Before we start editing, it helps to know how the pieces fit together:

| Component | Role |
|-----------|------|
| `tailwind.config.ts` | Defines the color palette and dark mode strategy |
| Global CSS (variables) | Declares `--background`, `--foreground`, `--accent`, etc. |
| `ThemeProvider` | React context that manages light/dark state |
| `scripts/switch-theme.sh` | Shell script for toggling themes |
| Individual components | May have inline Tailwind classes that reference theme colors |

The architecture is already set up for theming — CSS variables and a ThemeProvider are in place. We just need to define the dark palette and wire it up.

## What Changes Look Like

Here's a preview of the kind of edit Claude will make. In your global CSS, you might have:

```css
:root {
  --background: #ffffff;
  --foreground: #1a1a1a;
}
```

Claude will add:

```css
[data-theme="dark"] {
  --background: #0a0a0a;
  --foreground: #e5e5e5;
}
```

It does this using the **Edit tool** — specifying the exact string to find and the exact string to replace it with. No regex guessing games. No accidental changes to other files. Surgical.

## Milestone

By the end of this block: **dark theme working locally.** You'll see it in the browser, the tests will pass, and the commit will be clean. This is the first tangible change you've made to the codebase with Claude Code — and it won't be the last.

## Choose Your Format

Pick the format that matches how you are using the block:

<div class="card-grid">
  <a href="{{ '/course/block-04-making-changes/presentation/' | relative_url }}" class="quick-card">
    <h3>Presentation</h3>
    <p>Speaker notes, slide flow, and talking points for the voice-over part of this block.</p>
  </a>

  <a href="{{ '/course/block-04-making-changes/hands-on/' | relative_url }}" class="quick-card">
    <h3>Hands-On</h3>
    <p>Copy-pasteable terminal steps and prompts for the screen-sharing implementation part.</p>
  </a>

  <a href="{{ '/course/block-04-making-changes/quiz/' | relative_url }}" class="quick-card">
    <h3>Quiz</h3>
    <p>Test your knowledge from this block with 6-8 questions.</p>
  </a>
</div>
