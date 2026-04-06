---
layout: block
title: "Infrastructure — k3s on DigitalOcean"
block_number: 7
description: "Provision a cloud server, install lightweight Kubernetes, and deploy ai-coderrank as real pods — all guided by Claude Code."
time: "~40 min (10 min presentation + 30 min practical)"
features:
  - Long-form infrastructure tasks
  - Script generation
  - Remote server guidance
  - SSH and kubeconfig management
objectives:
  - Understand why k3s is a great choice for lightweight Kubernetes
  - Provision a DigitalOcean droplet with Claude's help
  - Install k3s and verify the cluster is running
  - Copy kubeconfig locally for remote kubectl access
  - Deploy ai-coderrank K8s manifests to the cluster
  - Verify pods are running and port-forward to test
---

## From Localhost to the Real World

Everything up to this point has been local. Your app runs on your machine, your Docker builds happen on your machine, your kubectl points at a local context. That changes now.

In this block, you go from "it works on my machine" to "it works on a server I can SSH into from anywhere." That's a massive mental shift. Suddenly you care about firewall rules, SSH keys, disk space, and network connectivity. Suddenly "deploy" means something real.

And here's the exciting part — Claude Code is genuinely useful for infrastructure work. Not because it replaces knowing what you're doing, but because it remembers the 47 flags you always forget, generates scripts you'd otherwise spend 20 minutes writing, and walks you through multi-step server setup without losing track of where you are.

## What We'll Cover

1. **Why k3s** — full Kubernetes in a single binary that runs on a $24/month server
2. **Provisioning a droplet** — Claude generates the setup script or walks you through the DO console
3. **Installing k3s** — one curl command, but understanding what it does
4. **Verifying the cluster** — nodes, system pods, and making sure everything is healthy
5. **Copying kubeconfig** — so you can kubectl from your laptop
6. **Deploying ai-coderrank** — applying the K8s manifests you've been reviewing
7. **Port-forwarding to verify** — seeing your app running on real infrastructure

## Why This Block Matters

There's a saying in DevOps: "Infrastructure is code you're afraid to run twice."

Claude Code takes some of that fear away. When you're SSHed into a remote server and not sure what the next step is, Claude can generate the exact command, explain what it does before you run it, and troubleshoot when something goes wrong. It doesn't replace your judgment — you still decide whether to hit Enter — but it dramatically reduces the "staring at a blank terminal wondering what to type" phase.

By the end of this block, you'll have a real Kubernetes cluster running your real application on a real server. That's not a simulation. That's production infrastructure.

## Cost Notice

> **This block requires a DigitalOcean droplet** (s-2vcpu-4gb, $24/month). New DigitalOcean accounts get **$200 in free credit** for 60 days, which is more than enough for the entire course. See the <a href="{{ '/resources/cost-guide/' | relative_url }}">Cost Guide</a> for details.
>
> No API key is needed -- everything runs through your Pro subscription.

## Prerequisites

- Completed Blocks 0-6 (skills and memory configured)
- A DigitalOcean account (or willingness to create one -- **s-2vcpu-4gb** droplet at $24/month, free with new-account credit)
- An SSH key pair on your local machine (`~/.ssh/id_ed25519` or similar)
- The ai-coderrank project with K8s manifests in `k8s/`

---

## Part 1: Presentation {#presentation}

> **Duration**: ~10 minutes
> **Goal**: Students understand why k3s is the right choice for lightweight Kubernetes, what DigitalOcean offers, and what the target architecture looks like.

---

### Slide 1: The Kubernetes Tax

Let's talk about the elephant in the room. Kubernetes is amazing. It's also _a lot_.

A full kubeadm-managed cluster wants:
- **3 control plane nodes** (for HA) — each needing 2 CPU, 4GB RAM minimum
- **etcd** — a separate distributed database just for cluster state
- **Networking plugin** — Calico, Cilium, Flannel — you have to pick one and configure it
- **Load balancer** — MetalLB, or your cloud provider's LB
- **Storage** — CSI drivers, persistent volume provisioners
- **Ingress** — Nginx, Traefik, HAProxy — another choice, another config

That's easily $200-400/month on any cloud provider before you deploy a single pod of your own application. For a production e-commerce platform with 50 microservices? Worth it. For our course project? Absurd.

We need something lighter.

---

### Slide 2: Enter k3s — Kubernetes on a Diet

