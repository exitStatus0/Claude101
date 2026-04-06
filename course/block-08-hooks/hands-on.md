---
layout: block-part
title: "Hooks — Workflow Automation"
block_number: 8
description: "Hands-on implementation steps for Block 08."
time: "~25 minutes"
part_name: "Hands-On"
overview_url: /course/block-08-hooks/
presentation_url: /course/block-08-hooks/presentation/
hands_on_url: /course/block-08-hooks/hands-on/
permalink: /course/block-08-hooks/hands-on/
locale: en
translation_key: block-08-hands-on
---
> **Direct speech:** "Everything on this hands-on page is built so you can follow me line by line. When you see a command or prompt block, you can copy it directly into your terminal or Claude session unless I explicitly tell you it is just reference material. As we go, compare your result with mine on screen so you can catch mistakes early instead of stacking them up."

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

```text
Add prettier as a dev dependency and create a basic .prettierrc config for a Next.js TypeScript project.
```

Now let's create the hook. Open `.claude/settings.json` in the ai-coderrank project. If it already has content (from Block 5 permissions), you'll be adding to it. Ask Claude:

```text
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

```text
Add a comment to the top of src/app/page.tsx that says "// Auto-formatted by Prettier hook"
```

Watch what happens. Claude edits the file, and then Prettier immediately formats it. If you have verbose mode on (`Ctrl+O`), you'll see the hook fire in the output.

---

### Step 2: Block Edits to Protected Files (~5 min)

Some files should never be edited by Claude (or anyone, without careful thought). `package-lock.json`, `.env`, lock files — these are generated or contain secrets.

Ask Claude:

```text
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

```text
Add a new variable MY_TEST=hello to the .env file
```

Claude will attempt to edit `.env`, the hook will fire, and you'll see it get blocked. Claude should respond with something like "I wasn't able to edit .env — it's a protected file."

> **Note**: This doesn't prevent Claude from _reading_ `.env` (the matcher is `Write|Edit`, not `Read`). If you want to block reads too, add a separate PreToolUse entry with `"matcher": "Read"` and the same file checks.

---

### Step 3: Session Start Status Hook (~3 min)

Wouldn't it be nice if every Claude session started with a quick project status check? Current branch, uncommitted changes, last commit — like a dashboard that appears automatically.

Ask Claude:

```text
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

```text
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

```text
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

```text
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

```text
Add a TODO comment to the top of src/app/layout.tsx
```

In verbose mode, you'll see output like:

```text
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

```text
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

```text
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
