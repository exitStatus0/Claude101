---
layout: block-part
title: "Sub-agents — Specialized Workers"
block_number: 11
description: "Hands-on implementation steps for Block 11."
time: "~25 minutes"
part_name: "Hands-On"
overview_url: /course/block-11-subagents/
presentation_url: /course/block-11-subagents/presentation/
hands_on_url: /course/block-11-subagents/hands-on/
permalink: /course/block-11-subagents/hands-on/
locale: en
translation_key: block-11-hands-on
---
> **Direct speech:** "Everything on this hands-on page is built so you can follow me line by line. When you see a command or prompt block, you can copy it directly into your terminal or Claude session unless I explicitly tell you it is just reference material. As we go, compare your result with mine on screen so you can catch mistakes early instead of stacking them up."

> **Duration**: ~25 minutes
> **Outcome**: Two custom sub-agents (security reviewer and K8s validator), tested on real code, with model selection and worktree isolation explored, plus discovery of the built-in agents you have been using all along.
> **Prerequisites**: Completed Blocks 0-10 (GitHub Actions CI configured), the ai-coderrank project with K8s manifests and source code, kubectl configured

---

### Step 1: Watch the Explore Agent in Action (~3 min)

Before building custom agents, let us see the built-in ones at work. Start Claude Code in the ai-coderrank project:

```bash
cd ~/ai-coderrank
claude
```

Now ask a broad, research-style question:

```text
How does the API layer in this project work? Trace a request from the route handler to the database and back. Show me the data flow.
```

Watch what happens. Claude will delegate to its built-in Explore agent to research the codebase. You may see it reading multiple files, searching for patterns, and tracing imports -- all in a focused research pass. The Explore agent gathers information and reports back, then Claude synthesizes it into a coherent answer for you.

The key observation: the research happened in a _separate_ context. The Explore agent got a fresh window focused entirely on answering your question, without the baggage of your previous conversation history.

> **Tip**: You can explicitly request delegation by saying "use the Explore agent to research how authentication works in this project." But Claude often delegates on its own when it recognizes a research task.

---

### Step 2: Create the Security Reviewer Agent (~5 min)

Now let us build our first custom agent. This one reviews code for OWASP Top 10 vulnerabilities and common security issues. Critically, it is read-only -- a security reviewer should observe and report, not modify code.

Create the agent file:

```bash
mkdir -p ~/ai-coderrank/.claude/agents
```

Create `.claude/agents/security-reviewer.md` with the following content:

```markdown
---
name: security-reviewer
description: Reviews code for OWASP Top 10 vulnerabilities, secret leaks, and injection risks
model: sonnet
allowed-tools:
  - Read
  - Grep
  - Glob
---

You are a senior application security engineer performing a focused security review.

## Your Mission

Systematically audit the target code for security vulnerabilities. You are thorough, specific, and practical -- you flag real risks, not theoretical possibilities with no exploitation path.

## What to Check

### 1. Injection Vulnerabilities
- SQL injection: raw queries, string concatenation in queries, unsanitized user input
- NoSQL injection: dynamic query construction with user input
- Command injection: user input passed to exec, spawn, or system calls
- LDAP injection: user input in LDAP filters

### 2. Broken Authentication
- Hardcoded credentials, API keys, or tokens in source code
- Weak password validation rules
- Missing rate limiting on auth endpoints
- Session tokens in URLs or logs

### 3. Sensitive Data Exposure
- Secrets in code (.env values, API keys, connection strings)
- PII logged to console or files
- Sensitive data in error messages returned to users
- Missing encryption for sensitive fields

### 4. Broken Access Control
- Missing authorization checks on API routes
- Direct object reference without ownership validation
- Admin endpoints accessible without role checks
- CORS misconfiguration allowing unauthorized origins

### 5. Security Misconfiguration
- Debug mode enabled in production configs
- Default credentials or settings
- Unnecessary ports or services exposed
- Missing security headers (CSP, HSTS, X-Frame-Options)

### 6. Cross-Site Scripting (XSS)
- User input rendered without sanitization
- dangerouslySetInnerHTML usage
- Unescaped template variables
- DOM manipulation with user-controlled data

### 7. Dependencies and Supply Chain
- Check package.json for known vulnerable patterns
- Look for wildcard version ranges (*)
- Check for deprecated or unmaintained packages

## Output Format

### Security Review Report

**Scope**: [files/directories reviewed]
**Risk Level**: Critical / High / Medium / Low

#### Critical Findings
| # | Vulnerability | File:Line | Description | OWASP Category | Remediation |
|---|--------------|-----------|-------------|---------------|-------------|

#### High-Risk Findings
(same table format)

#### Medium-Risk Findings
(same table format)

#### Low-Risk / Informational
(same table format)

#### Summary
- Total files scanned: N
- Critical: N | High: N | Medium: N | Low: N
- Top 3 priorities for remediation
```