k3s is Kubernetes. Not "kinda like Kubernetes" or "Kubernetes-compatible." It's certified, conformant Kubernetes that passes the exact same CNCF conformance tests as the full distribution. The difference is _how_ it's packaged.

| Feature | Full K8s (kubeadm) | k3s |
|---------|-------------------|-----|
| Binary size | ~300MB + dependencies | **~60MB single binary** |
| RAM baseline | 2-4GB per node | **512MB** |
| etcd | Required (separate cluster) | **SQLite** (embedded, or optional etcd/postgres) |
| Networking | BYO (Calico, Cilium) | **Flannel** (built-in) |
| Ingress | BYO (Nginx, Traefik) | **Traefik** (built-in) |
| Load balancer | BYO (MetalLB) | **ServiceLB** (built-in) |
| Storage | BYO CSI driver | **Local-path provisioner** (built-in) |
| Install time | 30-60 minutes | **30 seconds** |

One curl command. That's the install. Everything you need is included. And every `kubectl` command you know works exactly the same.

> **Fun fact**: k3s was named because it's "half the size of k8s." Kubernetes has 10 letters, which got shortened to k-8-s (k + 8 letters + s). k3s follows the same pattern but with 5 letters total — k + 3 letters + s. Half the name, half the footprint. The project was created by Darren Shepherd at Rancher Labs (now part of SUSE) and released in 2019.

---

### Slide 3: Why DigitalOcean?

We need a server. There are dozens of cloud providers. Here's why DigitalOcean fits this course:

**Simplicity**. Creating a droplet takes 60 seconds through the UI. No VPCs to configure, no IAM roles to set up, no 47-tab console to navigate. Click, click, done.

**Predictable pricing**. A `s-2vcpu-4gb` droplet (2 vCPU, 4GB RAM, 80GB SSD) costs exactly **$24/month**. No surprise egress charges, no "it depends on usage" billing. Twenty-four dollars. Period.

**Good enough for real work**. DigitalOcean isn't just for tutorials. Plenty of production workloads run there. For a single-node k3s cluster running our app, it's more than enough.

The alternatives are fine too — Hetzner ($4.50/mo for 2GB!), Linode, Vultr, even a spare Raspberry Pi sitting on your desk. The k3s install is the same everywhere. We use DigitalOcean because the console is clean and the pricing is transparent.

---

### Slide 4: The Target Architecture

Here's what we're building in this block:

```
Your Laptop                          DigitalOcean Droplet
+--------------+                     +---------------------------+
|              |    SSH / kubectl     |  Ubuntu 22.04             |
|  Claude Code | ─────────────────── |  k3s (single node)        |
|  kubectl     |                     |                           |
|              |                     |  Pods:                    |
+--------------+                     |  ┌─────────────────────┐  |
                                     |  │ ai-coderrank (Next)  │  |
                                     |  │ namespace: ai-coder  │  |
                                     |  └─────────────────────┘  |
                                     |                           |
                                     |  System pods:             |
                                     |  - CoreDNS                |
                                     |  - Traefik                |
                                     |  - ServiceLB              |
                                     |  - Metrics server         |
                                     +---------------------------+
```

One droplet. One k3s binary. Your app running as pods. That's it.

Not publicly exposed yet — we'll do that with ArgoCD and NodePort in Block 12. For now, we verify it works via `kubectl port-forward` from your laptop.

---

### Slide 5: What Claude Does (and Doesn't Do) for Infra

Let's be clear about Claude Code's role in infrastructure work.

**What Claude is great at:**
- Generating provisioning scripts with the right flags and options
- Remembering the exact `scp` syntax you always Google
- Writing the `curl | sh` install command with correct environment variables
- Troubleshooting when `kubectl get nodes` shows `NotReady`
- Explaining what each step does before you run it

**What Claude cannot do:**
- Click buttons in the DigitalOcean console for you
- SSH into your server (it runs commands on _your_ machine, not remote ones)
- Fix networking issues it can't observe (no access to the remote server's state)

The workflow is: Claude generates the command, you run it. Claude reads the output, suggests the next step. You stay in control. This is especially important for infrastructure — a wrong command on a remote server can break things that are hard to undo.

> **Think of Claude as the senior engineer sitting next to you during your first server setup.** They tell you what to type and why. They read the error messages with you. But your fingers are on the keyboard, and you decide when to press Enter.

---

### Slide 6: The Game Plan

