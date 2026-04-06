---
layout: block-part
title: "Infrastructure — k3s on DigitalOcean"
block_number: 7
description: "Presentation notes and speaking flow for Block 07."
part_name: "Presentation"
overview_url: /course/block-07-infrastructure/
presentation_url: /course/block-07-infrastructure/presentation/
hands_on_url: /course/block-07-infrastructure/hands-on/
permalink: /course/block-07-infrastructure/presentation/
locale: en
translation_key: block-07-presentation
---
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
