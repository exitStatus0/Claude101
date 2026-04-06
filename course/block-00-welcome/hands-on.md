---
layout: block-part
title: "Welcome & Setup"
block_number: 0
description: "Hands-on implementation steps for Block 00."
time: "~15 minutes"
part_name: "Hands-On"
overview_url: /course/block-00-welcome/
presentation_url: /course/block-00-welcome/presentation/
hands_on_url: /course/block-00-welcome/hands-on/
permalink: /course/block-00-welcome/hands-on/
---
> **Direct speech:** "Everything on this hands-on page is built so you can follow me line by line. When you see a command or prompt block, you can copy it directly into your terminal or Claude session unless I explicitly tell you it is just reference material. As we go, compare your result with mine on screen so you can catch mistakes early instead of stacking them up."

> **Duration**: ~15 minutes
> **Outcome**: Claude Code installed, authenticated, and running inside the ai-coderrank project with a successful first conversation
> **Prerequisites**: Node.js 18+, Git, GitHub account, Anthropic Pro subscription

---

### Step 1: Install Claude Code

Open your terminal and install Claude Code using the current official native installer:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

If you prefer a package manager:

- macOS: `brew install --cask claude-code`
- Windows: `winget install Anthropic.ClaudeCode`

Node.js is still required for the course project later, but it is not required just to install Claude Code itself with the native installer.

**Verify the installation:**

```bash
claude --version
```

You should see a version number printed. If you see `command not found`, restart your terminal (or run `source ~/.zshrc` / `source ~/.bashrc`) so your PATH picks up the new binary.

> **Direct speech:** "I want you to notice how boring this install is in the best possible way. One official install command, a few seconds of setup, and we are done. On macOS you can also use Homebrew, and on Windows WinGet is fine too. The result we want here is simple: `claude --version` works, and we are ready to move straight into the real workflow."

---

### Step 2: Authenticate

Now launch Claude Code for the first time:

```bash
claude
```

On first run, Claude Code will prompt you to authenticate. Follow the on-screen instructions — it will open a browser window where you sign into your Anthropic account and authorize Claude Code.

**Requirements**: You need an active Anthropic Pro subscription ($20/month, recommended for this course). Claude Code is included with Pro and Max plans. Pro gives you Sonnet and Haiku in Claude Code — that's all you need for this course. See the [Cost Guide]({{ '/resources/cost-guide' | relative_url }}) for details.

After authentication succeeds, you'll land in an interactive session. You should see a prompt that looks something like:

```text
claude >
```

Congratulations — you're in. But before we start chatting, let's learn the controls.

> **Direct speech:** "Watch the auth flow carefully here. Once I sign in, Claude Code usually remembers the session, so this is a setup step, not an everyday ritual. The result you want is the interactive `claude >` prompt, because that is the moment your local terminal is actually connected and ready to work."

---

### Step 3: Explore /help

While still in the Claude Code session, type:

```text
/help
```

This shows you all available slash commands. Take a moment to scan through them. The ones we'll use most in this course:

| Command | What it does |
|---------|-------------|
| `/help` | Shows all available commands |
| `/init` | Generates a CLAUDE.md file for your project |
| `/clear` | Clears conversation history and starts fresh |
| `/compact` | Summarizes the conversation to save context window space |
| `/cost` | Shows how many tokens you've used in this session |

> **Direct speech:** "Think of `/help` as your control panel. You are not supposed to memorize every command on day one. The result I want here is simple: you know where to look when you forget something, so you keep moving instead of breaking flow to search documentation."

**Try a quick conversation:**

Type something simple to verify everything works:

```text
What can you help me with?
```

Claude will respond with an overview of its capabilities. Notice how it mentions reading files, running commands, editing code — these aren't just claims, these are actual tools it has access to. We'll see them in action very soon.

Now exit the session:

```text
/exit
```

---

### Step 4: Fork and Clone ai-coderrank

Head to the course project repository on GitHub:

```text
https://github.com/exitStatus0/ai-coderrank
```

**Fork the repo** using the GitHub UI (click the "Fork" button in the top right).

Then clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/ai-coderrank.git
cd ai-coderrank
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**Quick sanity check** — make sure the project files are there:

```bash
ls
```

You should see the Next.js project structure: `package.json`, `src/`, `public/`, `Dockerfile`, `k8s/`, `.github/`, and more.

> **Direct speech:** "I am showing the fork, clone, and file listing on purpose, because this is where the course becomes real. I want you to see the repository on disk and recognize the important directories right away: `src` for application code, `k8s` for manifests, and `.github` for automation. The expected result is that Claude is about to enter a real project, not a fake demo sandbox."

---

### Step 5: Run Claude Code Inside the Project

This is the moment. Navigate into the project directory (if you aren't already there) and launch Claude Code:

```bash
cd ai-coderrank
claude
```

Now ask Claude something about the project:

```text
What is this project? Give me a quick summary.
```

**Watch what happens.** Claude doesn't just guess based on the directory name. It actively reads files — you'll see it access `package.json`, `README.md`, maybe peek at `src/` — to build a real understanding of what this project does.

**Try a few more questions:**

```text
What tech stack does this project use?
```

```text
What does the file structure look like?
```

```text
Are there any Docker or Kubernetes configs in this project?
```

Notice how Claude cites specific files and paths in its answers. It's not hallucinating — it's reading your actual codebase. This is the fundamental difference between Claude Code and a generic chatbot.

> **Direct speech:** "See those file reads happening? Claude is literally opening files on my machine and using that live context to answer. That is the key mental model for this whole course. The result I want you to internalize is that Claude Code is not guessing about some generic Next.js app; it is reasoning over this exact repository in real time."

---

### Step 6: Check Your Token Usage

Before wrapping up, let's see what that conversation cost:

```text
/cost
```

This shows you the token count for the current session. In a typical first conversation, you'll use a relatively small number of tokens — the real usage comes when Claude starts reading many files and making edits (which we'll do starting in Block 1).

> **Direct speech:** "I always check `/cost` early so you build the habit from day one. The result here is not just a number on screen; it is confidence that you can monitor usage and stay in control. For normal day-to-day development on Pro, this kind of onboarding session is comfortably within expected usage."

---

### Step 7: Exit

Clean exit:

```text
/exit
```

---

### What Just Happened?

Let's recap what we accomplished:

1. **Installed** Claude Code with the official installer
2. **Authenticated** with our Anthropic Pro subscription
3. **Explored** the `/help` system to see available commands
4. **Forked and cloned** the ai-coderrank project — our course companion
5. **Had our first conversation** with Claude Code inside a real codebase
6. **Watched Claude read actual files** to answer questions about our project

You now have a working Claude Code setup pointed at a real Next.js application. In the next block, we'll go much deeper — using `/init` to generate a CLAUDE.md file and having Claude explain the architecture, API routes, and component structure in detail.

---

### Troubleshooting

**"command not found: claude"**
Restart your terminal or source your shell config: `source ~/.zshrc` or `source ~/.bashrc`.

**Authentication fails or times out**
Make sure you have an active Pro subscription at [claude.ai](https://claude.ai). Free tier does not include Claude Code access.

**"Permission denied" during install**
If `npm install -g` fails with permission errors, either fix your npm global prefix (`npm config set prefix ~/.npm-global` and add `~/.npm-global/bin` to your PATH) or use a Node version manager like `nvm` which avoids this issue entirely.