Here's what the practical looks like, step by step:

1. **Provision** — Create a DigitalOcean droplet (Claude generates the script, or you use the console)
2. **Connect** — SSH into the droplet, verify it's a fresh Ubuntu box
3. **Install k3s** — One command, wait 30 seconds, done
4. **Verify cluster** — `kubectl get nodes`, `kubectl get pods -A`
5. **Copy kubeconfig** — Bring the k3s config to your laptop so you can kubectl remotely
6. **Deploy** — `kubectl apply -k k8s/` from your laptop
7. **Verify app** — Port-forward and hit the app in your browser

Seven steps. Thirty minutes. At the end, you have a real Kubernetes cluster running your real application.

---

### Key Takeaways

| Concept | What It Is | Why It Matters |
|---------|-----------|----------------|
| k3s | Lightweight, certified Kubernetes in a single binary | Full K8s power on a $24/month server |
| DigitalOcean droplet | Virtual server in the cloud | Simple, predictable, cheap |
| kubeconfig | Credentials file for kubectl access | Lets you manage the cluster from your laptop |
| `kubectl apply -k` | Apply Kustomize-managed manifests | Deploys all your K8s resources in one command |
| Port-forward | Tunnel a pod's port to localhost | Test without exposing to the internet |

> **Transition**: Time to provision some real infrastructure. You're about to go from "I have YAML files" to "I have pods running in the cloud." Let's do it.

---

## Part 2: Hands-On {#practical}

> **Duration**: ~30 minutes
> **Outcome**: A DigitalOcean droplet running k3s with ai-coderrank deployed as Kubernetes pods.
> **Prerequisites**: Completed Blocks 0-6, a DigitalOcean account, an SSH key pair on your local machine

---

### Step 1: Generate a Droplet Provisioning Script (~5 min)

First, let's have Claude generate a script that provisions our droplet using the DigitalOcean CLI (`doctl`). If you prefer the web console, skip to the "Console Alternative" below.

Start Claude Code and ask:

```
Generate a shell script that provisions a DigitalOcean droplet with these specs:
- Name: k3s-coderrank
- Size: s-2vcpu-4gb
- Image: Ubuntu 22.04 (ubuntu-22-04-x64)
- Region: fra1 (or nyc1 — pick whichever is closer to me)
- SSH key: use my existing key from `doctl compute ssh-key list`
- Tags: course, k3s

The script should:
1. Check that doctl is installed and authenticated
2. List available SSH keys and let me pick one
3. Create the droplet
4. Wait for it to be active
5. Print the IP address at the end

Use doctl CLI commands.
```

Claude will generate something like this:

```bash
#!/bin/bash
set -euo pipefail

# Check doctl is available
if ! command -v doctl &> /dev/null; then
  echo "doctl not found. Install: brew install doctl"
  exit 1
fi

# Verify authentication
doctl account get || { echo "Run: doctl auth init"; exit 1; }

# List SSH keys
echo "Available SSH keys:"
doctl compute ssh-key list --format ID,Name,FingerPrint
echo ""
read -p "Enter SSH key ID: " SSH_KEY_ID

# Create droplet
echo "Creating droplet..."
DROPLET_ID=$(doctl compute droplet create k3s-coderrank \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --region fra1 \
  --ssh-keys "$SSH_KEY_ID" \
  --tag-names "course,k3s" \
  --wait \
  --format ID \
  --no-header)

# Get IP
DROPLET_IP=$(doctl compute droplet get "$DROPLET_ID" --format PublicIPv4 --no-header)
echo ""
echo "Droplet created!"
echo "IP: $DROPLET_IP"
echo ""
echo "SSH: ssh root@$DROPLET_IP"
```

Review the script, then run it:

```bash
chmod +x provision-droplet.sh
./provision-droplet.sh
```

Save the IP address — you'll need it for every remaining step.

#### Console Alternative

If you don't have `doctl` installed, use the DigitalOcean web console:

1. Go to https://cloud.digitalocean.com/droplets/new
2. **Region**: Frankfurt (fra1) or New York (nyc1)
3. **Image**: Ubuntu 22.04 (LTS) x64
4. **Size**: Basic > Regular > $24/mo (2 vCPU, 4 GB RAM, 80 GB SSD)
5. **Authentication**: SSH Key (add your `~/.ssh/id_ed25519.pub` if not already there)
6. **Hostname**: `k3s-coderrank`
7. **Tags**: `course`, `k3s`
8. Click **Create Droplet**
9. Wait ~60 seconds, copy the IP address

