---
layout: block-part
title: "GitHub Actions & CI/CD — Claude in the Pipeline"
block_number: 10
description: "Presentation notes and speaking flow for Block 10."
part_name: "Presentation"
overview_url: /course/block-10-github-actions/
presentation_url: /course/block-10-github-actions/presentation/
hands_on_url: /course/block-10-github-actions/hands-on/
permalink: /course/block-10-github-actions/presentation/
---
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
