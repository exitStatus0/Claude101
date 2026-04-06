---
layout: block-part
title: "Hooks — Workflow Automation"
block_number: 8
description: "Presentation notes and speaking flow for Block 08."
part_name: "Presentation"
overview_url: /course/block-08-hooks/
presentation_url: /course/block-08-hooks/presentation/
hands_on_url: /course/block-08-hooks/hands-on/
permalink: /course/block-08-hooks/presentation/
---
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