---

### Step 2: SSH Into the Droplet (~2 min)

```bash
ssh root@<YOUR_DROPLET_IP>
```

If this is your first time connecting, you'll see a fingerprint confirmation. Type `yes`.

Verify you're on a fresh Ubuntu box:

```bash
cat /etc/os-release   # Should show Ubuntu 22.04
free -h               # Should show ~4GB RAM
df -h                 # Should show ~80GB disk
```

> **Tip**: If SSH fails with "Permission denied," make sure the SSH key you selected during droplet creation matches the one on your laptop. Check with: `ssh -i ~/.ssh/id_ed25519 root@<IP>`

---

### Step 3: Install k3s (~3 min)

Still SSHed into the droplet, run:

```bash
curl -sfL https://get.k3s.io | sh -
```

That's it. One command. Wait about 30 seconds.

What just happened:
- Downloaded the k3s binary (~60MB)
- Installed it to `/usr/local/bin/k3s`
- Created a systemd service (`k3s.service`)
- Started the k3s server (control plane + worker in one process)
- Generated a kubeconfig at `/etc/rancher/k3s/k3s.yaml`
- Deployed system components: CoreDNS, Traefik, ServiceLB, Metrics Server

You can ask Claude to explain any of these components:

```
What is each system component that k3s just installed? What does CoreDNS do? What about Traefik and ServiceLB?
```

---

### Step 4: Verify the Cluster (~3 min)

Still on the droplet, run:

```bash
kubectl get nodes
```

You should see:

```
NAME             STATUS   ROLES                  AGE   VERSION
k3s-coderrank    Ready    control-plane,master   1m    v1.31.x+k3s1
```

The key word is **Ready**. If it says `NotReady`, wait 30 seconds and try again — k3s is still starting up.

Now check the system pods:

```bash
kubectl get pods -A
```

You should see something like:

```
NAMESPACE     NAME                                      READY   STATUS    RESTARTS   AGE
kube-system   coredns-xxxxxxxxxx-xxxxx                   1/1     Running   0          2m
kube-system   local-path-provisioner-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
kube-system   metrics-server-xxxxxxxxxx-xxxxx            1/1     Running   0          2m
kube-system   svclb-traefik-xxxxx-xxxxx                  2/2     Running   0          2m
kube-system   traefik-xxxxxxxxxx-xxxxx                   1/1     Running   0          2m
```

All pods should be `Running` with `1/1` (or `2/2`) in the READY column. If any pod is in `CrashLoopBackOff` or `Pending`, ask Claude for help:

```
kubectl get pods -A shows this output:
<paste output>
One of the pods is in CrashLoopBackOff. What's going on and how do I fix it?
```

Congratulations — you have a working Kubernetes cluster. On a single $24/month server. In under 5 minutes.

---

### Step 5: Copy Kubeconfig to Your Laptop (~5 min)

Right now, `kubectl` only works when you're SSHed into the droplet. Let's fix that by copying the kubeconfig to your laptop.

**Exit the SSH session** (type `exit` or press `Ctrl+D`) and run from your local machine:

```bash
mkdir -p ~/.kube
scp root@<YOUR_DROPLET_IP>:/etc/rancher/k3s/k3s.yaml ~/.kube/config-do
```

Now you need to edit the config file — it currently points to `127.0.0.1`, which was correct on the droplet but wrong from your laptop. Ask Claude:

```
I just copied my k3s kubeconfig to ~/.kube/config-do. It has server: https://127.0.0.1:6443 but I need it to point to my droplet at <YOUR_DROPLET_IP>. Update the file and show me how to use it with kubectl.
```

Claude will:
1. Read the file
2. Replace `127.0.0.1` with your droplet IP
3. Show you how to set the `KUBECONFIG` environment variable

The result:

```bash
# Use this kubeconfig
export KUBECONFIG=~/.kube/config-do

# Verify it works
kubectl get nodes
```

You should see your droplet node, same as before — but now from your laptop.

> **Pro tip**: To make this permanent, add the export to your `~/.zshrc` or `~/.bashrc`. Or use the `KUBECONFIG` variable to merge configs:
> ```bash
> export KUBECONFIG=~/.kube/config:~/.kube/config-do
> kubectl config get-contexts   # Shows all available clusters
> kubectl config use-context default  # Switch between clusters
> ```

