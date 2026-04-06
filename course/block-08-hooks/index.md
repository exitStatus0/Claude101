---
layout: block
title: "Hooks — Workflow Automation"
block_number: 8
description: "Automate your Claude Code workflow with hooks — auto-format on save, block dangerous edits, get notifications, and build safety rails into every session."
time: "~35 min (10 min presentation + 25 min practical)"
features:
  - Hooks in settings.json
  - Event types (PreToolUse, PostToolUse, SessionStart, Stop)
  - Exit codes (0 = proceed, 2 = block)
  - Verbose mode (Ctrl+O)
objectives:
  - Understand hooks as lifecycle event listeners for Claude Code sessions
  - Create a PostToolUse hook that auto-formats code after every file edit
  - Create a PreToolUse hook that blocks edits to protected files
  - Build a SessionStart hook that prints project status
  - Add a notification hook for long-running task completion
  - Use verbose mode to debug hook execution
  - Create a prompt hook that asks for confirmation before destructive commands
---

## Teaching Claude Reflexes

In the last seven blocks, every action Claude took was something you explicitly asked for. "Add dark theme." "Review K8s manifests." "Generate a provisioning script." That's the conversational model — you ask, Claude does.

Hooks flip the script. Instead of you telling Claude what to do, you tell Claude what should _always happen_ — automatically, every time, without you having to remember. "After every file edit, run Prettier." "Before any edit to `.env`, stop and ask." "When a session starts, show me the git status."

Think of hooks as Claude's reflexes. You don't think about blinking — it just happens. Hooks are the same idea: actions that fire automatically at the right moment, so you can focus on the actual work instead of the ceremony around it.

## What We'll Cover

1. **What hooks are** — automated actions that fire at Claude Code lifecycle events
2. **The four hook types** — command, prompt, agent, and http
3. **Event types** — when hooks fire (before tools, after tools, session start, etc.)
4. **Exit codes** — how hooks control flow (proceed vs. block)
5. **Hands-on hooks** — auto-format, file protection, notifications, and confirmation prompts
6. **Verbose mode** — watching hooks fire in real time with `Ctrl+O`

## Why This Block Matters

Every team has rules that live in people's heads. "Don't edit `package-lock.json` manually." "Always run the linter before committing." "Ping the team channel when a deploy finishes." These rules get written in READMEs, mentioned in onboarding docs, and forgotten by the third week.

Hooks make these rules _enforceable_. Not by nagging people to follow them, but by making the right thing happen automatically. The file that shouldn't be edited? Blocked at the hook level. The formatter that should run after every change? Fires without anyone thinking about it. The notification that a long task finished? Pops up on its own.

This is the difference between a convention and a constraint. Conventions rely on memory. Constraints rely on code.

## Prerequisites

- Completed Blocks 0-7
- The ai-coderrank project open in Claude Code
- Basic familiarity with JSON configuration files
- macOS (for the notification hook example — Linux alternatives provided)

---

## Part 1: Presentation {#presentation}

> **Duration**: ~10 minutes
> **Goal**: Students understand what hooks are, the four types, how event matching works, and how exit codes control the flow.

---

### Slide 1: CI/CD for Your Claude Session

You know CI/CD pipelines, right? Something happens (a push, a merge, a schedule), and automated actions fire: lint, test, build, deploy. You don't run those manually every time — they're triggered by events.

Hooks are the same idea, but for your Claude Code session.

```
CI/CD Pipeline:               Claude Code Hooks:
  on: push                       on: PostToolUse (Write)
    - run: lint                    - run: prettier --write $FILE
    - run: test                  on: PreToolUse (Edit)
    - run: build                   - block if: .env, package-lock.json
                                 on: SessionStart
                                   - run: git status && echo "Ready!"
```

Something happens in Claude's workflow (a file gets edited, a command runs, a session starts), and your hooks fire automatically. No manual intervention. No "I forgot to run the linter." It just happens.

---

### Slide 2: The Four Hook Types

Claude Code supports four types of hooks. Each serves a different purpose:

#### 1. Command Hooks (shell scripts)

The most common type. Run any shell command.

```json
{
  "type": "command",
  "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); [ -n \"$FILE\" ] && prettier --write \"$FILE\""
}
```

Hooks receive context as JSON on stdin — use `jq` to extract the file path. Use for: formatting, linting, notifications, logging, file operations.

#### 2. Prompt Hooks (AI yes/no)

Ask Claude a question. If Claude says "no," the action is blocked.

```json
{
  "type": "prompt",
  "prompt": "Does this edit look like it could delete user data? Answer only yes or no."
}
```

Use for: safety checks that need reasoning, not just pattern matching.

#### 3. Agent Hooks (complex eval)

Spin up a separate Claude evaluation. More expensive, but can handle complex logic.

```json
{
  "type": "agent",
  "prompt": "Review this file change for security vulnerabilities. If you find any, return exit code 2."
}
```

Use for: security reviews, compliance checks, complex validation.

#### 4. HTTP Hooks (webhooks)

Send an HTTP request to an external service.

```json
{
  "type": "http",
  "url": "https://hooks.slack.com/services/T00/B00/xxx",
  "method": "POST",
  "body": "{\"text\": \"Claude session completed\"}"
}
```

Use for: Slack notifications, metrics collection, audit logging.

For this course, we'll focus on **command hooks** — they're the most practical and easiest to understand. The others follow the same pattern.

---

### Slide 3: Events — When Hooks Fire

Every hook listens for an **event**. Here are the ones you'll use most:

| Event | When It Fires | Common Use |
|-------|--------------|------------|
| `PreToolUse` | Before Claude uses a tool (Read, Write, Edit, Bash) | Block dangerous operations |
| `PostToolUse` | After Claude uses a tool | Auto-format, logging, notifications |
| `SessionStart` | When a Claude Code session begins | Print project status, check prerequisites |
| `Stop` | When Claude finishes a response | Notifications ("Claude is done!") |

There are more events, but these four cover 90% of real-world use cases.

#### Matchers: Filtering Which Tool Fires the Hook

You don't want your Prettier hook to fire when Claude _reads_ a file — only when it _writes_ one. That's what matchers do.

```json
{
  "event": "PostToolUse",
  "matcher": "Write|Edit",
  "hooks": [...]
}
```

The `matcher` is a regex that filters by **tool name**. Common tool names:
- `Write` — creating or overwriting a file
- `Edit` — modifying part of a file
- `Bash` — running a shell command
- `Read` — reading a file
- `Glob` — searching for files
- `Grep` — searching file contents

You can combine them: `"matcher": "Write|Edit"` fires on both writes and edits. `"matcher": "Bash"` fires only on shell commands.

---

### Slide 4: Exit Codes — Proceed or Block

Here's where hooks become powerful: they can **control the flow**.

When a `PreToolUse` hook runs, its exit code determines what happens next:

| Exit Code | Meaning | What Happens |
|-----------|---------|-------------|
| `0` | All good | Claude proceeds with the tool use |
| `2` | Block it | Claude is **prevented** from using the tool |
| Other | Error | Hook is ignored, Claude proceeds |

This is how you build safety rails:

```bash
#!/bin/bash
# pre-edit-check.sh — exits 2 if the file is protected
# Hook receives tool context as JSON on stdin
FILE=$(cat | jq -r '.tool_input.file_path // empty')
PROTECTED_FILES=".env package-lock.json yarn.lock"
for f in $PROTECTED_FILES; do
  if [[ "$FILE" == *"$f"* ]]; then
    echo "BLOCKED: $f is a protected file"
    exit 2
  fi
done
exit 0
```

Exit 0 = "go ahead." Exit 2 = "absolutely not." It's that simple.

> **Think of it like a bouncer at a club.** The hook checks the guest list (the file path), and either lets the operation in (exit 0) or turns it away (exit 2). No negotiation.

---

### Slide 5: Where Hooks Live

Hooks are configured in `settings.json` — the same file you've used for permissions. They can live at three levels:

**Project level** (`.claude/settings.json`):
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); [ -n \"$FILE\" ] && prettier --write \"$FILE\""
          }
        ]
      }
    ]
  }
}
```

**User level** (`~/.claude/settings.json`) — hooks that follow you across all projects.

**Enterprise level** — managed by your organization's admin.

The resolution order: enterprise > project > user. Enterprise hooks always run. Project and user hooks stack.

#### How Hooks Receive Context

When a hook fires, Claude Code passes context as **JSON on stdin**. Your hook script reads it with `jq` or similar tools. The JSON includes the tool name, file path, and other details depending on the event.

For PreToolUse and PostToolUse hooks, stdin looks like:

```json
{
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.ts",
    "content": "..."
  }
}
```

Extract values with `jq`:

```bash
# Get the file path from stdin
FILE_PATH=$(cat | jq -r '.tool_input.file_path // empty')
```

Additionally, these environment variables are always available:

| Variable | Description |
|----------|-------------|
| `$CLAUDE_PROJECT_DIR` | The project root directory |
| `$CLAUDE_ENV_FILE` | Path to the Claude env file |

These let your hook scripts be smart about _what_ they do based on _what Claude is doing_.

---

### Slide 6: Verbose Mode — Watching Hooks Work

How do you know your hooks are actually firing? **Verbose mode.**

Press `Ctrl+O` in Claude Code to toggle verbose output. When enabled, you'll see:

```
[hook] PostToolUse:Write matched "Write|Edit"
[hook] Running: prettier --write "src/app/page.tsx"
[hook] Exit code: 0 (proceed)
```

This is invaluable for debugging. If a hook isn't firing, verbose mode tells you why — wrong event, wrong matcher, wrong path. If a hook is firing when it shouldn't, you can see exactly what triggered it.

Toggle it on when building hooks. Toggle it off when you're done.

---

### Key Takeaways

| Concept | What It Is | When to Use |
|---------|-----------|-------------|
| Command hook | Runs a shell script | Formatting, notifications, logging |
| Prompt hook | Asks Claude yes/no | Safety checks that need reasoning |
| Agent hook | Complex Claude evaluation | Security reviews, compliance |
| HTTP hook | Sends a webhook | Slack, metrics, audit trails |
| Matcher | Regex filter on tool name | Target specific tools (Write, Bash, etc.) |
| Exit code 0 | Proceed | Hook approves the operation |
| Exit code 2 | Block | Hook prevents the operation |
| `Ctrl+O` | Toggle verbose mode | Debugging hook execution |

> **Transition**: Let's build some hooks. You're about to wire up auto-formatting, file protection, notifications, and a confirmation prompt — all firing automatically without you lifting a finger.

---

## Part 2: Hands-On {#practical}

> **Duration**: ~25 minutes
> **Outcome**: Five hooks -- auto-format on edit, file protection, session status, desktop notification, and a confirmation prompt.
> **Prerequisites**: Completed Blocks 0-7, the ai-coderrank project open in Claude Code

---

### Step 1: Auto-Format with Prettier After Every Edit (~5 min)

This is the most immediately useful hook. Every time Claude writes or edits a file, Prettier runs automatically. No more "oh, I forgot to format" moments.

First, make sure Prettier is installed in the ai-coderrank project:

```bash
cd ~/ai-coderrank
npx prettier --version
```

If it's not installed, ask Claude:

```
Add prettier as a dev dependency and create a basic .prettierrc config for a Next.js TypeScript project.
```

Now let's create the hook. Open `.claude/settings.json` in the ai-coderrank project. If it already has content (from Block 5 permissions), you'll be adding to it. Ask Claude:

```
Add a PostToolUse hook to .claude/settings.json that runs Prettier on any file 
after Claude writes or edits it. The hook should:
- Only fire on Write and Edit tool uses
- Read the file path from stdin JSON using jq
- Run prettier --write on the affected file
```

The result should look like this:

```json
{
  "permissions": {
    "allow": ["Read", "Glob", "Grep", "Write", "Edit", "Bash"]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); [ -n \"$FILE\" ] && npx prettier --write \"$FILE\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

A few things to notice:
- **`"matcher": "Write|Edit"`** — the hook only fires when Claude uses the Write or Edit tool. Not on Read, not on Bash, not on Grep.
- **`cat | jq -r '.tool_input.file_path'`** — hooks receive context as JSON on stdin. We extract the file path with `jq`. This is how all Claude Code hooks access tool context.
- **`2>/dev/null || true`** — suppresses Prettier errors for non-formattable files (like `.md` or `.yaml` if Prettier isn't configured for them). The `|| true` ensures the hook always exits 0, so it never accidentally blocks Claude.

#### Test It

Start a new Claude Code session (so it picks up the new settings) and ask:

```
Add a comment to the top of src/app/page.tsx that says "// Auto-formatted by Prettier hook"
```

Watch what happens. Claude edits the file, and then Prettier immediately formats it. If you have verbose mode on (`Ctrl+O`), you'll see the hook fire in the output.

---

### Step 2: Block Edits to Protected Files (~5 min)

Some files should never be edited by Claude (or anyone, without careful thought). `package-lock.json`, `.env`, lock files — these are generated or contain secrets.

Ask Claude:

```
Add a PreToolUse hook to .claude/settings.json that blocks Claude from editing 
or writing to these files:
- .env (and any .env.* variants)
- package-lock.json
- yarn.lock
- pnpm-lock.yaml

The hook should exit with code 2 to block the operation and print a message 
explaining why.
```

Claude will add a PreToolUse section to your settings:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); case \"$FILE\" in *.env|*.env.*|*package-lock.json|*yarn.lock|*pnpm-lock.yaml) echo \"BLOCKED: $FILE is a protected file. Edit it manually.\"; exit 2;; esac; exit 0"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); [ -n \"$FILE\" ] && npx prettier --write \"$FILE\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

The key is **`exit 2`**. That tells Claude Code: "This operation is not allowed. Do not proceed." Claude will see the block, read the message, and tell you it couldn't edit the file.

#### Test It

In your Claude session:

```
Add a new variable MY_TEST=hello to the .env file
```

Claude will attempt to edit `.env`, the hook will fire, and you'll see it get blocked. Claude should respond with something like "I wasn't able to edit .env — it's a protected file."

> **Note**: This doesn't prevent Claude from _reading_ `.env` (the matcher is `Write|Edit`, not `Read`). If you want to block reads too, add a separate PreToolUse entry with `"matcher": "Read"` and the same file checks.

---

### Step 3: Session Start Status Hook (~3 min)

Wouldn't it be nice if every Claude session started with a quick project status check? Current branch, uncommitted changes, last commit — like a dashboard that appears automatically.

Ask Claude:

```
Add a SessionStart hook to .claude/settings.json that runs a shell script 
printing:
- Current git branch
- Number of uncommitted changes
- Last commit message and date
- Whether the K8s cluster is reachable (kubectl cluster-info, with a timeout)

Keep it concise — 5-6 lines of output max.
```

The hook:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '--- Project Status ---' && echo \"Branch: $(git branch --show-current)\" && echo \"Changes: $(git status --porcelain | wc -l | tr -d ' ') files modified\" && echo \"Last commit: $(git log -1 --format='%s (%cr)')\" && echo \"K8s: $(kubectl cluster-info --request-timeout=2s 2>/dev/null | head -1 || echo 'not reachable')\" && echo '---------------------'"
          }
        ]
      }
    ]
  }
}
```

Notice: no `matcher` on SessionStart. It doesn't need one — there's no tool involved, it just fires when the session begins.

#### Test It

Exit Claude Code and start a new session:

```bash
claude
```

You should see the status output appear before the prompt is ready. Something like:

```
--- Project Status ---
Branch: main
Changes: 2 files modified
Last commit: Add dark theme toggle (3 hours ago)
K8s: Kubernetes control plane is running at https://<IP>:6443
---------------------
```

---

### Step 4: Desktop Notification Hook (~5 min)

When Claude is working on a long task (implementing a feature, running tests, deploying), you might switch to another window. It would be great to get a notification when it's done.

Ask Claude:

```
Add a Stop event hook to .claude/settings.json that sends a macOS desktop 
notification when Claude finishes a response. Use osascript to display a 
notification with the title "Claude Code" and the message "Task completed".

