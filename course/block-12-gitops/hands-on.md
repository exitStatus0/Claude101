---
layout: block-part
title: "GitOps Finale — ArgoCD & Live Deployment"
block_number: 12
description: "Hands-on implementation steps for Block 12."
time: "~30 minutes"
part_name: "Hands-On"
overview_url: /course/block-12-gitops/
presentation_url: /course/block-12-gitops/presentation/
hands_on_url: /course/block-12-gitops/hands-on/
permalink: /course/block-12-gitops/hands-on/
---
> **Attention point:** Every command or prompt block on this page is meant to be copied directly into your terminal or Claude session unless the text says otherwise.

> **Duration**: ~30 minutes
> **Outcome**: ArgoCD installed, connected to your repo, app exposed publicly, dark theme deployed via GitOps, and monitoring set up with `/loop` and `/schedule`. The grand finale.
> **Prerequisites**: Completed Blocks 0-11 (k3s cluster running, app deployed, CI/CD configured), kubectl access from your laptop, the ai-coderrank repo pushed to GitHub

---

### Step 1: Install ArgoCD on Your k3s Cluster (~5 min)

This is the last time you'll manually `kubectl apply` something for deployments. After this, ArgoCD takes over.

Start Claude Code in the ai-coderrank project:

```bash
cd ~/ai-coderrank
claude
```

Ask Claude to help install ArgoCD:

```text
Help me install ArgoCD on my k3s cluster. Create the argocd namespace and apply
the stable manifests.
```

Claude will generate and run the commands:

```bash
# Create the ArgoCD namespace
kubectl create namespace argocd

# Install ArgoCD using the stable manifests
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Wait for the pods to come up. Ask Claude to check:

```text
Check if all ArgoCD pods are running in the argocd namespace. Wait until they're
all Ready.
```

Claude will run:

```bash
kubectl get pods -n argocd -w
```

You should see pods like:
- `argocd-server-xxx` — the API server and web UI
- `argocd-repo-server-xxx` — clones and reads your Git repos
- `argocd-application-controller-xxx` — the brains, watches for drift
- `argocd-redis-xxx` — caching layer
- `argocd-applicationset-controller-xxx` — manages ApplicationSets
- `argocd-notifications-controller-xxx` — sends notifications on sync events
- `argocd-dex-server-xxx` — handles SSO authentication

All pods should show `Running` with `1/1` Ready. This usually takes 1-2 minutes on a k3s cluster.

> **What just happened**: You installed a full GitOps delivery platform. ArgoCD is now running inside your Kubernetes cluster, ready to watch your Git repo and sync changes. In production environments, this is the same ArgoCD installation that manages thousands of services. Same tool, same config, same workflow.

---

### Step 2: Access the ArgoCD UI (~3 min)

Get the initial admin password:

```text
Get the ArgoCD admin password from the cluster secret.
```

Claude will run:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

Copy the password. You'll need it in a moment.

Now port-forward the ArgoCD server to your local machine:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Open your browser and go to `https://localhost:8080`. You'll get a certificate warning — that's expected for a self-signed cert. Accept it and proceed.

- **Username**: `admin`
- **Password**: the string you copied above

You should see the ArgoCD dashboard. It's empty right now — no applications. That's about to change.

> **Tip**: Leave this port-forward running in a separate terminal tab. You'll want the ArgoCD UI visible while you work through the next steps.

---

### Step 3: Create the ArgoCD Application Config (~3 min)

Now we tell ArgoCD what to watch. Ask Claude:

```text
Create argocd/application.yaml that points ArgoCD at my ai-coderrank GitHub repo.
It should watch the k8s/ directory on the main branch and auto-sync changes to the
default namespace. Enable auto-prune and self-heal.

My GitHub repo is at: https://github.com/YOUR_USERNAME/ai-coderrank.git
```