---

### Step 6: Deploy ai-coderrank (~7 min)

Now the payoff. Make sure your `KUBECONFIG` points to the DO cluster, then deploy from the ai-coderrank project directory:

```bash
cd ~/ai-coderrank
export KUBECONFIG=~/.kube/config-do
```

Before deploying, let's review what we're about to apply. Ask Claude:

```
Look at the k8s/ directory and explain what each manifest does. What resources will be created when I run kubectl apply -k k8s/?
```

Claude will read through the Kustomization file and each manifest, explaining:
- **Namespace** — isolated environment for the app
- **Deployment** — the app pods and their configuration
- **Service** — internal networking to reach the pods
- **ConfigMap** — configuration data
- **PVC** — persistent storage claims
- **CronJob** — scheduled tasks (if any)

Now deploy:

```bash
kubectl apply -k k8s/
```

You should see output like:

```
namespace/ai-coderrank created
configmap/ai-coderrank-config created
persistentvolumeclaim/ai-coderrank-pvc created
deployment.apps/ai-coderrank created
service/ai-coderrank created
cronjob.batch/ai-coderrank-cron created
```

If you get errors, paste them into Claude:

```
I ran kubectl apply -k k8s/ and got this error:
<paste error>
How do I fix this?
```

Common issues:
- **Image pull errors**: The Docker image might not be in a registry yet. Claude can help you push it to Docker Hub or GitHub Container Registry.
- **Resource quota**: The droplet might not have enough resources. Claude can help you adjust the resource requests in the deployment.

---

### Step 7: Verify the Deployment (~5 min)

Check that the pods are running:

```bash
kubectl get pods -n ai-coderrank
```

Expected output:

```
NAME                            READY   STATUS    RESTARTS   AGE
ai-coderrank-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
```

If the pod is in `ImagePullBackOff`, the image isn't available yet. Ask Claude:

```
My pod is in ImagePullBackOff. The deployment references image ai-coderrank:latest. How do I build and push this image to a registry so my k3s cluster can pull it?
```

If the pod is `Running`, let's port-forward to test:

```bash
kubectl port-forward -n ai-coderrank svc/ai-coderrank 3000:3000
```

Now open your browser and go to **http://localhost:3000**. You should see the ai-coderrank application — the same app you've been running locally, but now served from pods on your DigitalOcean droplet.

Press `Ctrl+C` to stop the port-forward when you're done.

Check the full deployment status:

```bash
kubectl get all -n ai-coderrank
```

This shows pods, services, deployments, and replica sets — a complete picture of your application in the cluster.

---

### Checkpoint

You now have:

```
Your Laptop                          DigitalOcean (fra1)
+--------------+                     +---------------------------+
|  kubectl     | ──── KUBECONFIG ──> |  k3s-coderrank            |
|  (config-do) |                     |  Ubuntu 22.04 + k3s       |
+--------------+                     |                           |
                                     |  Namespace: ai-coderrank  |
                                     |  - Deployment (running)   |
                                     |  - Service (ClusterIP)    |
                                     |  - ConfigMap              |
                                     |  - PVC                    |
                                     +---------------------------+
```

The app is deployed but **not publicly exposed** yet. That comes in Block 12, where we set up ArgoCD for GitOps and expose the app via NodePort on your droplet's public IP.

For now, you access the app via `kubectl port-forward`. That's fine — it proves the deployment works.

---

### Bonus Challenges

**Challenge 1: Ask Claude to diagnose the cluster**
```
Run a health check on my k3s cluster. Check node resources (CPU, memory, disk), 
pod status across all namespaces, and any warning events. Give me a summary 
of the cluster's health.
```

**Challenge 2: Scale the deployment**
```
Scale the ai-coderrank deployment to 2 replicas and show me that both pods 
are running on the same node.
```

**Challenge 3: Generate a teardown script**
Ask Claude to generate a script that cleanly removes everything — deletes the namespace, uninstalls k3s, and optionally destroys the droplet:
```
Generate a cleanup script that:
1. Deletes the ai-coderrank namespace
2. Uninstalls k3s from the droplet
3. Optionally destroys the droplet using doctl
Include safety prompts before destructive actions.
```

---

> **Next up**: In Block 8, we teach Claude Code reflexes — hooks that auto-format your code, block dangerous edits, and notify you when long tasks finish. Automation that fires without you even thinking about it.
