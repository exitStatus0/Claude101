---
layout: block
title: "GitHub Actions & CI/CD — Claude in the Pipeline"
block_number: 10
description: "Take Claude Code beyond your terminal and into GitHub Actions. Set up automated PR reviews, issue-to-PR workflows, and AI-powered CI/CD with the official Claude Code GitHub Action."
time: "~35 min (10 min presentation + 25 min practical)"
features:
  - anthropics/claude-code-action@v1
  - /install-github-app
  - "@claude trigger"
  - CLAUDE.md in CI
  - "--max-turns cost control"
objectives:
  - Understand how Claude Code runs inside GitHub Actions
  - Install the Claude GitHub App using /install-github-app
  - Create a workflow that triggers Claude on @claude mentions in PRs
  - See Claude automatically review a pull request
  - Watch Claude create a PR from a GitHub issue
  - Configure CLAUDE.md guidelines for CI context
  - Control costs with --max-turns and other safeguards
---

## From Your Terminal to Every Pull Request

Up to this point, Claude Code has been your personal co-pilot. You open a terminal, start a session, ask questions, make changes. It is powerful, but it is inherently local. It scales to one person at a time.

This block changes that. You are about to put Claude inside your CI/CD pipeline, where it can review every pull request, respond to issues, and act as a tireless team member who never takes a vacation day, never gets paged at 3 AM and forgets to check the error logs, and never says "I'll review that PR tomorrow" and then doesn't.

Here is a fun fact that might surprise you: some engineering teams have configured Claude as their _first_ reviewer on every PR. Not their only reviewer, but their first. By the time a human reviewer looks at the PR, Claude has already flagged missing tests, security issues, and style violations. The human reviewer can focus on architecture and business logic instead of nitpicking import order.

## What We'll Cover

1. **The official GitHub Action** -- `anthropics/claude-code-action@v1` and what it does
2. **The GitHub App** -- `/install-github-app` and one-click setup
3. **The `@claude` trigger** -- how to summon Claude in any PR or issue
4. **Automated PR review** -- Claude comments on PRs with structured feedback
5. **Issue-to-PR workflow** -- tag an issue with `@claude` and it generates a PR
6. **CLAUDE.md in CI** -- your project rules apply in the pipeline too
7. **Cost control** -- `--max-turns`, token limits, and keeping your bill predictable

## Why This Block Matters

There is an enormous gap between "we should review PRs more carefully" and "we actually review every PR carefully." Humans get tired, busy, and distracted. CI does not. Linters catch syntax issues but miss logic problems. Claude catches both.

This is not about replacing human reviewers. It is about giving every PR a thorough first pass so that human reviewers can do their best work on the things that actually need human judgment. Think of Claude in CI as the spell-checker for your code review process -- it catches the obvious stuff so you can focus on the subtle stuff.

By the end of this block, every PR to your ai-coderrank repo will get an automatic review, and you will be able to create implementation PRs just by writing a GitHub issue and tagging `@claude`.

## Cost Notice

> **This block requires an Anthropic API key** with pay-per-token billing. This is a separate cost from your Pro subscription. Expect to spend **$1-5** on API tokens for the exercises. See the <a href="{{ '/resources/cost-guide/' | relative_url }}">Cost Guide</a> for details.
>
> **This block is optional.** You can skip it and continue with Blocks 11-13 without any issues.

## Prerequisites

