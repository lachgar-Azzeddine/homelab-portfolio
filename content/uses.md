---
title: "Uses"
layout: "single"
url: "/uses/"
summary: "The tools and stack I work with daily — and why."
showToc: true
---

A list of the tools I reach for regularly, with brief opinions on each.

## Orchestration & Infrastructure

**RKE2** — My Kubernetes distribution of choice for production-grade self-hosted clusters. Bundles etcd, ships hardened defaults, FIPS-capable.

**ArgoCD** — GitOps engine. The App-of-Apps pattern keeps multi-component deployments manageable without drift.

**Kustomize** — Over Helm for my own manifests. Less indirection, easier to audit, patches are explicit.

**Terraform / OpenTofu** <!-- TODO: Add if you use it. -->

## Networking & Security

**Istio** — Currently as an ingress gateway. mTLS and traffic policies next.

**Tailscale** — WireGuard-based mesh VPN. Zero config, works through NAT, perfect for homelab private access.

**Cloudflare** — DNS, tunnel for public exposure without open ports, free wildcard TLS via cert-manager DNS-01.

**Vault** — Planned for secret management. Currently secrets are created manually on the cluster.

## Observability

**Datadog** — Metrics, logs, orchestrator explorer, Kubernetes state. Pro account covers the full stack.

<!-- TODO: Add others if relevant — Grafana, Prometheus, etc. -->

## Storage

**Longhorn** — Kubernetes-native distributed block storage. CSI-compliant, replicated across workers, good UI.

## Daily Tools

**kubectl** — With aliases. `k` is `kubectl`, `kgp` is `kubectl get pods -A`.

<!-- TODO: Add your terminal setup, editor, shell config if relevant. -->

## Certifications

<!-- TODO: Link to the 5 CNCF certs again, briefly. Or reference the /about page. -->
