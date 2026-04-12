---
title: "Homelab"
layout: "single"
url: "/homelab/"
summary: "A production-grade Kubernetes homelab on a single Dell OptiPlex 7020 MFF — RKE2, ArgoCD, Istio, Longhorn, Vault, Datadog, Cloudflare Tunnel."
showToc: true
---

## Overview

This is a production-grade Kubernetes homelab running on a single mini PC. I built it to go beyond certification knowledge and operate a real cluster — not simulate one. Everything here is managed via GitOps, monitored with Datadog, and designed with the same architectural discipline I'd apply to a real production system.

The cluster runs at **[azzhomelab.tech](https://azzhomelab.tech)**. The source of truth lives at **[homelab-gitops](https://github.com/lachgar-Azzeddine/homelab-gitops)**.

**Hardware:** Dell OptiPlex 7020 MFF — Intel Core i5-14500T (14C/20T), 64GB DDR5, 4TB NVMe  
**Hypervisor:** Proxmox VE — 3 VMs on an isolated internal subnet

<div id="cluster-status" class="cluster-status">
  <div class="cs-header">
    <span class="cs-title">LIVE CLUSTER STATUS</span>
    <span class="cs-updated" id="cs-updated">fetching…</span>
  </div>
  <div class="cs-grid" id="cs-grid">
    <div class="cs-loading">connecting to cluster…</div>
  </div>
</div>

---

## Architecture

{{< mermaid >}}
flowchart TD
    subgraph hw["Dell OptiPlex 7020 MFF"]
        subgraph proxmox["Proxmox VE"]
            subgraph rke2["RKE2 Kubernetes Cluster"]
                cp["server-1\ncontrol plane\nArgoCD · Istio · Vault\ncert-manager · MetalLB"]
                w1["agent-1\nworker\nLonghorn · Datadog"]
                w2["agent-2\nworker\nLonghorn · Datadog"]
                vip["MetalLB VIP\nIstio Ingress Gateway"]
            end
            lxc["LXC — Tailscale\nsubnet router"]
        end
    end

    internet(("Internet"))
    laptop(("Laptop"))
    cf["Cloudflare\nDNS + Tunnel"]
    ts["Tailscale\nWireGuard mesh"]
    svc["Service"]

    internet -->|HTTPS| cf
    cf -->|outbound tunnel| cp
    cp -->|HTTP| svc

    laptop -->|WireGuard| ts
    ts --> lxc
    lxc --> vip
    vip -->|mTLS| svc

    cp --- w1
    cp --- w2
{{< /mermaid >}}

Two deliberate access paths — not because one is a fallback for the other, but because they serve different trust models.

**Public via Cloudflare Tunnel** — Zero open ports on the home router. The tunnel initiates outbound. TLS terminates at the Cloudflare edge. Traffic reaches services directly, bypassing Istio intentionally.

**Private via Tailscale** — WireGuard-encrypted mesh. The only path to internal tools (ArgoCD, Longhorn, Vault). Routed through a Tailscale subnet router LXC into the cluster's load balancer, through the Istio gateway with full mTLS.

---

## Platform Stack

| Component | Role |
|---|---|
| Proxmox VE | Hypervisor — 3 VMs + LXC on isolated subnet |
| RKE2 | Kubernetes — 1 control plane + 2 workers, Canal CNI |
| ArgoCD | GitOps controller — App-of-Apps pattern |
| MetalLB | Bare-metal load balancer — L2 mode |
| cert-manager | TLS automation — Let's Encrypt wildcard via Cloudflare DNS-01 |
| Istio | Ingress gateway — TLS termination, mTLS in mesh |
| cloudflared | Cloudflare Tunnel client — zero open ports |
| Longhorn | Kubernetes-native distributed block storage — replicated volumes |
| Vault | Secret management — Raft storage backend |
| Datadog | Observability — metrics, logs, orchestrator explorer |

---

## GitOps Layout

Everything is driven by ArgoCD using the App-of-Apps pattern. No `kubectl apply` for managed resources — ever.

```
homelab-gitops/
├── root-app.yaml          # ArgoCD bootstrap — watches apps/
├── apps/                  # One Application YAML per platform component
└── platform/              # Kustomize overlays — the actual manifests
    ├── argocd/
    ├── cert-manager/
    ├── cloudflared/
    ├── istio/
    ├── longhorn/
    ├── metallb/
    ├── portfolio/
    └── vault/
```

`apps/` declares *what* to deploy. `platform/` declares *how*. Adding a new component is always the same two-step: an `apps/` entry and a `platform/` overlay.

---

## Architecture Decision Records

The decisions below are the ones that had real tradeoffs. I document them here because "I followed a tutorial" and "I made a deliberate architectural choice" are not the same thing.

### ADR-001: RKE2 over K3s or kubeadm

**Context:** I needed a Kubernetes distribution to run on Proxmox VMs. Three realistic options: K3s (lightweight, fast), kubeadm (vanilla, manual), RKE2 (hardened, opinionated).

**Decision:** RKE2.

**Reasoning:**
- Bundles etcd — no external etcd cluster to operate for HA
- Ships CIS-hardened defaults out of the box (relevant given I was studying for CKS)
- FIPS-capable — relevant for eventually targeting regulated environments
- Closer to what I encounter in production Medtech environments

K3s was tempting for its simplicity, but it felt like optimizing for convenience over credibility. kubeadm would have given more control but more operational surface area for something I'm running alone.

### ADR-002: Cloudflare Tunnel over port forwarding

**Context:** I needed public access to services without a static IP, without opening firewall ports, and without paying for a VPS.

**Decision:** Cloudflare Tunnel (`cloudflared` as a pod in the cluster).

**Reasoning:**
- Zero inbound ports open on my home router — no attack surface exposed
- No static public IP required — the tunnel initiates outbound
- TLS terminates at the Cloudflare edge — free, automatic
- The `cloudflared` pod runs in the cluster itself — GitOps-managed, no separate host config

The trade-off: Cloudflare is in the trust path for public traffic. For services I want fully private, this path doesn't exist — they're only reachable via Tailscale.

### ADR-003: Dual ingress paths — intentional, not inconsistency

**Context:** Some services should be publicly accessible (this portfolio). Others should never be — internal dashboards, secret management. Two different trust requirements.

**Decision:** Public traffic via Cloudflare Tunnel directly to services (bypassing Istio). Private traffic via Tailscale → load balancer → Istio Gateway.

**Reasoning:**
- Cloudflare path: simplicity for public exposure, no double TLS
- Istio path: full mTLS capability, traffic policies, observability for private traffic
- The clarity of "public = Cloudflare, private = Istio" is worth operating two ingress systems

### ADR-004: Longhorn over NFS or local-path provisioner

**Context:** Persistent storage for stateful workloads. Options: `local-path` (simple, no replication), NFS (external dependency), Longhorn (Kubernetes-native, replicated).

**Decision:** Longhorn.

**Reasoning:**
- CSI-compliant — volumes work with any standard PVC workload
- Replication across worker nodes — `local-path` gives no protection against node loss
- Kubernetes-native — no external server to operate
- Built-in UI — backup, restore, volume inspection without extra tooling

The trade-off: significantly heavier than `local-path`. I accepted this deliberately — it's better operational experience to run what production uses.

---

## Satellite Infrastructure

### Raspberry Pi 5 — Home Network Layer

A separate Docker Compose stack on a dedicated Pi handles home network infrastructure that doesn't belong in the Kubernetes cluster.

| Service | Role |
|---|---|
| Pi-hole | DNS sinkhole — network-level ad and tracker blocking |
| Unbound | Recursive DNS resolver — Pi-hole upstream, queries root servers directly |
| Uptime Kuma | Service uptime monitoring |
| Homepage | Self-hosted dashboard |
| Cloudflare Tunnel | Public exposure without open ports |
| Tailscale | Exit node + home subnet router |

DNS chain: `Client → Pi-hole → Unbound → Root servers`

No upstream DNS provider in the path. No Google, no Cloudflare DNS in the trust chain.

---

## What's Next

- **GitLab CE on Proxmox LXC** — move source of truth off GitHub, self-hosted CI/CD
- **Istio mTLS policies** — move beyond gateway-only usage, enforce mesh-wide mTLS
- **DevSecOps layer** — Trivy (image scanning), Kyverno (admission policies), Falco (runtime detection)
- **eBPF observability** — Tetragon as the next observability layer
