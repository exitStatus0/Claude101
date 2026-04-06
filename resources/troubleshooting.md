---
layout: resource
title: "Troubleshooting"
purpose: "Find your failure mode and fix it — fast."
verified: "2026-04-06"
permalink: /resources/troubleshooting/
---

## Quick Triage

Pick your problem area:

<div class="card-grid">
  <a href="#claude-code-issues" class="quick-card">Claude Code Issues</a>
  <a href="#mcp-issues" class="quick-card">MCP Issues</a>
  <a href="#hook-issues" class="quick-card">Hook Issues</a>
  <a href="#infra-issues" class="quick-card">k3s / Infra Issues</a>
  <a href="#public-access-issues" class="quick-card">Public Access Issues</a>
  <a href="#argocd-issues" class="quick-card">ArgoCD Issues</a>
  <a href="#github-actions-issues" class="quick-card">GitHub Actions Issues</a>
</div>

---

## Start Here

<div class="callout-daily">

Before diving into specific issues, try these five universal checks:

1. **Update Claude** — stale versions cause most weird bugs.
   ```bash
   claude update
   ```
2. **Restart your session** — exit the terminal and run `claude` again. A fresh session clears transient state.
3. **Check verbose mode** — press `Ctrl+O` to see what Claude is doing under the hood.
4. **Verify config locations** — project settings live in `.claude/settings.json`; MCP config lives in `.mcp.json` (project) or `~/.claude.json` (user).
5. **Ask Claude with the pasted error** — often the fastest path:
   ```
   "I'm getting this error: <paste>"
   ```

</div>

---

## Claude Code Issues {#claude-code-issues}

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>Session hangs / no response</h3>
<p><strong>Check:</strong> Is the spinner moving? Press <code>Ctrl+C</code> to interrupt.</p>
<p><strong>Likely cause:</strong> A long-running tool call timed out, or a network blip stalled the connection.</p>
<p><strong>Fix:</strong></p>

```bash
Ctrl+C        # interrupt current turn
/clear        # reset session state
```

If still stuck, close the terminal entirely and run `claude` in a new window.

<p><strong>Success signal:</strong> Claude responds to your next prompt within a few seconds.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>Permission denied on every command</h3>
<p><strong>Check:</strong> Which permission mode are you running in?</p>
<p><strong>Likely cause:</strong> Default mode requires approval for every tool call.</p>
<p><strong>Fix:</strong> Press <code>Shift+Tab</code> to cycle permission modes, or launch with a more permissive mode:</p>

```bash
claude --permission-mode acceptEdits
```

You can also press `a` during a prompt to allow a tool for the rest of the session.

<p><strong>Success signal:</strong> Commands run without repeated confirmation prompts.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>CLAUDE.md not loading</h3>
<p><strong>Check:</strong> Run <code>/memory</code> inside a session to see what files are loaded.</p>
<p><strong>Likely cause:</strong> The file is in the wrong directory or has a broken <code>@path</code> import.</p>
<p><strong>Fix:</strong> Ensure the file is at <code>./CLAUDE.md</code> or <code>./.claude/CLAUDE.md</code> relative to where you launch Claude. Fix any <code>@path</code> references so they resolve correctly.</p>
<p><strong>Success signal:</strong> <code>/memory</code> shows your CLAUDE.md content.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>Skills not showing up</h3>
<p><strong>Check:</strong> Verify the skill file exists at the expected path.</p>
<p><strong>Likely cause:</strong> The SKILL.md file is misplaced or the directory structure is wrong.</p>
<p><strong>Fix:</strong> Skills must live at one of these paths:</p>

```
Project: .claude/skills/<skill-name>/SKILL.md
User:    ~/.claude/skills/<skill-name>/SKILL.md
```

After fixing, start a new session — skills load at startup.

<p><strong>Success signal:</strong> The skill appears when Claude lists available capabilities.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>Auto memory not working</h3>
<p><strong>Check:</strong> Confirm your version and settings.</p>
<p><strong>Likely cause:</strong> Outdated Claude Code version or the feature is disabled in settings.</p>
<p><strong>Fix:</strong></p>

```bash
claude --version   # needs v2.1.59+
claude update
```

Then verify `~/.claude/settings.json` contains:

```json
{ "autoMemoryEnabled": true }
```

<p><strong>Success signal:</strong> Claude proactively saves facts between sessions.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>Context getting too long</h3>
<p><strong>Check:</strong> Is Claude forgetting earlier instructions or repeating itself?</p>
<p><strong>Likely cause:</strong> The conversation has exceeded the effective context window.</p>
<p><strong>Fix:</strong> Compact the conversation proactively — don't wait until Claude starts forgetting.</p>

```bash
/compact
```

<p><strong>Success signal:</strong> Claude responds coherently with awareness of earlier context.</p>
</div>

---

