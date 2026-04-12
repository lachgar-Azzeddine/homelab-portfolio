---
title: "Uses"
layout: "single"
url: "/uses/"
summary: "The tools I actually reach for — with honest takes on each."
showToc: true
---

A list of tools I use regularly, with actual opinions. I've separated things I run daily from things I know conceptually but haven't operated deeply. That distinction matters.

---

## What I Run Daily

### Orchestration

**RKE2** — My Kubernetes distribution for production-grade self-hosted clusters. Bundles etcd, ships CIS-hardened defaults, FIPS-capable. Heavier than K3s and that's the point — it's closer to what real regulated environments run.

**ArgoCD** — GitOps engine. App-of-Apps keeps multi-component homelab deployments manageable. The thing that changed my mental model: `selfHeal: true` means the cluster fights back against manual changes. That's not a restriction — that's correctness.

**Kustomize** — For my own manifests, over Helm. Less indirection. Patches are explicit and readable. When I `git diff` a Kustomize change I can see exactly what hits the cluster.

**kubectl** — With aggressive aliasing. `k` for `kubectl`, `kgp` for `kubectl get pods -A`, `kgn` for `kubectl get nodes`. The muscle memory is real.

### Networking & Access

**Istio** — Currently as an ingress gateway with TLS termination. ICA prep is moving me toward full mTLS policies and traffic management. The learning curve is steep and worth it.

**Tailscale** — WireGuard mesh VPN. Zero config, NAT traversal, works from anywhere. My private cluster access path — ArgoCD, Longhorn UI, Vault — only reachable here.

**Cloudflare** — DNS, Tunnel for public exposure without open ports, free wildcard TLS via cert-manager DNS-01. The Tunnel approach replaced every port-forwarding workaround I'd been patching for years.

**MetalLB** — L2 mode bare-metal load balancer. Assigns real IPs from my `10.10.0.50–99` pool to LoadBalancer Services. Without this, Kubernetes on bare metal has no clean way to expose services externally.

### Storage & Secrets

**Longhorn** — Kubernetes-native distributed block storage. CSI-compliant, 2-replica volumes across workers, good UI. Running it on a homelab is more operational overhead than `local-path`, and I run it anyway — because that's the operational experience that transfers.

**Vault** — Raft storage backend on Longhorn. Currently managing secrets that would otherwise be created manually with `kubectl create secret`. Still building out the full secret injection workflow.

### Observability

**Datadog** — Metrics, logs, orchestrator explorer, Kubernetes state monitoring. The cluster-agent + node-agents deployment gave me a real feel for how enterprise observability is deployed at scale. The orchestrator explorer view for live pod/deployment state is genuinely useful during incidents.

### Infrastructure

**Proxmox VE** — Type-1 hypervisor on the OptiPlex. Three VMs on an isolated `vmbr1` subnet, one LXC for the Tailscale subnet router. Comfortable with VM and LXC lifecycle management, storage pools, network bridge config.

**cert-manager** — Automated TLS with Let's Encrypt via DNS-01 challenge. Wildcard certificate covers `*.azzhomelab.tech`. No manual cert rotation.

---

## What I Know Conceptually (Not Daily Ops)

Being precise here: these are tools I've studied, read deeply, or used in limited contexts — but haven't operated in production or in the homelab in a sustained way.

**Prometheus + Grafana** — I use Datadog instead, so these aren't in my daily workflow. I understand the scrape model, PromQL, and dashboard design conceptually. The homelab roadmap has me adding Prometheus/Grafana eventually, but not yet.

**ELK Stack** — Understand Elasticsearch indexing, Logstash pipelines, Kibana. Haven't operated it beyond a course environment. Datadog handles log aggregation for me.

**Jenkins** — Know the Jenkinsfile/declarative pipeline model, used it lightly. In practice I reach for GitLab CI or ArgoCD workflows. Jenkins feels like infrastructure you operate; I prefer CI that operates itself.

**OpenShift** — Understand the platform: OKD base, OpenShift SDN, Routes vs Ingress, operator lifecycle. Haven't run a cluster. The concepts transfer from RKE2 experience but I wouldn't claim hands-on depth.

**AWS / Azure** — Used Azure in the context of the AZ-900 certification (Azure AI Fundamentals). Used AWS at a basic level. Not where my depth is — my experience is on-prem and bare-metal first.

**Kuma** — Istio's main alternative service mesh. Know the architecture and design philosophy. Haven't deployed it — Istio came first for me.

---

## Daily Tools

**Terminal** — `bash` with aliases. The toolbox is lean by choice.

**VS Code** — For writing manifests and markdown. With the Kubernetes extension for quick resource inspection without context-switching to the terminal.

**Git** — Every infrastructure change goes through Git first. The discipline came from operating ArgoCD — once `selfHeal` is on, a non-committed change lasts about 3 minutes before ArgoCD reverts it.
