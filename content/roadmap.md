---
title: "Roadmap"
layout: "single"
url: "/roadmap/"
summary: "My 8-phase learning arc for 2025–2026 — from eBPF to WASM, building toward deep cloud-native security and infrastructure engineering."
showToc: true
---

Most engineers have a list of things they want to learn. This is different — it's a sequenced arc where each phase builds directly on the one before it. The order is deliberate. Skipping phases would leave gaps in the mental model.

The goal isn't to collect tools. It's to understand infrastructure at progressively deeper layers — from the kernel up to the policy layer, from identity to supply chain integrity.

---

## The Arc

```
Phase 1: eBPF          ──► kernel-level observability and networking
Phase 2: SPIFFE/SPIRE  ──► workload identity at the infrastructure layer
Phase 3: Tetragon      ──► runtime security enforcement via eBPF
Phase 4: Sigstore      ──► supply chain integrity and artifact signing
Phase 5: OPA/Gatekeeper──► policy as code, admission control
Phase 6: Crossplane    ──► infrastructure as Kubernetes resources
Phase 7: Cluster API   ──► Kubernetes-native cluster lifecycle management
Phase 8: WASM runtimes ──► next-generation workload isolation
```

---

## Phase 1 — eBPF
**Status: Not started**

eBPF is the foundation. It's what makes modern Kubernetes networking (Cilium), modern observability (Pixie, Hubble), and modern runtime security (Tetragon) possible. Before using any of those tools seriously, I want to understand the mechanism: how eBPF programs attach to kernel hooks, how maps work, how tracing and networking programs differ.

I'm not trying to write production eBPF programs. I'm building the mental model that explains *why* Cilium replaces kube-proxy instead of layering on top of it.

**Links to later phases:** Tetragon (Phase 3) is built on eBPF. Cilium's network policies are enforced via eBPF. Without this phase, those are magic boxes.

---

## Phase 2 — SPIFFE / SPIRE
**Status: Not started**

SPIFFE (Secure Production Identity Framework For Everyone) answers a question that TLS alone doesn't: *how do workloads prove their identity to each other, cryptographically, without static secrets?*

Istio uses SPIFFE SVIDs under the hood for mTLS. Running SPIRE directly means operating the identity plane that Istio abstracts. This phase is about understanding what's happening below the service mesh.

**Links to later phases:** Understanding SPIFFE makes Tetragon's process identity model clearer, and sets up the supply chain thinking in Sigstore (Phase 4).

---

## Phase 3 — Tetragon
**Status: Not started**

Tetragon is runtime security enforcement via eBPF — policies that execute at the kernel level, not the userspace level. It can terminate a process mid-execution if it violates policy, not after the fact.

This phase builds on Phase 1 (eBPF mechanics) and Phase 2 (workload identity). Tetragon's TracingPolicy CRDs enforce security at the system call level. The result is a fundamentally different threat model than network policies alone.

**Why this after SPIFFE:** Tetragon uses process identity and workload context in its enforcement. That context comes from understanding what SPIFFE-style identity means for a running pod.

---

## Phase 4 — Sigstore
**Status: Not started**

Sigstore (Cosign, Rekor, Fulcio) is the supply chain integrity layer. It answers: *can I prove this container image was built from this source code, by this CI pipeline, and hasn't been tampered with?*

The attack surface Sigstore addresses is real: a compromised image registry, a tampered build artifact, a forged digest. These aren't theoretical — they're how several major supply chain attacks worked.

**Links to later phases:** Sigstore verification integrates naturally with OPA/Gatekeeper (Phase 5) admission policies — "only admit images with a valid Sigstore signature."

---

## Phase 5 — OPA / Gatekeeper
**Status: Not started**

OPA (Open Policy Agent) and its Kubernetes integration Gatekeeper enforce policy at the admission control layer — before resources land in etcd. No privileged containers. No images from untrusted registries. Required labels on every deployment.

This is where the security knowledge from CKS lands in GitOps form: instead of documenting security requirements, you encode them as admission policies that the cluster enforces automatically.

**Why this after Sigstore:** The natural first Gatekeeper policy after learning Sigstore is "reject any image without a valid signature." The phases compound.

---

## Phase 6 — Crossplane
**Status: Not started**

Crossplane extends Kubernetes with Composite Resource Definitions — you define infrastructure (databases, queues, cloud resources) as Kubernetes objects, and Crossplane reconciles them against the actual cloud API.

The shift: infrastructure isn't separate from your application workloads. It's all Kubernetes resources, all GitOps-managed, all subject to the same RBAC and admission policies you've already built.

**Why this after policy (Phase 5):** Crossplane XRDs are Kubernetes resources. They should be subject to the same admission policies as everything else. Operating Crossplane without a policy layer is technical debt from day one.

---

## Phase 7 — Cluster API
**Status: Not started**

Cluster API manages Kubernetes cluster lifecycle (provisioning, scaling, upgrading) using Kubernetes itself as the management plane. Instead of running scripts or Terraform to create clusters, you create a `Cluster` resource.

This phase is where the homelab scales: from "one RKE2 cluster I manage manually" to "clusters as declarative resources managed by a management cluster."

**Why this after Crossplane:** The mental model of "infrastructure as Kubernetes resources" (Crossplane) maps directly to "clusters as Kubernetes resources" (CAPI). They're the same pattern at different abstraction levels.

---

## Phase 8 — WASM Runtimes
**Status: Not started**

WebAssembly (WASM) is the next workload isolation primitive after containers. WASM modules have a smaller attack surface than container images (no full OS filesystem), start faster, and can run on any architecture without recompilation.

Projects like Spin, WasmEdge, and Kubernetes' `containerd-wasm-shims` are making WASM a viable workload type in production clusters today.

**Why last:** WASM makes most sense after deeply understanding what container isolation actually provides (and where it falls short), which requires the runtime security knowledge from Phases 1–3.

---

## Where I Am Now

The five CNCF Kubernetes certifications are complete. The ICA (Istio Certified Associate) is in progress.

Phase 1 hasn't started. The sequencing above is the plan.

If you're on a similar path and want to compare notes, the best place to reach me is [LinkedIn](https://www.linkedin.com/in/lachgar-azzeddine) or [GitHub](https://github.com/lachgar-Azzeddine).