Also provide a Linux alternative using notify-send.
```

**macOS version:**

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Task completed\" with title \"Claude Code\" sound name \"Glass\"'"
          }
        ]
      }
    ]
  }
}
```

**Linux version (alternative):**

```json
{
  "type": "command",
  "command": "notify-send 'Claude Code' 'Task completed' --icon=terminal 2>/dev/null || true"
}
```

#### Test It

Start a new session and ask Claude to do something that takes a few seconds:

```
Read every file in the k8s/ directory and give me a one-sentence summary of each.
```

When it finishes, you should get a macOS notification. Switch to a different app while it's working to verify the notification pops up.

> **Refinement idea**: You might not want a notification for every tiny response. You can make the hook smarter — for example, only notify if the response took more than 10 seconds. That requires a more complex script, but Claude can generate it:
>
> ```
> Modify the Stop notification hook to only fire if the Claude response 
> took longer than 10 seconds. Use a SessionStart hook to save the start 
> timestamp and a Stop hook to check the elapsed time.
> ```

---

### Step 5: Enable Verbose Mode and Watch Hooks Fire (~2 min)

Now you have four hooks configured. Let's see them in action with verbose mode.

In your Claude Code session, press **`Ctrl+O`** to toggle verbose output. You'll see `[verbose mode enabled]` appear.

