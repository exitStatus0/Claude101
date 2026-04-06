---
layout: block-part
title: "Infrastructure — k3s on DigitalOcean"
block_number: 7
description: "Hands-on implementation steps for Block 07."
time: "~30 minutes"
part_name: "Hands-On"
overview_url: /course/block-07-infrastructure/
presentation_url: /course/block-07-infrastructure/presentation/
hands_on_url: /course/block-07-infrastructure/hands-on/
permalink: /course/block-07-infrastructure/hands-on/
locale: en
translation_key: block-07-hands-on
---
> **Direct speech:** "Everything on this hands-on page is built so you can follow me line by line. When you see a command or prompt block, you can copy it directly into your terminal or Claude session unless I explicitly tell you it is just reference material. As we go, compare your result with mine on screen so you can catch mistakes early instead of stacking them up."

> **Duration**: ~30 minutes
> **Outcome**: A DigitalOcean droplet running k3s with ai-coderrank deployed as Kubernetes pods.
> **Prerequisites**: Completed Blocks 0-6, a DigitalOcean account, an SSH key pair on your local machine

---

### Step 1: Generate a Droplet Provisioning Script (~5 min)

First, let's have Claude generate a script that provisions our droplet using the DigitalOcean CLI (`doctl`). If you prefer the web console, skip to the "Console Alternative" below.

Start Claude Code and ask:

```text
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

```text
What is each system component that k3s just installed? What does CoreDNS do? What about Traefik and ServiceLB?
```

---

### Step 4: Verify the Cluster (~3 min)

Still on the droplet, run:

```bash
kubectl get nodes
```

You should see:

```text
NAME             STATUS   ROLES                  AGE   VERSION
k3s-coderrank    Ready    control-plane,master   1m    v1.31.x+k3s1
```

The key word is **Ready**. If it says `NotReady`, wait 30 seconds and try again — k3s is still starting up.

Now check the system pods:

```bash
kubectl get pods -A
```

You should see something like:

```text
NAMESPACE     NAME                                      READY   STATUS    RESTARTS   AGE
kube-system   coredns-xxxxxxxxxx-xxxxx                   1/1     Running   0          2m
kube-system   local-path-provisioner-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
kube-system   metrics-server-xxxxxxxxxx-xxxxx            1/1     Running   0          2m
kube-system   svclb-traefik-xxxxx-xxxxx                  2/2     Running   0          2m
kube-system   traefik-xxxxxxxxxx-xxxxx                   1/1     Running   0          2m
```

All pods should be `Running` with `1/1` (or `2/2`) in the READY column. If any pod is in `CrashLoopBackOff` or `Pending`, ask Claude for help:

```text
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

```text
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

```text
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

```text
namespace/ai-coderrank created
configmap/ai-coderrank-config created
persistentvolumeclaim/ai-coderrank-pvc created
deployment.apps/ai-coderrank created
service/ai-coderrank created
cronjob.batch/ai-coderrank-cron created
```

If you get errors, paste them into Claude:

```text
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

```text
NAME                            READY   STATUS    RESTARTS   AGE
ai-coderrank-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
```

If the pod is in `ImagePullBackOff`, the image isn't available yet. Ask Claude:

```text
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

```text
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
```text
Run a health check on my k3s cluster. Check node resources (CPU, memory, disk), 
pod status across all namespaces, and any warning events. Give me a summary 
of the cluster's health.
```

**Challenge 2: Scale the deployment**
```text
Scale the ai-coderrank deployment to 2 replicas and show me that both pods 
are running on the same node.
```

**Challenge 3: Generate a teardown script**
Ask Claude to generate a script that cleanly removes everything — deletes the namespace, uninstalls k3s, and optionally destroys the droplet:
```text
Generate a cleanup script that:
1. Deletes the ai-coderrank namespace
2. Uninstalls k3s from the droplet
3. Optionally destroys the droplet using doctl
Include safety prompts before destructive actions.
```

---

> **Next up**: In Block 8, we teach Claude Code reflexes — hooks that auto-format your code, block dangerous edits, and notify you when long tasks finish. Automation that fires without you even thinking about it.