> **Notice three things about this agent**: (1) It uses `model: sonnet` -- good enough for security analysis without the cost of Opus. (2) It is restricted to `Read`, `Grep`, and `Glob` -- it cannot modify files, run commands, or access the network. (3) The system prompt is long and specific -- this is where expertise lives.

---

### Step 3: Create the K8s Validator Agent (~5 min)

This agent validates Kubernetes manifests against best practices. Unlike the security reviewer, this one _can_ run bash commands -- specifically `kubectl` for dry-run validation.

Create `.claude/agents/k8s-validator.md`:

```markdown
---
name: k8s-validator
description: Validates Kubernetes manifests against best practices using kubectl dry-run and static analysis
model: sonnet
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

You are a senior SRE validating Kubernetes manifests before they are applied to a production cluster.

## Your Mission

Perform both static analysis (reading the YAML) and dynamic validation (kubectl dry-run) on all Kubernetes manifests in the project.

## Step 1: Static Analysis

Use Glob to find all YAML files in the `k8s/` directory. Read each file and check:

### Resource Definitions
- CPU and memory requests AND limits are set on all containers
- Requests <= limits (requests should not exceed limits)
- Values are reasonable for the workload type (a web server does not need 4Gi memory)

### Security Context
- `runAsNonRoot: true` is set
- `readOnlyRootFilesystem: true` where possible
- `allowPrivilegeEscalation: false` is set
- Capabilities are dropped (`drop: ["ALL"]`), only necessary ones added back

### High Availability
- Deployment replicas > 1 for production services
- Pod Disruption Budget exists for critical services
- Anti-affinity rules prevent all replicas on the same node

### Health Checks
- Liveness probe is configured (with appropriate failure threshold)
- Readiness probe is configured (separate from liveness)
- Startup probe for containers with slow initialization

### Image Policy
- No `latest` tag -- images must be pinned to a specific version or SHA
- `imagePullPolicy` is set appropriately
- Images come from an expected registry

### Labels and Metadata
- Standard labels present: `app.kubernetes.io/name`, `app.kubernetes.io/version`, `app.kubernetes.io/component`
- Labels are consistent across related resources (Deployment, Service, HPA)
- Namespace is explicitly set

## Step 2: Dynamic Validation

Run kubectl dry-run against each manifest to catch schema and structural errors:

```
kubectl apply --dry-run=client -f <manifest-file> 2>&1
```text

If kubeconfig is available and the cluster is reachable, also run server-side dry-run:

```
kubectl apply --dry-run=server -f <manifest-file> 2>&1
```text

Report any errors or warnings from kubectl.

## Step 3: Cross-Resource Validation

- Service selectors match Deployment labels
- Ingress/Route backends reference existing Services
- ConfigMap and Secret references in Deployments actually exist
- PVC names in volume mounts match existing PVC definitions
- HPA targets reference existing Deployments

## Output Format

### Kubernetes Validation Report

**Manifests Found**: N files in k8s/
**kubectl Dry-Run**: PASS / FAIL (with errors)

#### Per-Manifest Results

##### `<filename>`
| Check | Status | Details |
|-------|--------|---------|
| Resource Limits | PASS/WARN/FAIL | ... |
| Security Context | PASS/WARN/FAIL | ... |
| Health Checks | PASS/WARN/FAIL | ... |
| Image Policy | PASS/WARN/FAIL | ... |
| Labels | PASS/WARN/FAIL | ... |
| kubectl dry-run | PASS/FAIL | ... |

#### Cross-Resource Issues
| Issue | Resources Involved | Impact |
|-------|-------------------|--------|
| ... | ... | ... |

#### Summary
- Total manifests: N
- Passed all checks: N
- Has warnings: N
- Has failures: N
- **Recommended fix order** (most impactful first):
  1. ...
  2. ...
  3. ...
```