Claude will create `argocd/application.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ai-coderrank
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/YOUR_USERNAME/ai-coderrank.git
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

Let's unpack what each section does:

| Field | What it means |
|-------|--------------|
| `source.repoURL` | The Git repo ArgoCD will watch |
| `source.targetRevision` | Which branch to track (`main`) |
| `source.path` | Which directory contains the K8s manifests (`k8s/`) |
| `destination.server` | The K8s cluster to deploy to (the local cluster) |
| `destination.namespace` | Which namespace to deploy into |
| `syncPolicy.automated` | Auto-sync when Git changes (no manual approval needed) |
| `syncPolicy.automated.prune` | Delete resources from the cluster if they're removed from Git |
| `syncPolicy.automated.selfHeal` | Revert manual cluster changes back to what Git declares |

Apply it:

```text
Apply the ArgoCD application to the cluster.
```

```bash
kubectl apply -f argocd/application.yaml
```

> **This is the pivotal moment.** ArgoCD is now watching your repo. Any changes to the `k8s/` directory on the `main` branch will be automatically applied to your cluster. You've just set up continuous delivery.

---

### Step 4: Watch the First Sync (~2 min)

Switch to the ArgoCD UI in your browser (`https://localhost:8080`). You should see the `ai-coderrank` application appear. Click on it.

ArgoCD will:
1. Clone your repo
2. Read the manifests in `k8s/`
3. Compare them to what's currently in the cluster
4. Show you the diff
5. Apply any differences

If you already deployed the app in Block 7, ArgoCD should show the application as **Synced** and **Healthy** — the manifests in Git match what's running in the cluster.

If there are differences, you'll see ArgoCD sync them automatically. Watch the resource tree in the UI — you can see each Deployment, Service, and Pod as nodes in a visual graph.

Ask Claude to verify from the CLI too:

```text
Check the ArgoCD application sync status for ai-coderrank.
```

```bash
kubectl get application ai-coderrank -n argocd -o jsonpath='{.status.sync.status}'
# Should output: Synced

kubectl get application ai-coderrank -n argocd -o jsonpath='{.status.health.status}'
# Should output: Healthy
```

**Synced + Healthy** = Git matches the cluster, and all resources are running correctly. This is the state you want.

---

### Step 5: Expose the App Publicly (~5 min)

Right now, the app is running in the cluster but not accessible from the internet. Let's fix that.

Ask Claude:

```text
Help me expose the ai-coderrank app on my droplet's public IP address. My droplet's
IP is YOUR_DROPLET_IP. Set up a NodePort service so I can access
the app from a browser at http://YOUR_DROPLET_IP.
```

**Option A: NodePort (recommended for this course)**

This is the simplest path. No extra config, no Ingress controller fiddling. Your app gets a port on the droplet's public IP and you can reach it directly from any browser.

Claude will help you update the Service in `k8s/` to use NodePort:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ai-coderrank
  namespace: default
spec:
  type: NodePort
  selector:
    app: ai-coderrank
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30080    # Accessible at http://DROPLET_IP:30080
```

> **Public IP access**: Your DigitalOcean droplet already has a public IP address. No load balancer is needed. NodePort exposes the app directly on the droplet's IP at port 30080. Just make sure the firewall allows it.

**Option B: Ingress with Traefik (sidebar — more advanced)**

k3s ships with Traefik as its built-in Ingress controller. If you want port 80 access (no port number in the URL), you can create an Ingress resource. This is optional and more complex:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ai-coderrank
  namespace: default
spec:
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ai-coderrank
                port:
                  number: 3000
```

With Traefik Ingress, the app will be accessible at `http://YOUR_DROPLET_IP` on port 80 -- no port number needed. This is a nice-to-have but not required for the course exercises.

**Important**: Whichever option you chose, commit the Service/Ingress changes to `k8s/` and push to Git. Don't `kubectl apply` manually -- let ArgoCD handle it. This is GitOps:

```text
Commit the updated service manifest and push it to the main branch. Let ArgoCD
sync it.
```

```bash
git add k8s/
git commit -m "feat: expose ai-coderrank via NodePort for public access"
git push origin main
```

Make sure the droplet's firewall allows traffic on port 30080. Ask Claude:

```text
Help me check and update the DigitalOcean firewall rules for my droplet to allow
inbound traffic on port 80 and 30080.
```

Watch the ArgoCD UI — within a few minutes, it will detect the push and sync the new Service configuration to the cluster.

---

### Step 6: Push the Dark Theme — The Big Moment (~3 min)

> **Container registry**: This course standardizes on **GitHub Container Registry (GHCR)**. Your CI pipeline (Block 10) should push images to `ghcr.io/YOUR_USERNAME/ai-coderrank`, and your K8s deployment should reference that same image. If you skipped Block 10, you can push images manually with `docker push ghcr.io/YOUR_USERNAME/ai-coderrank:latest`.

This is it. The moment the whole course has been building toward.

If your dark theme changes from Block 4 aren't pushed yet, now is the time. Ask Claude:

```text
Make sure all the dark theme changes are committed and push everything to the main
branch.
```

```bash
git add .
git commit -m "feat: dark theme implementation from Block 4"
git push origin main
```

Now watch. Open the ArgoCD UI side by side with your terminal.

1. ArgoCD detects the new commit (within 3 minutes by default, or instantly with a webhook)
2. It clones the updated repo
3. It diffs the new manifests against the cluster state
4. If the Docker image reference changed, it rolls out the new version
5. The status goes from **OutOfSync** to **Syncing** to **Synced**

> **Note**: If your K8s manifests reference a container image that gets built by CI (from Block 10), the full loop is: push code -> GitHub Actions builds image -> push image to registry -> update the image tag in `k8s/deployment.yaml` -> ArgoCD syncs the new image. If you're using a fixed image tag, you may need to update it. Ask Claude to help set up the image update flow.

---

### Step 7: Access the App From Your Browser (~1 min)

Open a browser. Navigate to:

```text
http://YOUR_DROPLET_IP:30080
```

You should see ai-coderrank. With the dark theme. Running on Kubernetes. Deployed via GitOps. Accessible from the internet.

Take a breath. You built this.

If it's not loading, ask Claude to troubleshoot:

```text
The app isn't loading at http://YOUR_DROPLET_IP:30080. Help me debug — check the
pods, service, NodePort, and firewall rules.
```

Claude will systematically check each layer: are pods running? Is the service routing correctly? Is the NodePort exposed? Are firewall rules open? This methodical debugging is exactly the kind of thing Claude excels at.

---

### Step 8: Monitor with /loop (~3 min)

Now let's use Claude Code as an operations tool. The `/loop` command runs a prompt repeatedly on an interval — perfect for monitoring.

In your Claude Code session:

```text
/loop 30s check if ArgoCD sync is complete for ai-coderrank and report the sync
status and health
```

Claude will check every 30 seconds and report:

```text
[12:01:30] Sync: Synced | Health: Healthy | Resources: 4/4 running
[12:02:00] Sync: Synced | Health: Healthy | Resources: 4/4 running
[12:02:30] Sync: Synced | Health: Healthy | Resources: 4/4 running
```

Now, in a separate terminal, make a small change and push it:

```bash
# Change the replica count or add a label — something small
git add k8s/
git commit -m "test: verify ArgoCD auto-sync with minor manifest change"
git push origin main
```

Watch the `/loop` output. Within a few minutes you should see:

```text
[12:05:00] Sync: OutOfSync | Health: Healthy | Resources: 4/4 running
[12:05:30] Sync: Syncing  | Health: Progressing | Resources: updating...
[12:06:00] Sync: Synced   | Health: Healthy | Resources: 4/4 running
```

You just watched GitOps happen in real time. Push to Git, ArgoCD syncs, cluster updates. No manual intervention. The `/loop` command gave you a live dashboard in your terminal.

Press `Ctrl+C` (or type `stop`) to end the loop.

> **Pro tip**: `/loop` accepts any time interval -- `10s`, `1m`, `5m`. Use shorter intervals for active monitoring during deployments, longer intervals for background checks.

---

### Step 8b: Observability and Debugging (~5 min)

