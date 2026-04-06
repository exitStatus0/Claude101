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
---
> **Attention point:** Every command or prompt block on this page is meant to be copied directly into your terminal or Claude session unless the text says otherwise.

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

> **Attention point:** "See that permission prompt? Every single time Claude wants to run a command, you see exactly what it's about to do. You're always in the driver's seat. The AI proposes, you approve."

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

> **Attention point:** Open `http://localhost:3000` in a browser to show the running dashboard. Point out the model comparison charts, the pricing table, the theme toggle. This is the app we'll be working with throughout the course.

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

> **Attention point:** "Notice how Claude seamlessly switches between running commands and reading files. It ran the tests, saw the output, and now it's reading the test files to explain the organization. That's the agent model — it uses whatever tool is appropriate for the question."

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

> **Attention point:** "We just went from source code to a Docker image in one command. And Claude can explain every layer of that build because it's read the Dockerfile AND seen the build output. That's contextual understanding you don't get from just reading docs."

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

> **Attention point:** "This is my favorite demo in the entire course. We broke something on purpose, and Claude: read the error, found the file, understood the problem, proposed the fix, and applied it — all in about 10 seconds. This is the error handling loop I was talking about in the presentation. This loop alone will save you hours every week."

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

> **Attention point:** "Compacting is like writing meeting notes. You keep the decisions and action items, but drop the lengthy discussion. Claude's context window stays fresh, and you can keep working without starting over."

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