> **Key difference from the security reviewer**: This agent has `Bash` in its `allowed-tools`. It needs to run `kubectl` commands for dynamic validation. The security reviewer intentionally does not have bash access -- it should never execute anything, only read and report.

---

### Step 4: Test the Security Reviewer (~3 min)

Time to put your security reviewer to work. In your Claude Code session:

```text
Run the security reviewer agent on the src/ directory. Focus on the API routes and any authentication-related code.
```

Watch Claude delegate to the security-reviewer agent. The agent will:
1. Glob for files in `src/`
2. Read API route handlers
3. Search for common vulnerability patterns (raw SQL, unsanitized input, hardcoded secrets)
4. Produce a structured report with findings categorized by OWASP category

Read the report carefully. Common findings in a typical Next.js project:
- Missing input validation on API routes
- CORS not explicitly configured
- Error messages leaking implementation details
- No rate limiting on public endpoints

> **Insight**: This agent found issues by _reasoning about security patterns_, not by running a linter. It understands intent, not just syntax. It can tell you "this API route accepts user input and passes it to a database query without validation" -- something no static analysis tool would phrase that clearly.

---

### Step 5: Test the K8s Validator (~3 min)

Now test the K8s validator:

```text
Run the k8s-validator agent to validate all Kubernetes manifests in k8s/
```

This agent does two things the security reviewer cannot:
1. **Reads the manifests** (static analysis -- same as the security reviewer)
2. **Runs `kubectl apply --dry-run`** (dynamic validation -- only possible because it has Bash access)

The dynamic validation catches errors that reading YAML alone cannot -- invalid API versions, malformed selectors, schema violations, resource types that do not exist in your cluster version.

Compare the output to what you got from `/review-k8s` in Block 6. The skill gave you a static review. The agent gives you static review _plus_ dynamic validation. Same task, deeper analysis.

---

### Step 6: Create a Fast Agent with Haiku (~3 min)

Not every agent needs heavy reasoning. Let us create a fast, cheap agent for quick codebase searches.

Create `.claude/agents/quick-search.md`:

```markdown
---
name: quick-search
description: Fast codebase search using Haiku for speed and low cost
model: haiku
allowed-tools:
  - Read
  - Grep
  - Glob
---

You are a fast codebase search assistant. Your job is to find things quickly and report back concisely.

When asked to find something:
1. Use Grep to search for the pattern across the codebase
2. Use Glob if you need to find files by name
3. Use Read only if you need to check specific context around a match
4. Report your findings in a brief, structured format

Keep your responses short. List the file paths and line numbers where you found matches. Include a one-line summary of each match for context. Do not explain the code -- just locate it.

## Output Format

**Query**: [what was searched for]
**Matches**: N results

| File | Line | Context |
|------|------|---------|
| path/to/file.ts | 42 | `const score = calculateScore(...)` |
| ... | ... | ... |
```

Test it:

```text
Use the quick-search agent to find all places where environment variables are read in the codebase.
```

Notice how much faster this responds compared to a full Sonnet or Opus query. Haiku is ideal for tasks where you need speed and the reasoning is straightforward -- finding, listing, simple pattern matching.

> **Cost comparison**: A Haiku agent call for a simple search costs a fraction of a cent. The same task on Opus might cost 10-20x more. For repetitive, simple tasks, the savings add up fast.

---

### Step 7: Demo Worktree Isolation (~5 min)