## MCP Issues {#mcp-issues}

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>MCP server not connecting</h3>
<p><strong>Check:</strong> Is the config in the right file? Project-level: <code>.mcp.json</code>. User-level: <code>~/.claude.json</code>.</p>
<p><strong>Likely cause:</strong> Missing environment variables, wrong server command path, or the server binary isn't installed.</p>
<p><strong>Fix:</strong> Verify the server command exists, set required env vars (e.g. <code>GITHUB_TOKEN</code>), then restart your Claude session — MCP config is only read at startup.</p>
<p><strong>Success signal:</strong> Claude shows MCP tools in its capabilities on session start.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>MCP tools not appearing</h3>
<p><strong>Check:</strong> Press <code>Ctrl+O</code> to enable verbose mode and look for MCP handshake messages.</p>
<p><strong>Likely cause:</strong> The server started but the tool registration failed — usually a schema mismatch or server crash during init.</p>
<p><strong>Fix:</strong> Run the MCP server command manually in your terminal to see its error output. Fix any issues, then restart the Claude session.</p>
<p><strong>Success signal:</strong> Tools from that MCP server appear and are callable.</p>
</div>

---

## Hook Issues {#hook-issues}

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>Hooks not firing</h3>
<p><strong>Check:</strong> Enable verbose mode with <code>Ctrl+O</code> to see hook execution.</p>
<p><strong>Likely cause:</strong> Event name casing is wrong, the matcher doesn't match, or the script isn't executable.</p>
<p><strong>Fix:</strong></p>

```bash
# Validate your settings JSON
claude -p "validate the JSON in .claude/settings.json"

# Make sure the hook script is executable
chmod +x .claude/hooks/your-hook.sh
```

<div class="callout-important">
Event names are PascalCase: <code>PreToolUse</code>, not <code>preToolUse</code>. Exit codes matter: 0 = allow, 2 = block.
</div>

<p><strong>Success signal:</strong> Verbose mode shows the hook executing on the expected event.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>Hook blocking unexpectedly</h3>
<p><strong>Check:</strong> Which tool call is being blocked? Verbose mode (<code>Ctrl+O</code>) shows the hook name and exit code.</p>
<p><strong>Likely cause:</strong> The matcher is too broad or the hook script returns exit code 2 on a path you didn't intend to block.</p>
<p><strong>Fix:</strong> Narrow the matcher pattern in <code>.claude/settings.json</code> so it targets only the intended tool. Test by running the hook script manually with sample input.</p>
<p><strong>Success signal:</strong> The tool call proceeds without being blocked.</p>
</div>

---

## Infrastructure Issues {#infra-issues}

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>Can't SSH into droplet</h3>
<p><strong>Check:</strong> Run SSH with verbose output to see where it fails.</p>
<p><strong>Likely cause:</strong> Wrong IP, SSH key not added during droplet creation, or firewall blocking port 22.</p>
<p><strong>Fix:</strong></p>

```bash
ssh -v root@<droplet-ip>
```

Verify the IP in the DigitalOcean console. If the key is missing, add it via the DO dashboard and rebuild.

<p><strong>Success signal:</strong> You get a root shell on the droplet.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>k3s not starting</h3>
<p><strong>Check:</strong> Look at the service status and logs.</p>
<p><strong>Likely cause:</strong> Insufficient RAM (need at least 2 GB), port 6443 already in use, or firewall rules blocking required ports.</p>
<p><strong>Fix:</strong></p>

```bash
sudo systemctl status k3s
sudo journalctl -u k3s -f
```

<p><strong>Success signal:</strong> <code>systemctl status k3s</code> shows <code>active (running)</code>.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>kubectl connection refused</h3>
<p><strong>Check:</strong> Are you using the correct kubeconfig?</p>
<p><strong>Likely cause:</strong> k3s uses its own kubeconfig path, not the default <code>~/.kube/config</code>.</p>
<p><strong>Fix:</strong></p>

```bash
# On the droplet
sudo kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml get nodes
```

For local access, copy the kubeconfig and replace `127.0.0.1` with your droplet's public IP.

<p><strong>Success signal:</strong> <code>kubectl get nodes</code> returns your node in <code>Ready</code> state.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>Pods stuck in ImagePullBackOff</h3>
<p><strong>Check:</strong> Describe the pod to see the pull error.</p>
<p><strong>Likely cause:</strong> Image doesn't exist, tag is wrong, or Docker Hub rate-limiting is hitting you.</p>
<p><strong>Fix:</strong></p>

```bash
kubectl describe pod <pod-name> -n ai-coderrank
```

Verify the image name and tag. For rate-limit issues, switch to `ghcr.io`.

<p><strong>Success signal:</strong> Pod transitions to <code>Running</code>.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>Pods stuck in CrashLoopBackOff</h3>
<p><strong>Check:</strong> Read the logs from the previous crashed container.</p>
<p><strong>Likely cause:</strong> App crashes on startup — missing env var, missing ConfigMap/Secret, or port mismatch.</p>
<p><strong>Fix:</strong></p>

