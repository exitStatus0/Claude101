---
layout: block-part
title: "GitOps Finale — ArgoCD & Live Deployment"
block_number: 12
description: "Presentation notes and speaking flow for Block 12."
part_name: "Presentation"
overview_url: /course/block-12-gitops/
presentation_url: /course/block-12-gitops/presentation/
hands_on_url: /course/block-12-gitops/hands-on/
permalink: /course/block-12-gitops/presentation/
---
> **Duration**: ~10 minutes
> **Goal**: Students understand GitOps as a philosophy, how ArgoCD implements it, and why this changes everything about how they think about deployments. Build the excitement -- this is the climax.

---

### Slide 1: The Problem With "kubectl apply"

Let's start with a horror story.

It's 2 AM. A production deployment failed. The team is scrambling. Someone asks: "What's actually running in the cluster right now?" Nobody knows. Three different engineers ran `kubectl apply` at different times today. One of them used a manifest from a branch that was never merged. Another patched something directly with `kubectl edit`. The cluster state doesn't match anything in Git.

This is called **configuration drift**, and it is the single most common source of deployment nightmares.

Now imagine the opposite. Every change to the cluster goes through Git. Every. Single. One. No exceptions. If it's not in Git, it doesn't get applied. If you want to know what's running in production, you look at the `main` branch. That's it. Git is the truth.

That's GitOps.

> **Fun fact**: The term "GitOps" was coined by Alexis Richardson at Weaveworks in 2017. It started as a blog post. Today, CNCF has an entire working group dedicated to it, and even the most security-conscious financial institutions — banks that wouldn't let you `ssh` into a server without three approvals — use GitOps for production deployments.

---

### Slide 2: GitOps in One Diagram

Here is the loop. Memorize it, because once you understand this loop, you understand GitOps:

```
Developer pushes code to Git
         |
         v
ArgoCD watches the Git repo (polling or webhook)
         |
         v
ArgoCD compares Git state vs. Cluster state
         |
         v
 Are they different?
    /          \
  No            Yes
   |             |
   v             v
 Do nothing    Sync: apply the diff to the cluster
                 |
                 v
          Cluster now matches Git
                 |
                 v
            Back to watching
```

That's it. The entire model. Git is the desired state. Kubernetes is the actual state. ArgoCD's only job is to make them match.

No `kubectl apply`. No deployment scripts. No Jenkins pipelines that `ssh` into a server and run commands. You push to Git, and the cluster converges to match. If someone manually changes something in the cluster, ArgoCD detects the drift and reverts it back to what Git says.

Git wins. Always.

---

### Slide 3: Why ArgoCD

There are several GitOps tools: ArgoCD, Flux, Jenkins X, Rancher Fleet. We're using ArgoCD because:

1. **Visual dashboard** — a web UI that shows you exactly what's synced, what's out of sync, and what's broken. You'll see it today.
2. **Battle-tested** — graduated CNCF project. Used by Intuit (TurboTax), Red Hat, Tesla, IBM, and thousands of smaller teams.
3. **Declarative configuration** — you describe what you want in YAML. ArgoCD does the rest.
4. **Handles complexity** — supports Helm charts, Kustomize overlays, raw manifests, and Jsonnet. We're using raw manifests today, but the same tool scales to enormous deployments.
5. **Self-healing** — if someone runs `kubectl delete` on a resource that should exist, ArgoCD puts it back. The cluster self-heals based on what Git declares.

Here's what the ArgoCD model looks like in practice:

```yaml
# argocd/application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ai-coderrank
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/YOUR_USER/ai-coderrank.git
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

That file says: "Watch the `k8s/` directory of this GitHub repo. When it changes, sync it to the `default` namespace. If the cluster drifts, heal it automatically."

One YAML file. That's all the deployment configuration you need.

---

### Slide 4: The Three Principles

GitOps rests on three principles. Let's make them concrete:

**1. Declarative configuration**
You don't write scripts that say "run this, then run that, then check this." You write YAML that says "I want 2 replicas of this container on port 3000 with these environment variables." Kubernetes and ArgoCD figure out how to get there.

> Analogy: It's the difference between giving someone turn-by-turn directions ("go left, then right, then left again") versus giving them an address and letting Google Maps figure out the route. Declarative = the address. Imperative = the directions.

**2. Git as the single source of truth**
Every change is a commit. Every commit has an author, a timestamp, a message, and a diff. You get a full audit trail for free. Want to know who changed the replica count from 2 to 5 last Tuesday? `git log`. Want to roll back? `git revert`. Your deployment history IS your Git history.

**3. Automated reconciliation**
The system continuously compares desired state (Git) with actual state (cluster) and corrects any drift. You don't trigger deployments. They happen because the states diverged.

---

### Slide 5: What We're About to Do

Here's the game plan for the practical. Follow along mentally:

1. **Install ArgoCD** on your k3s cluster — one `kubectl apply` command (the last one you'll ever run manually for deployments)
2. **Get the admin password** and access the ArgoCD UI via port-forward
3. **Apply the ArgoCD Application** — point it at your ai-coderrank repo
4. **Watch the first sync** — ArgoCD reads your `k8s/` manifests and applies them
5. **Expose the app** — set up NodePort so it's reachable from the internet
6. **Push the dark theme** — commit and push, then watch ArgoCD detect and deploy the change
7. **Access from a browser** — your app, on the internet, with the dark theme, deployed via GitOps

And then, because this is Claude Code 101 and we don't stop at "it works":

8. **Use `/loop`** to monitor ArgoCD sync status in real time
9. **Use `/schedule`** to set up a recurring health check
10. **Use remote control** to monitor everything from your phone

---

### Slide 6: /loop, /schedule, and Remote Control

Three features that turn Claude Code from a development tool into an operations tool.

**`/loop`** — Run any command or prompt on a repeating interval:
```
/loop 30s check if ArgoCD sync is complete for ai-coderrank
```
Claude will check every 30 seconds and report back. Perfect for watching deployments roll out, monitoring pod status, or waiting for a slow migration to complete.

**`/schedule`** — Create recurring cloud tasks that run on a cron schedule:
```
/schedule create "Daily health check" --cron "0 9 * * *" \
  --prompt "Check the status of all pods in the ai-coderrank namespace, \
  verify the app responds on the health endpoint, and report any issues"
```
This runs a Claude agent in the cloud — on a schedule, without you being at your desk. Morning health checks, nightly security scans, weekly dependency audits. Set it and forget it.

**Remote control** — Claude Code sessions can be accessed remotely. Use `/remote-control` inside an active session or start Claude with `--remote-control`, then check in from your phone's browser or the Claude app. You can monitor a deployment from the couch, approve a sync from a taxi, or check pod logs from bed. (We won't judge.)

---

### Slide 7: The Big Picture

Let's zoom out. Look at what you've built over these 12 blocks:

```
You write code
     |
     v
Claude Code helps you implement, review, test
     |
     v
Git commit + push
     |
     v
GitHub Actions runs CI (Block 10)
     |
     v
ArgoCD detects the change (Block 12 — RIGHT NOW)
     |
     v
Kubernetes applies the new state
     |
     v
App is live on the internet
     |
     v
/schedule monitors health daily
/loop watches deploys in real time
Remote control lets you manage from anywhere
```

That's a complete, modern, production-grade development and deployment pipeline. Not a tutorial toy. Not a simulation. The real thing.

You built all of that. With Claude Code.