Now that you have a live deployment, let's build a basic observability practice. These commands will save you when something goes wrong in production.

#### Pod logs

The first thing to check when something breaks:

```bash
# Logs for the ai-coderrank deployment
kubectl logs deployment/ai-coderrank -n default

# Follow logs in real time (like tail -f)
kubectl logs deployment/ai-coderrank -n default -f

# Logs from a crashed or restarting pod (previous container)
kubectl logs deployment/ai-coderrank -n default --previous
```

Ask Claude to help interpret the logs:

```text
Read the last 50 lines of logs from the ai-coderrank deployment and flag anything
that looks like an error, warning, or unexpected behavior.
```

#### Resource usage

Install the metrics-server so `kubectl top` works on k3s:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

> **Note**: On k3s, you may need to add `--kubelet-insecure-tls` to the metrics-server deployment args. Ask Claude to patch it if `kubectl top` returns errors.

Once metrics-server is running (give it a minute):

```bash
# CPU and memory usage per pod
kubectl top pods -n default

# CPU and memory usage per node
kubectl top nodes
```

This tells you whether your s-2vcpu-4gb droplet has headroom or is running hot.

#### Readiness and liveness probes

Check that your K8s manifests include health probes. Ask Claude:

```text
Check all deployments in k8s/ for readiness and liveness probes. If any are
missing, add them. Use HTTP GET /health for the web service (or TCP on port 3000
if no health endpoint exists).
```

Probes tell Kubernetes when your app is ready to accept traffic (readiness) and when it's stuck and needs a restart (liveness). Without them, K8s has no way to detect a hung process.

#### ArgoCD health status

ArgoCD provides its own health model on top of Kubernetes:

```bash
# Quick status check
kubectl get application ai-coderrank -n argocd

# Detailed health for each resource
kubectl get application ai-coderrank -n argocd -o jsonpath='{.status.resources[*].health.status}' | tr ' ' '\n'
```

The ArgoCD UI also shows health per resource in the visual tree. Green = healthy, yellow = progressing, red = degraded.

#### Continuous monitoring with /loop

Combine these into a monitoring loop:

```text
/loop 1m check ArgoCD sync status, pod health, and resource usage for ai-coderrank.
Report any issues.
```

This gives you a terminal-based ops dashboard that updates every minute. Use it during deployments, after configuration changes, or any time you're suspicious.

---

### Step 9: Set Up a Scheduled Health Check with /schedule (~3 min)

`/loop` is great for active monitoring, but what about when you're asleep? That's where `/schedule` comes in — it creates cloud-based tasks that run on a cron schedule.

```text
/schedule create "ai-coderrank daily health check" --cron "0 9 * * *" \
  --prompt "Check the status of all pods in the default namespace. Verify the \
  ai-coderrank service is responding. Check ArgoCD sync status. If anything is \
  unhealthy, provide a summary of issues and suggested fixes."
```

This creates a scheduled agent that runs every day at 9:00 AM. It will:
1. Check pod status
2. Verify the service is responding
3. Check ArgoCD sync status
4. Report any issues

You can list your scheduled tasks:

```text
/schedule list
```

And check the output of the last run:

```text
/schedule show "ai-coderrank daily health check"
```

> **Use cases beyond health checks**: Nightly security scans (`/schedule` a prompt that checks for CVEs in your dependencies). Weekly cost reports. Daily log analysis. Any recurring operational task that you'd normally automate with a cron job + script can be a scheduled Claude agent instead.

---

### Step 10: Remote Control — Monitor From Your Phone (~2 min)

One last feature for the finale. Claude Code supports remote sessions — you can start a session on one machine and connect to it from another.

Start a long-running monitoring session:

```bash
claude --remote
```

This gives you a URL. Open that URL on your phone's browser. You now have access to the same Claude Code session from your phone.

Try it:
1. From your phone, ask Claude to check the pod status
2. From your phone, ask Claude to check the ArgoCD sync status
3. From your phone, trigger a `/loop 1m` to watch the cluster

