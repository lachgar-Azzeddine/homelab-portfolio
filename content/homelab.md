---
title: "Homelab"
layout: "single"
url: "/homelab/"
summary: "A production-grade Kubernetes homelab running on a single Dell OptiPlex 7020 MFF."
showToc: true
---

## Overview

<!-- TODO: 2-3 sentence intro. What it is, why you built it, what it demonstrates. -->

**Hardware:** Dell OptiPlex 7020 MFF — Intel Core i5-14500T (14C/20T), 64GB DDR5, 4TB NVMe
**Domain:** [azzhomelab.tech](https://azzhomelab.tech)
**Source:** [homelab-gitops on GitHub](https://github.com/lachgar-Azzeddine/homelab-gitops)

---

## Architecture

<!-- TODO: Embed an architecture diagram here. The ASCII diagram from your docs works
     well converted to an image, or use Excalidraw/draw.io and export as SVG. -->

### Network access paths

Two paths into the cluster — each intentional:

**Public (Cloudflare Tunnel)**
```
Internet → Cloudflare DNS → Tunnel → cloudflared pod → Service
```
No inbound ports open. TLS terminated at Cloudflare edge.

**Private (Tailscale)**
```
Laptop → Tailscale → LXC subnet router → MetalLB VIP → Istio Gateway → Service
```
WireGuard-encrypted. Internal tools (ArgoCD, Longhorn) exposed only here.

---

## Platform Stack

| Component | Version | Role |
|---|---|---|
| Proxmox VE | 9.1.6 | Hypervisor — 3 VMs on isolated vmbr1 subnet |
| RKE2 | v1.34.5 | Kubernetes — 1 server + 2 workers, Canal CNI |
| ArgoCD | v3.3.4 | GitOps controller — App-of-Apps pattern |
| MetalLB | v0.14.9 | Bare-metal load balancer — L2 mode |
| cert-manager | v1.17.2 | TLS automation — Let's Encrypt DNS-01 via Cloudflare |
| Istio | v1.25.2 | Ingress gateway — TLS termination |
| cloudflared | 2025.4.0 | Cloudflare Tunnel client |
| Longhorn | v1.11.0 | Distributed block storage — 2-replica volumes |
| Datadog | v7.77.1 | Observability — metrics, logs, orchestrator explorer |

---

## Key Design Decisions

### Why RKE2 over K3s or kubeadm?

<!-- TODO: Your reasoning. Hint: etcd bundled, production-grade, FIPS, Rancher ecosystem. -->

### Why Longhorn over NFS or local-path?

<!-- TODO: Your reasoning. Hint: replication, UI, Kubernetes-native, CSI compliance. -->

### Why Cloudflare Tunnel instead of port forwarding?

<!-- TODO: Your reasoning. Hint: no open ports, no public IP needed, free, TLS at edge. -->

### Why GitOps (ArgoCD) instead of direct kubectl?

<!-- TODO: Your reasoning. Hint: drift detection, self-healing, audit trail, declarative state. -->

---

## Planned Additions

- Raspberry Pi 5 — Pi-hole (DNS), Uptime Kuma, Homepage dashboard, Tailscale exit node
- GitLab CE on Proxmox LXC — self-hosted source of truth, move off GitHub
- Vault — secret management with Raft storage on Longhorn
- DevSecOps layer — Trivy, Kyverno, Falco
