---
layout: block-part
title: "Running & Testing Locally"
block_number: 2
description: "Hands-on implementation steps for Block 02."
time: "~25 minutes"
part_name: "Hands-On"
overview_url: /course/block-02-running-testing/
presentation_url: /course/block-02-running-testing/presentation/
hands_on_url: /course/block-02-running-testing/hands-on/
permalink: /course/block-02-running-testing/hands-on/
locale: en
translation_key: block-02-hands-on
---
> **Direct speech:** "Everything on this hands-on page is built so you can follow me line by line. When you see a command or prompt block, you can copy it directly into your terminal or Claude session unless I explicitly tell you it is just reference material. As we go, compare your result with mine on screen so you can catch mistakes early instead of stacking them up."

> **Duration**: ~25 minutes
> **Outcome**: Project fully set up locally with dependencies installed, tests passing, Docker image built, and first-hand experience with Claude's error-handling loop
> **Prerequisites**: Block 1 completed, Claude Code running inside the ai-coderrank project

---

### Step 1: Start a Fresh Session

Navigate to the project and launch Claude Code:

```bash
cd ai-coderrank
claude
```

Since we had a conversation in Block 1, let's start clean:

```text
/clear
```

This wipes the previous conversation. Claude starts with a blank slate (but still reads CLAUDE.md automatically, so it knows about the project).

---

### Step 2: Install Dependencies

Ask Claude to set up the project:

```text
Install the project dependencies
```

**Watch what happens.** Claude will propose running `npm install`. You'll see a permission prompt:

```text
Claude wants to run: npm install
Allow? (y/n)
```

Type `y` to approve. This is the permission model in action — Claude never runs a command without your explicit approval.

Watch the npm install output scroll by. Claude reads the output too, and if there are any warnings or errors, it will flag them.

> **Direct speech:** "See that permission prompt? That is one of the healthiest parts of the whole experience. Claude proposes the action, and you stay in control of what actually runs. The result you should expect is visibility and approval at the command layer, not blind automation."

---

### Step 3: Start the Dev Server

Now let's run the application:

```text
Start the development server
```

Claude will propose running `npm run dev`. Approve it.

You should see the familiar Next.js dev server output — something like:

```text
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

> **Direct speech:** "I always open the app in the browser at this point so you can connect the terminal work to a real interface. I want you to see the dashboard, the charts, the pricing table, and the theme toggle before we start changing anything. The expected result is a clear visual baseline for every later edit."

**Important**: The dev server is now running in Claude's terminal. To continue working with Claude, you'll need to stop the server. Ask Claude:

```text
Stop the dev server
```

Claude will send a Ctrl+C signal to terminate the process.

---

### Step 4: Run the Test Suite

Now let's verify that everything passes:

```text
Run the tests
```

Claude will propose `npm test` (or whatever the project's test command is). Approve it.

Watch the test output. Claude reads every line — if any tests fail, it will tell you which ones and why.

**Follow up:**

```text
What test framework is this project using and how are the tests organized?
```

This combines Claude's Bash tool (it just ran the tests) with its Read tool (it will look at test files to explain the organization). It's a natural back-and-forth.

> **Direct speech:** "Notice how Claude moves between commands and files without drama. It ran the tests, read the output, and then opened the test files to explain what it found. The result I want you to see is tool selection based on context, not one fixed interaction pattern."

---

### Step 5: Run the Linter

Code quality check:

```text
Run the linter and show me if there are any issues
```

Claude will propose running the lint command (usually `npm run lint` for Next.js projects). Approve it.

If the linter finds issues, Claude will list them with file locations and explanations. If it's clean, Claude will confirm.

**Optional follow-up if there are lint warnings:**

```text
Fix the lint issues you found
```

This is where you'll see Claude shift from reading/running to editing. It will propose changes to files to fix the lint warnings, and you'll see the permission prompt for each file edit.

---

### Step 6: Build the Docker Image

Let's test the containerized build:

```text
Build the Docker image for this project
```

Claude will propose a `docker build` command. Something like:

```bash
docker build -t ai-coderrank .
```

Approve it and watch the multi-stage build execute. This takes a minute or two. Claude reads the build output and can explain each stage.

**Follow up:**

```text
Explain what just happened during the Docker build. What did each stage do?
```

Claude will reference both the Dockerfile it read in Block 1 and the build output it just observed to give you a clear explanation of the multi-stage build process.

> **Direct speech:** "This is a big milestone: we just went from source code to a Docker image in one step. Because Claude has read the Dockerfile and watched the build output, it can explain both the intention and the result. The expected outcome is not only a successful build, but a much clearer mental model of how the app gets packaged."

---

### Step 7: The Break-and-Fix Exercise

This is the highlight of Block 2. We're going to deliberately break the application and watch Claude diagnose and fix it.

**Step 7a: Introduce a bug**

Open a source file in your regular editor (VS Code, vim, whatever) and introduce a deliberate error. Some ideas:

- **TypeScript error**: Remove a required prop from a component call
- **Import error**: Rename an import to something that doesn't exist
- **Syntax error**: Delete a closing bracket or parenthesis

For example, open `src/app/page.tsx` and break an import:

```typescript
// Change this:
import { ModelCard } from '@/components/ModelCard'
// To this:
import { ModelCard } from '@/components/ModelCardBROKEN'
```

Save the file.

**Step 7b: Ask Claude to check**

Go back to your Claude Code session:

```text
Run the TypeScript compiler to check for errors
```

Claude will propose running `npx tsc --noEmit` or a similar type-check command. Approve it.

The compiler will fail. Now watch the magic:

```text
Fix the error
```

Claude will:

1. Read the error output from the TypeScript compiler
2. Identify the file and line number
3. Read the broken file
4. Understand what went wrong (the import path is incorrect)
5. Propose the fix (change the import back to the correct path)
6. Ask permission to edit the file

Approve the edit. Then verify:

```text
Run the type check again to make sure it's fixed
```

It should pass now.

> **Direct speech:** "This is one of the most valuable loops in the entire course. We broke something on purpose, Claude read the error, found the file, reasoned about the fix, and applied it fast. The result I want you to remember is that debugging stops being a dead end and becomes a tight feedback loop you can repeat every day."

---

### Step 8: Use /compact

By now, we've had a long conversation — installation, dev server, tests, linting, Docker build, the break-and-fix exercise. Let's compress it:

```text
/compact
```

Claude will summarize the conversation into a compressed form. You'll see it condense everything into key points while preserving the important context (like the fact that we're working on ai-coderrank, that tests pass, that the Docker build succeeds).

After compacting, verify that Claude still has context:

```text
What did we accomplish in this session so far?
```

Claude should give you a summary of everything you've done, even though the detailed back-and-forth has been compressed.

> **Direct speech:** "I want you to think about `/compact` like writing sharp meeting notes. You keep the decisions and discard the rambling. The result is a cleaner context window, a fresher session, and less need to restart just because the conversation got long."

---

### Step 9: Exit

```text
/exit
```

---

### What Just Happened?

This was a big block. Let's recap:

1. **npm install** — Claude set up the project dependencies (permission model: first contact)
2. **Dev server** — Claude started and stopped the Next.js development server
3. **Tests** — Claude ran the test suite and explained the testing setup
4. **Linter** — Claude checked code quality and (optionally) fixed issues
5. **Docker build** — Claude built the multi-stage Docker image and explained the process
6. **Break-and-fix** — You deliberately broke the code, Claude diagnosed it and applied the fix
7. **Context management** — You used `/clear` to start fresh and `/compact` to compress a long session

You've now experienced all three of Claude Code's core capabilities:
- **Reading** code (Block 1)
- **Running** commands (Block 2)
- **Editing** files (the break-and-fix exercise)

That's the complete agent trifecta. Everything from here on builds on these three capabilities.

---

### Troubleshooting

**"Docker not found" or docker build fails**
Make sure Docker Desktop is installed and running. On macOS: open Docker Desktop from Applications. On Linux: ensure the Docker daemon is running (`sudo systemctl start docker`).

**npm install fails with permission errors**
Try clearing the npm cache: `npm cache clean --force`. If you're on macOS and see EACCES errors, you may need to fix npm permissions — see the [npm docs](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally).

**Dev server port already in use**
If port 3000 is occupied, you'll see an EADDRINUSE error. Either stop whatever's running on 3000, or ask Claude: "Start the dev server on port 3001".

**Claude seems slow or confused after a long session**
Use `/compact` to compress the conversation, or `/clear` for a full reset. Long conversations with many tool calls can fill the context window.
