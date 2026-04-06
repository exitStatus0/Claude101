---
layout: block-part
title: "GitHub Actions & CI/CD — Claude in the Pipeline"
block_number: 10
description: "Hands-on implementation steps for Block 10."
time: "~25 minutes"
part_name: "Hands-On"
overview_url: /course/block-10-github-actions/
presentation_url: /course/block-10-github-actions/presentation/
hands_on_url: /course/block-10-github-actions/hands-on/
permalink: /course/block-10-github-actions/hands-on/
---
> **Direct speech:** "Everything on this hands-on page is built so you can follow me line by line. When you see a command or prompt block, you can copy it directly into your terminal or Claude session unless I explicitly tell you it is just reference material. As we go, compare your result with mine on screen so you can catch mistakes early instead of stacking them up."

> **Duration**: ~25 minutes
> **Outcome**: A fully working Claude-powered CI/CD pipeline -- automated PR reviews triggered by `@claude` mentions, issue-to-PR generation, and CI-specific CLAUDE.md guidelines with cost controls.
> **Prerequisites**: Completed Blocks 0-9 (codebase deployed, hooks and MCP configured), the ai-coderrank repository pushed to GitHub, an Anthropic API key

---

### Step 1: Install the Claude GitHub App (~3 min)

The fastest way to connect Claude to your GitHub repository is through the official GitHub App. Inside Claude Code, run:

```text
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

```text
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

```text
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

```text
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
```text
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

```text
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

```text
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