Worktree isolation is one of the most powerful sub-agent features. It lets an agent work on a separate git branch without affecting your working directory.

Try this in your Claude Code session:

```text
Create a new sub-agent with worktree isolation. Have it experiment with refactoring the score formatting utilities in src/utils/format-score.ts into a class-based approach. I want to compare the result with the current functional approach without changing my working directory.
```

Claude will:
1. Create a git worktree (a separate checkout of your repo on a new branch)
2. Delegate to a sub-agent running in that worktree
3. The agent makes changes in the isolated worktree
4. When it finishes, it reports back with the branch name and a summary
5. Your working directory is untouched

You can then compare the two approaches:

```bash
# See what the agent changed
git diff main...<branch-name-from-agent>

# If you like it, merge it
git merge <branch-name-from-agent>

# If you don't, just delete the branch
git branch -D <branch-name-from-agent>
```

This is incredibly useful for:
- "Try it both ways and let me compare"
- "Refactor this module without breaking what I'm working on"
- "Explore a risky change without committing to it"

> **How worktree isolation works under the hood**: Git worktrees are a native git feature (`git worktree add`). They create a second checkout of the same repo in a different directory, sharing the same `.git` history. The sub-agent works in that second directory, so changes happen on a different branch in a different folder. Your working directory never sees the changes unless you explicitly merge.

---

### Step 8: List Your Agents with `/agents` (~1 min)

Now that you have built several agents, let us see the full roster. In Claude Code:

```text
/agents
```

This lists all configured agents -- both built-in and custom. You should see:

```text
Built-in Agents:
  - Explore    Read-only codebase research
  - Plan       Architecture design and planning

Custom Agents (.claude/agents/):
  - security-reviewer   Reviews code for OWASP top 10 vulnerabilities
  - k8s-validator       Validates K8s manifests with kubectl dry-run
  - quick-search        Fast Haiku-powered codebase search
```

Each entry shows the agent name, its description, and its model/tool configuration. This is your team roster -- the specialists that Claude can delegate to at any time.

---

### Checkpoint

Your `.claude/agents/` directory should now contain:

```text
.claude/
  agents/
    security-reviewer.md    <- OWASP security review (Sonnet, read-only)
    k8s-validator.md        <- K8s manifest validation (Sonnet, with Bash)
    quick-search.md         <- Fast codebase search (Haiku, read-only)
```

You have also experienced:
- The built-in Explore agent researching your codebase
- Sub-agent delegation happening automatically
- Model selection matching brain-power to task complexity
- Worktree isolation for safe experimentation

Your Claude Code setup now has skills (Block 6) for standardized workflows and agents (this block) for specialized delegation. Together, they cover both "do this task" and "delegate this task to a specialist."

---

### Bonus Challenges

**Challenge 1: Create a test-writer agent**
Build an agent in `.claude/agents/test-writer.md` that generates tests for any given file. Give it access to `Read`, `Grep`, `Glob`, `Edit`, and `Write` (it needs to create test files). Have it follow the testing conventions from your CLAUDE.md and the patterns in your existing tests.

**Challenge 2: Agent pipeline**
Chain two agents: first run the security-reviewer on `src/`, then pass its findings to Claude and ask it to fix the critical issues. Compare this to doing both tasks in a single Claude session -- does the separation lead to a better result?

**Challenge 3: Create a documentation agent**
Build a read-only agent (`model: haiku`) that generates JSDoc comments for functions that lack them. Test it on a file with undocumented functions. This is a great example of a Haiku-appropriate task -- simple, repetitive, and pattern-based.

**Challenge 4: Explore model differences**
Run the same security review with `model: haiku` and `model: sonnet`. If your plan includes Opus, repeat it with `model: opus` as an optional comparison. This gives you a practical feel for when each model is worth the cost without making Opus a course requirement.

---

> **Next up**: In Block 12, we bring everything together with GitOps -- ArgoCD, automated deployments, and the full loop from code change to production. Your CI reviews PRs with Claude, your agents validate the manifests, and ArgoCD syncs the result to your cluster.