```bash
kubectl logs <pod-name> -n ai-coderrank --previous
```

<p><strong>Success signal:</strong> Pod stays in <code>Running</code> state after you fix the config.</p>
</div>

---

## Public Access Issues {#public-access-issues}

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>App not accessible on public IP (NodePort 30080)</h3>
<p><strong>Check:</strong> Confirm the service type and that the port is reachable.</p>
<p><strong>Likely cause:</strong> Service isn't NodePort, the port isn't 30080, or the DigitalOcean firewall blocks it.</p>
<p><strong>Fix:</strong></p>

```bash
# Verify the service is NodePort on 30080
kubectl get svc -n ai-coderrank

# Test locally on the droplet first
curl http://localhost:30080
```

If local curl works but external doesn't, open port 30080 in the DigitalOcean firewall: **DO Console > Networking > Firewalls**.

<div class="callout-important">
This course uses NodePort 30080 for public access, not Ingress. Make sure your Service spec sets <code>type: NodePort</code> and <code>nodePort: 30080</code>.
</div>

<p><strong>Success signal:</strong> <code>curl http://&lt;droplet-ip&gt;:30080</code> returns your app's response.</p>
</div>

---

## ArgoCD Issues {#argocd-issues}

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>ArgoCD UI not accessible</h3>
<p><strong>Check:</strong> Is the port-forward running?</p>
<p><strong>Likely cause:</strong> No port-forward active, or the ArgoCD server pod isn't running.</p>
<p><strong>Fix:</strong></p>

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Get the admin password:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

<p><strong>Success signal:</strong> Browser loads the ArgoCD dashboard at <code>https://localhost:8080</code>.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>ArgoCD not syncing</h3>
<p><strong>Check:</strong> Look at the application status.</p>
<p><strong>Likely cause:</strong> Repo URL typo, wrong branch name, or the path doesn't match your directory structure.</p>
<p><strong>Fix:</strong></p>

```bash
kubectl get app -n argocd
```

Force a sync if the app exists but is stuck:

```bash
kubectl patch app ai-coderrank -n argocd \
  --type merge -p '{"operation":{"sync":{}}}'
```

<p><strong>Success signal:</strong> App status shows <code>Synced</code> and <code>Healthy</code>.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>ArgoCD showing Degraded health</h3>
<p><strong>Check:</strong> Identify which resource is unhealthy.</p>
<p><strong>Likely cause:</strong> A pod managed by ArgoCD is failing — this is usually a CrashLoopBackOff underneath.</p>
<p><strong>Fix:</strong></p>

```bash
kubectl get app ai-coderrank -n argocd -o yaml | grep -A 20 health
kubectl logs -n ai-coderrank -l app=ai-coderrank --tail=50
```

Fix the underlying pod issue (see [Infrastructure Issues](#infra-issues)) and ArgoCD will detect the recovery automatically.

<p><strong>Success signal:</strong> App health returns to <code>Healthy</code>.</p>
</div>

---

## GitHub Actions Issues {#github-actions-issues}

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>Claude Action not triggering</h3>
<p><strong>Check:</strong> Is the workflow file present and the trigger correct?</p>
<p><strong>Likely cause:</strong> Workflow file not in <code>.github/workflows/</code>, trigger event doesn't match, <code>if</code> condition filters it out, or <code>ANTHROPIC_API_KEY</code> secret is missing.</p>
<p><strong>Fix:</strong> Verify all five of these:

1. Workflow file lives in `.github/workflows/`
2. Trigger event matches (`issue_comment`, `pull_request_review_comment`)
3. The `if` condition matches your comment pattern
4. `ANTHROPIC_API_KEY` is set in repo Settings > Secrets
5. GitHub App permissions are configured

<p><strong>Success signal:</strong> The Actions tab shows a new run after you post a matching comment.</p>
</div>

<div class="symptom-block">
<span class="symptom-label">Symptom</span>
<h3>Action runs but no output</h3>
<p><strong>Check:</strong> Open the run log in the GitHub Actions tab.</p>
<p><strong>Likely cause:</strong> API key is invalid/expired, you're rate-limited, <code>max_turns</code> is set too low, or CLAUDE.md has overly restrictive instructions.</p>
<p><strong>Fix:</strong> Check your Anthropic dashboard for rate limits and API key status. Increase <code>max_turns</code> if the action exits too early.</p>
<p><strong>Success signal:</strong> The action run log shows Claude's response and it posts output to the PR/issue.</p>
</div>

---

## What To Paste Into Claude

When you're stuck, give Claude structured context. Copy this template:

```
I'm working on the Claude Code 101 course. I hit this issue:

**Block**: [which block]
**Step**: [which step]
**Error**: [paste error]
**What I tried**: [what you already tried]

Help me diagnose and fix this.
```

The more specific you are about the block, step, and exact error text, the faster Claude can help.

If you're repeatedly blocked, <a href="{{ '/mentoring/' | relative_url }}">mentoring</a> may be faster than self-debugging.