This is genuinely useful in practice. You push a deployment from your laptop, close the lid, and monitor the rollout from your phone while you grab coffee. If something goes wrong, you can investigate and even run commands — all from a mobile browser.

> **When this matters**: Friday afternoon deployment. You push the change, start a `/loop` to monitor, then walk to the train. From your phone, you watch the rollout complete. No laptop required. That's operational peace of mind.

---

### Checkpoint: The Grand Milestone

Let's take stock of what you just accomplished:

**Infrastructure**:
- ArgoCD running on k3s
- `argocd/application.yaml` connecting your repo to the cluster
- Auto-sync with self-healing and pruning enabled
- NodePort exposing the app publicly on port 30080

**Workflow**:
- Push to Git -> ArgoCD syncs -> App updates automatically
- No manual `kubectl apply` needed
- Full audit trail in Git history

**Monitoring**:
- `/loop` for real-time sync monitoring
- `/schedule` for daily health checks
- Remote control for monitoring from any device

**The app**:
- ai-coderrank with dark theme
- Live on the internet at your droplet's public IP
- Deployed and managed entirely through GitOps

You started this course with `claude` and a blank terminal. You now have a complete, modern, production-grade development and deployment pipeline. Code -> CI -> GitOps -> Live.

Send the URL to a friend. Seriously. Show them. You built this.

---

### Troubleshooting

**ArgoCD shows "Unknown" sync status**
The repo might be private. You'll need to add credentials:
```bash
kubectl -n argocd create secret generic repo-ai-coderrank \
  --from-literal=url=https://github.com/YOUR_USER/ai-coderrank.git \
  --from-literal=username=YOUR_USER \
  --from-literal=password=YOUR_GITHUB_TOKEN
kubectl -n argocd label secret repo-ai-coderrank argocd.argoproj.io/secret-type=repository
```
Ask Claude to help generate a GitHub personal access token with `repo` scope.

**ArgoCD shows "Degraded" health**
Usually means pods are crashlooping. Check:
```bash
kubectl get pods -n default
kubectl logs deployment/ai-coderrank -n default
```
Ask Claude to diagnose the logs. Common issues: missing environment variables, wrong image tag, port mismatch.

**Can't access the app on the public IP**
Check the chain: Pod running? -> Service routing? -> NodePort open? -> Firewall open?
```bash
kubectl get pods -n default
kubectl get svc -n default          # Verify NodePort 30080 is listed
curl http://localhost:30080          # Test from the droplet itself
# Check firewall on DO console or via doctl — port 30080 must be allowed
```

**ArgoCD sync is slow**
By default, ArgoCD polls every 3 minutes. You can force a sync:
```bash
kubectl -n argocd patch application ai-coderrank \
  --type merge -p '{"metadata":{"annotations":{"argocd.argoproj.io/refresh":"hard"}}}'
```
Or configure a GitHub webhook for instant sync.

---

### Bonus Challenges

**Challenge 1: Webhook-triggered sync**
Configure a GitHub webhook so ArgoCD syncs instantly on push instead of polling every 3 minutes. Ask Claude to help set up the webhook URL and secret.

**Challenge 2: Rollback via Git**
Make a breaking change (wrong image tag), push it, watch ArgoCD deploy the broken version. Then `git revert` the commit, push again, and watch ArgoCD roll back. The entire rollback was a Git operation. No `kubectl rollout undo` needed.

**Challenge 3: Add ArgoCD notifications**
Set up ArgoCD notifications to send a Slack message or email when a sync completes or fails. Ask Claude to help configure the `argocd-notifications-cm` ConfigMap.

**Challenge 4: Multi-environment**
Create a `k8s/staging/` and `k8s/production/` directory structure. Create two ArgoCD Applications — one watching each directory. Ask Claude to help restructure the manifests.

---

> **What a ride.** You've gone from `claude` to GitOps. From reading code to deploying it live on the internet. From one tool to an entire ecosystem. The next and final block covers advanced patterns and what's next — but if you stopped right here, you'd already have a complete, production-ready workflow. Well done.