Now do something that triggers hooks:

```
Add a TODO comment to the top of src/app/layout.tsx
```

In verbose mode, you'll see output like:

```
[hook] PreToolUse:Edit checking matcher "Write|Edit" → matched
[hook] Running: FILE=$(cat | jq -r ...) ...
[hook] Exit code: 0 (proceed)
[tool] Edit src/app/layout.tsx
[hook] PostToolUse:Edit checking matcher "Write|Edit" → matched
[hook] Running: npx prettier --write "src/app/layout.tsx"
[hook] Exit code: 0
```

This shows you exactly:
1. The PreToolUse hook fired and checked if the file was protected (it wasn't, so exit 0)
2. Claude edited the file
3. The PostToolUse hook fired and ran Prettier

Press `Ctrl+O` again to disable verbose mode when you're done debugging.

---

### Step 6: Create a Confirmation Prompt Hook (~5 min)

For our final hook, let's build something that asks "are you sure?" before Claude runs potentially destructive shell commands. Specifically, commands involving `rm`, `git reset`, `git push --force`, or `kubectl delete`.

Ask Claude:

```
Add a PreToolUse hook for the Bash tool that checks if the command contains 
any of these patterns: "rm -rf", "git reset --hard", "git push --force", 
"kubectl delete namespace", "DROP TABLE", "docker system prune".

If any pattern is found, the hook should:
1. Print the command that's about to run
2. Print "This looks like a destructive command."
3. Ask the user for confirmation (read from /dev/tty)
4. Exit 2 (block) if the user says no, exit 0 if they say yes

Add it as a separate PreToolUse entry with matcher "Bash".
```

The hook script:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "CMD=$(cat | jq -r '.tool_input.command // empty'); DANGEROUS_PATTERNS='rm -rf|git reset --hard|git push --force|git push -f|kubectl delete namespace|DROP TABLE|docker system prune'; if echo \"$CMD\" | grep -qE \"$DANGEROUS_PATTERNS\"; then echo \"\" && echo \"WARNING: Destructive command detected:\" && echo \"  $CMD\" && echo \"\" && read -p 'Allow this command? (y/N): ' CONFIRM < /dev/tty; if [ \"$CONFIRM\" = 'y' ] || [ \"$CONFIRM\" = 'Y' ]; then exit 0; else echo 'Blocked by user.'; exit 2; fi; else exit 0; fi"
    }
  ]
}
```

#### Test It

Ask Claude to do something destructive:

```
Delete the k8s namespace for ai-coderrank using kubectl
```

Claude will try to run `kubectl delete namespace ai-coderrank`. The hook will catch it, show you the command, and ask for confirmation. Type `n` to block it, or `y` to allow it.

---

### Complete Configuration

After all hooks, your `.claude/settings.json` should look something like this:

```json
{
  "permissions": {
    "allow": ["Read", "Glob", "Grep", "Write", "Edit", "Bash"]
  },
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '--- Project Status ---' && echo \"Branch: $(git branch --show-current)\" && echo \"Changes: $(git status --porcelain | wc -l | tr -d ' ') files modified\" && echo \"Last commit: $(git log -1 --format='%s (%cr)')\" && echo \"K8s: $(kubectl cluster-info --request-timeout=2s 2>/dev/null | head -1 || echo 'not reachable')\" && echo '---------------------'"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); case \"$FILE\" in *.env|*.env.*|*package-lock.json|*yarn.lock|*pnpm-lock.yaml) echo \"BLOCKED: $FILE is a protected file. Edit it manually.\"; exit 2;; esac; exit 0"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "CMD=$(cat | jq -r '.tool_input.command // empty'); DANGEROUS_PATTERNS='rm -rf|git reset --hard|git push --force|git push -f|kubectl delete namespace|DROP TABLE|docker system prune'; if echo \"$CMD\" | grep -qE \"$DANGEROUS_PATTERNS\"; then echo \"\" && echo \"WARNING: Destructive command detected:\" && echo \"  $CMD\" && echo \"\" && read -p 'Allow this command? (y/N): ' CONFIRM < /dev/tty; if [ \"$CONFIRM\" = 'y' ] || [ \"$CONFIRM\" = 'Y' ]; then exit 0; else echo 'Blocked by user.'; exit 2; fi; else exit 0; fi"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty'); [ -n \"$FILE\" ] && npx prettier --write \"$FILE\" 2>/dev/null || true"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Task completed\" with title \"Claude Code\" sound name \"Glass\"'"
          }
        ]
      }
    ]
  }
}
```

That's five hooks in a single config file, covering:
- Auto-formatting (PostToolUse)
- File protection (PreToolUse on Write|Edit)
- Destructive command confirmation (PreToolUse on Bash)
- Session status dashboard (SessionStart)
- Desktop notifications (Stop)

---

### Checkpoint

Your hooks are now active. Here's what fires and when:

| When | What Fires | What It Does |
|------|-----------|-------------|
| Session starts | SessionStart hook | Prints branch, changes, last commit, cluster status |
| Before Claude edits a file | PreToolUse (Write\|Edit) | Checks if file is protected; blocks if so |
| Before Claude runs a command | PreToolUse (Bash) | Checks for destructive patterns; asks confirmation |
| After Claude edits a file | PostToolUse (Write\|Edit) | Runs Prettier on the modified file |
| After Claude finishes a response | Stop hook | Sends a macOS notification |

These hooks are _always on_. You don't have to remember to format. You don't have to worry about `.env` getting clobbered. You don't have to keep checking if Claude is done. It's all automated.

---

### Bonus Challenges

**Challenge 1: Logging hook**
Create a PostToolUse hook that appends a log entry to `.claude/hook-log.txt` every time Claude uses a tool. Include the timestamp, tool name, and file path (if applicable). This creates an audit trail of everything Claude did in a session.

**Challenge 2: Auto-lint hook**
Add a PostToolUse hook that runs ESLint (with `--fix`) after file edits, in addition to Prettier. Chain them: Prettier first, then ESLint.

**Challenge 3: Branch protection hook**
Create a PreToolUse hook for Bash that blocks `git push` commands when you're on the `main` branch. Force Claude (and yourself) to use feature branches.

---

> **Next up**: In Block 9, we break out of the local terminal entirely. MCP servers connect Claude to GitHub, databases, Slack, and dozens of other tools — turning it from a coding assistant into a full development workflow engine.