- Completed Blocks 0-9 (codebase deployed, hooks and MCP configured)
- The ai-coderrank repository pushed to GitHub
- GitHub account with permissions to install apps and create workflows
- **Anthropic API key** (separate from your Pro subscription -- sign up at [console.anthropic.com](https://console.anthropic.com))

## Part 1: Presentation {#presentation}

> **Duration**: ~10 minutes
> **Goal**: Students understand how Claude Code works inside GitHub Actions, what the official action does, and why CI-integrated AI review is a game-changer for team workflows.

---

### Slide 1: Claude Code Is Not Just a CLI

Here is something that surprises most people when they first hear it:

Claude Code is not just a terminal application. It is also a GitHub Action. The same Claude that reads your codebase, writes code, and runs tests on your laptop can do all of that inside a GitHub Actions runner, triggered by events like PR comments, issue labels, or pushes.

```
Your terminal:       claude "review this file"
GitHub Actions:      @claude please review this PR
```

Same engine. Same CLAUDE.md rules. Same understanding of your codebase. But now it is automated, and it runs on every pull request without anyone having to remember to invoke it.

The official action is `anthropics/claude-code-action@v1`, maintained by Anthropic. It is not a community hack or a wrapper script -- it is the real thing.

---

### Slide 2: Two Ways to Set It Up

There are two paths to getting Claude into your GitHub workflows:

**Path 1: The GitHub App (recommended)**

```
/install-github-app
```

Run this command inside Claude Code and it walks you through installing the official Claude Code GitHub App on your repository. The app handles authentication, permissions, and webhook configuration. It is the fastest way to go from zero to "Claude is reviewing my PRs."

**Path 2: API Key + Manual Workflow**

If you prefer more control (or your organization has policies about GitHub Apps), you can:
1. Store your Anthropic API key as a GitHub Actions secret (`ANTHROPIC_API_KEY`)
2. Create a workflow YAML file manually
3. Configure the trigger events yourself

Both paths end at the same place: Claude running inside your CI pipeline. The GitHub App just gets you there faster.

> **Which should you choose?** For personal repos and small teams, the GitHub App is perfect. For enterprise environments with strict app installation policies, go with the API key approach. We will do both in the practical.

---

### Slide 3: The `@claude` Trigger

Once Claude is connected to your repo, the interaction model is beautifully simple:

**In a Pull Request:**
```
@claude please review this PR, focusing on security and performance
```

**In an Issue:**
```
@claude implement this feature and create a PR
```

**In a PR review comment (on a specific line):**
```
@claude this function looks like it could have a race condition. Can you check?
```

Claude sees the full context -- the diff, the files, the conversation history -- and responds as a comment on the PR or issue. Other team members can see Claude's response, reply to it, ask follow-up questions, and iterate.

It is like having a team member who:
- Responds in minutes, not hours
- Never says "I'll look at it later"
- Has read every file in the repo before reviewing
- Follows your CLAUDE.md guidelines consistently

---

### Slide 4: The Workflow YAML

Here is what the workflow file looks like in practice:

```yaml
name: Claude Code Review
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, labeled]

jobs:
  claude:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'issues' && contains(github.event.issue.body, '@claude'))
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          max_turns: 10
```

Let us break this down:

- **Triggers**: The workflow fires on issue comments, PR review comments, and new issues
- **Condition**: The `if` block checks that the comment or issue body actually contains `@claude` -- we do not want every comment triggering a run
- **Permissions**: Claude needs write access to push commits, comment on PRs, and update issues
- **The action**: `anthropics/claude-code-action@v1` does the heavy lifting
- **`max_turns`**: This is your cost control knob -- limits how many back-and-forth turns Claude can take

---

### Slide 5: CLAUDE.md in CI -- Your Rules Still Apply

Here is something important: when Claude runs in GitHub Actions, it reads your `CLAUDE.md` file. The same rules, conventions, and guidelines you set up in Block 5 apply in CI too.

This means you can add CI-specific guidelines:

```markdown
# CI Review Standards

When reviewing PRs in CI:
- Always check that new functions have corresponding tests
- Flag any TODO or FIXME comments in new code
- Verify that database migrations have a rollback step
- Check that environment variables are documented in .env.example
- Ensure error messages are user-friendly, not stack traces
```

Claude in CI does not go rogue. It follows the same playbook your team defined. If your CLAUDE.md says "always use conventional commits," Claude's PR suggestions will use conventional commits. If it says "never approve PRs that reduce test coverage," Claude will flag coverage drops.

This is the consistency guarantee that makes CI review trustworthy. It is not an opinionated stranger reviewing your code -- it is _your_ rules, applied automatically.

---

### Slide 6: Cost Control -- Keeping Your Bill Predictable

Running AI in CI means running AI on every PR, every comment, every issue. That can add up. Here are the levers you have:

**`max_turns`** -- The most important one.

```yaml
with:
  max_turns: 10    # Claude can take at most 10 actions
```

A simple PR review might take 3-5 turns (read diff, read related files, write review). A complex implementation from an issue might take 15-20. Set this based on what you are comfortable with.

**Trigger filtering** -- Not every comment needs Claude.

The `@claude` trigger means Claude only runs when explicitly summoned. No accidental triggers, no wasted runs.

**Branch restrictions** -- Only run on certain branches.

```yaml
if: github.event.pull_request.base.ref == 'main'
```

Only review PRs targeting main, not every feature-to-feature branch merge.

**Concurrency control** -- Prevent parallel runs.

```yaml
concurrency:
  group: claude-${{ github.event.pull_request.number || github.event.issue.number }}
  cancel-in-progress: true
```

If someone sends three `@claude` messages in a row, only the last one runs.

> **Real-world benchmark**: A typical PR review costs a few cents. Even active repos with 20-30 PRs per day usually see monthly Claude CI costs under what you would spend on a single team lunch.

---

### Key Takeaways

| Concept | What It Is | Why It Matters |
|---------|-----------|----------------|
| `claude-code-action@v1` | Official GitHub Action by Anthropic | Runs Claude in CI with full codebase access |
| `/install-github-app` | One-command setup | Fastest path to CI integration |
| `@claude` trigger | Mention-based invocation | Claude only runs when you ask it to |
| CLAUDE.md in CI | Your rules, applied automatically | Consistent reviews that follow team standards |
| `max_turns` | Cost control knob | Limits how much work Claude does per invocation |
| Issue-to-PR | Create PRs from issues | Write what you want, Claude implements it |

## Part 2: Hands-On {#practical}

> **Duration**: ~25 minutes
> **Outcome**: A fully working Claude-powered CI/CD pipeline -- automated PR reviews triggered by `@claude` mentions, issue-to-PR generation, and CI-specific CLAUDE.md guidelines with cost controls.
> **Prerequisites**: Completed Blocks 0-9 (codebase deployed, hooks and MCP configured), the ai-coderrank repository pushed to GitHub, an Anthropic API key

---

### Step 1: Install the Claude GitHub App (~3 min)

The fastest way to connect Claude to your GitHub repository is through the official GitHub App. Inside Claude Code, run:

```
/install-github-app
```

Claude will walk you through:
1. Opening a browser link to the GitHub App installation page
2. Selecting your `ai-coderrank` repository (or your GitHub organization)
3. Granting the required permissions (repository contents, pull requests, issues)
4. Confirming the installation

Once complete, Claude Code will verify the connection. You should see a confirmation that the app is installed and active on your repository.

> **If you cannot install GitHub Apps** (corporate policy, permissions, etc.), skip to Step 2 -- we will set up the API key approach instead, which works without a GitHub App.

---

### Step 2: Create the Claude Review Workflow (~5 min)

Now we create the workflow that triggers Claude on `@claude` mentions. This works regardless of whether you used the GitHub App or plan to use an API key.

First, make sure you have your Anthropic API key stored as a GitHub Actions secret. In your browser:

1. Go to your `ai-coderrank` repo on GitHub
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click **New repository secret**
4. Name: `ANTHROPIC_API_KEY`
5. Value: your Anthropic API key
6. Click **Add secret**

Now create the workflow file. In Claude Code:

```
Create the file .github/workflows/claude-review.yml with a workflow that triggers Claude Code on @claude mentions in PR comments, PR review comments, and new issues. Use anthropics/claude-code-action@v1 with max_turns of 10.
```

Or create it manually. Here is the full workflow:

```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, labeled]

jobs:
  claude-review:
    # Only run when @claude is mentioned
    if: |
      (github.event_name == 'issue_comment' &&
        contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' &&
        contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'issues' &&
        contains(github.event.issue.body, '@claude'))
    runs-on: ubuntu-latest

    permissions:
      contents: write
      pull-requests: write
      issues: write

    # Prevent parallel runs on the same PR/issue
    concurrency:
      group: claude-${{ github.event.issue.number || github.event.pull_request.number }}
      cancel-in-progress: true

    steps:
      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          max_turns: 10
```

Commit and push this file:

```bash
cd ~/ai-coderrank
git add .github/workflows/claude-review.yml
git commit -m "ci: add Claude Code review workflow for @claude mentions"
git push origin main
```

> **What this does**: GitHub will now watch for any comment containing `@claude` on PRs and issues. When it sees one, it spins up a runner, checks out your repo, and hands control to Claude. Claude reads the context (the PR diff, the issue body, the comment), follows your CLAUDE.md rules, and posts a response as a GitHub comment.

---

### Step 3: Create a Test PR (~3 min)

Let us give Claude something to review. Create a branch with a small, intentional change:

```bash
cd ~/ai-coderrank
git checkout -b test/claude-ci-review
```

Now make a change that has some reviewable aspects -- something where Claude will have feedback. For example, add a utility function with a few deliberate issues:

```
Create a new file src/utils/format-score.ts with a function that formats a user's coding score for display. Include: the main function, a helper, and maybe leave out input validation so Claude has something to flag.
```

Or create it manually:

```typescript
// src/utils/format-score.ts

export function formatScore(score: any, maxScore: number): string {
  const percentage = (score / maxScore) * 100;

  if (percentage >= 90) return "A+ (" + percentage + "%)";
  if (percentage >= 80) return "A (" + percentage + "%)";
  if (percentage >= 70) return "B (" + percentage + "%)";
  if (percentage >= 60) return "C (" + percentage + "%)";
  return "F (" + percentage + "%)";
}

export function getScoreColor(score: any, maxScore: number) {
  const pct = (score / maxScore) * 100;
  if (pct >= 90) return "green";
  if (pct >= 70) return "yellow";
  return "red";
}
```

Notice the deliberate issues: `any` types, no input validation (what if `maxScore` is 0?), duplicated percentage calculation, string concatenation instead of template literals, no return type on the second function.

Commit and push:

```bash
git add src/utils/format-score.ts
git commit -m "feat: add score formatting utilities"
git push origin test/claude-ci-review
```

Now create a PR on GitHub:

```bash
gh pr create --title "Add score formatting utilities" --body "New utility functions for formatting and coloring user scores."
```

---

### Step 4: Trigger Claude with `@claude` (~5 min)

Go to your newly created PR on GitHub (the URL was printed by `gh pr create`). In the PR comment box, type:

```
@claude please review this PR. Check for TypeScript best practices, input validation, and potential runtime errors.
```

Now watch. Within a minute or two, the GitHub Actions workflow will trigger. You can see it running in the **Actions** tab of your repository.

When Claude finishes, it will post a comment on the PR with its review. Expect it to flag:

- **`any` types** -- should be `number` for type safety
- **Division by zero** -- `maxScore` could be 0, causing `Infinity`
- **Duplicated logic** -- percentage calculation appears in both functions
- **Missing return type** -- `getScoreColor` has no explicit return type
- **String concatenation** -- template literals are preferred in modern TypeScript

Read through Claude's review. It should be structured, actionable, and specific to the code you wrote.

> **Try a follow-up**: Reply to Claude's review comment with `@claude can you suggest a refactored version that fixes these issues?` and watch it respond with improved code.

---

### Step 5: Create an Issue for Claude (~5 min)

This is where things get really exciting. Claude does not just review code -- it can _write_ code from issue descriptions.

Go to the **Issues** tab of your repo on GitHub and create a new issue:

**Title**: Add loading skeleton to dashboard

**Body**:
```
@claude

The dashboard page (`src/app/dashboard/page.tsx`) currently shows a blank screen while data loads. Add a loading skeleton that:

1. Shows placeholder shapes matching the layout of the actual content
2. Uses Tailwind CSS `animate-pulse` for the shimmer effect
3. Follows Next.js 14 conventions (create a `loading.tsx` file)
4. Matches the existing design system (check the Tailwind config and existing components)

The skeleton should cover:
- The main score card (large number with label)
- The recent activity list (3-4 placeholder rows)
- The stats sidebar (2-3 stat blocks)
```

Submit the issue. The GitHub Actions workflow will detect the `@claude` mention in the issue body and trigger.

Claude will:
1. Read the issue description
2. Explore the codebase to understand the dashboard layout
3. Check existing components and the Tailwind configuration
4. Create a new branch
5. Implement the loading skeleton
6. Open a pull request that references the issue

This takes a few minutes. Watch the Actions tab for progress. When Claude finishes, you will have a new PR linked to the issue with a full implementation.

> **This is the power move**: Product managers can write issues, tag `@claude`, and get implementation PRs without a developer context-switching to pick it up. The developer still reviews and approves the PR, but the first draft is done.

---

### Step 6: Add CI-Specific Guidelines to CLAUDE.md (~2 min)

Claude in CI follows your CLAUDE.md, but you might want rules that apply specifically to CI review context. Open your CLAUDE.md and add a CI section.

In Claude Code:

```
Add a CI/CD review section to CLAUDE.md with guidelines for when Claude reviews PRs in GitHub Actions. Include: always check for tests, flag TODO/FIXME in new code, verify TypeScript strict mode compliance, and require error handling in async functions.
```

Or add it manually to your `CLAUDE.md`:

```markdown
## CI/CD Review Standards

When reviewing pull requests in GitHub Actions:

### Always Check
- New functions must have corresponding test files
- No `any` types in TypeScript -- use proper type definitions
- Async functions must have error handling (try/catch or .catch())
- New environment variables must be documented in `.env.example`
- TODO and FIXME comments in new code should be flagged as issues to track

### Review Format
- Start with a one-line summary: what this PR does
- List issues grouped by severity: Critical > Warning > Suggestion
- For each issue, include the file path, line number, and a concrete fix
- End with an overall assessment: Approve / Request Changes / Needs Discussion

### Do Not
- Do not approve PRs that reduce test coverage
- Do not approve PRs that add dependencies without justification in the PR description
- Do not auto-fix code -- suggest changes and let the author decide
```

Commit and push:

```bash
git add CLAUDE.md
git commit -m "docs: add CI/CD review standards to CLAUDE.md"
git push origin main
```

From now on, every Claude review in CI will follow these guidelines. Consistent, thorough, every single time.

---

### Step 7: Explore Cost Controls and `--max-turns` (~2 min)

Cost control is essential when running AI in CI. Here are the knobs available in the action:

**`max_turns`** -- Already in our workflow. This limits the number of tool-use turns Claude can take.

```yaml
with:
  max_turns: 10    # Good for reviews
  # max_turns: 25  # For issue implementations that need more steps
```

Rules of thumb for `max_turns`:
- **5-10**: Simple PR reviews (read diff, check a few files, write review)
- **10-20**: Complex reviews or small implementations
- **20-30**: Full feature implementations from issues

You can also create separate workflows with different limits:

```yaml
# .github/workflows/claude-review.yml -- for PR reviews
name: Claude PR Review
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  review:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          max_turns: 10
```

```yaml
# .github/workflows/claude-implement.yml -- for issue implementations
name: Claude Implementation
on:
  issues:
    types: [opened, labeled]

jobs:
  implement:
    if: contains(github.event.issue.body, '@claude')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          max_turns: 25
```

Notice the difference: the review workflow has `contents: read` (Claude only reads, does not push), while the implementation workflow has `contents: write` (Claude can create branches and push code).

**Other cost considerations**:

- **Concurrency groups** prevent multiple Claude runs on the same PR from piling up
- **Branch filters** can limit Claude reviews to PRs targeting `main` only
- **Label triggers** can require a specific label (like `claude-review`) instead of `@claude` in comments, giving you more control over when Claude runs

---

### Checkpoint

You now have:

```
.github/workflows/
  ci.yml                    # Your existing CI (tests, build, lint)
  claude-review.yml         # Claude reviews PRs on @claude mention
```

And you have seen Claude:
- Review a PR and flag real issues (types, validation, duplication)
- Create a PR from a GitHub issue description
- Follow your CLAUDE.md guidelines in CI context
- Respect cost controls via `max_turns`

Every PR to your ai-coderrank repo now gets AI-powered review on demand, and you can generate implementation PRs just by writing a well-described issue.

---

### Bonus Challenges

**Challenge 1: Auto-review on PR open**
Modify the workflow to automatically trigger Claude review when a PR is opened (not just when `@claude` is mentioned). Hint: add `pull_request: types: [opened]` to the `on:` block and adjust the `if:` condition.

**Challenge 2: Separate review and implementation workflows**
Split `claude-review.yml` into two files -- one for reviews (read-only, `max_turns: 10`) and one for implementations (write access, `max_turns: 25`). Use different trigger conditions for each.

**Challenge 3: Label-based gating**
Create a workflow that only triggers Claude when an issue is labeled `claude-implement`. This gives product managers a way to queue work for Claude without it running on every issue.

**Challenge 4: Review the review**
After Claude reviews your test PR, comment `@claude your review missed that the formatScore function doesn't handle negative scores. Can you expand your review?` See how Claude handles feedback on its own review.

---

> **Next up**: In Block 11, we go beyond a single Claude session and into sub-agents -- specialized AI workers that Claude can delegate to. Think of it as building a team of AI specialists, each with their own expertise, tools, and constraints.
