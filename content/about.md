---
title: "About"
layout: "single"
url: "/about/"
summary: "About Azzeddine Lachgar — Kuberstronaut and DevOps Engineer"
showToc: true
---

## Who I am

I'm a DevOps Engineer based in Casablanca, Morocco, currently working at **Omnishore** in a Medtech environment. I hold all five CNCF Kubernetes certifications — KCNA, KCSA, CKA, CKAD, and CKS — which makes me one of a small group worldwide who've earned the full Kuberstronaut designation.

I got into infrastructure because I wanted to understand how things actually work at the system level, not just how to deploy them. That led me from electrical engineering to network engineering to cloud-native infrastructure — and eventually to building a production-grade Kubernetes cluster on a single mini PC in my apartment.

Most of what I know I built and broke myself. The homelab is the proof of that.

---

## Certifications

I completed all five CNCF Kubernetes certifications. They're listed below in the order I earned them — from broad to deep, ending at security.

<div class="cert-badges">
  <a href="https://www.credly.com/badges/4e4ddcdc-4e2d-4701-ad64-b318c9ca1826/public_url" target="_blank" rel="noopener">
    <img src="https://images.credly.com/size/340x340/images/f28f1d88-428a-47f6-95b5-7da1dd6c1000/KCNA_badge.png" alt="KCNA — Kubernetes and Cloud Native Associate" title="KCNA" />
  </a>
  <a href="https://www.credly.com/badges/06eb275b-2aa6-49ce-97fa-922748961223/public_url" target="_blank" rel="noopener">
    <img src="https://images.credly.com/size/340x340/images/67dd8a95-8876-4051-9cb9-3d97c204f85a/image.png" alt="KCSA — Kubernetes and Cloud Native Security Associate" title="KCSA" />
  </a>
  <a href="https://www.credly.com/badges/b5577bb6-4e19-449a-a038-ab2fdd54c4b4/public_url" target="_blank" rel="noopener">
    <img src="https://images.credly.com/size/340x340/images/8b8ed108-e77d-4396-ac59-2504583b9d54/cka_from_cncfsite__281_29.png" alt="CKA — Certified Kubernetes Administrator" title="CKA" />
  </a>
  <a href="https://www.credly.com/badges/de77d8a6-a996-4e87-9a04-92be6aa2837f/public_url" target="_blank" rel="noopener">
    <img src="https://images.credly.com/size/340x340/images/cc8adc83-1dc6-4d57-8e20-22171247e052/blob" alt="CKAD — Certified Kubernetes Application Developer" title="CKAD" />
  </a>
  <a href="https://www.credly.com/badges/a6b5eabf-acc1-436a-9dcc-4bec2da15e6a/public_url" target="_blank" rel="noopener">
    <img src="https://images.credly.com/size/340x340/images/9945dfcb-1cca-4529-85e6-db1be3782210/kubernetes-security-specialist-logo2.png" alt="CKS — Certified Kubernetes Security Specialist" title="CKS" />
  </a>
</div>

| Certification | Full Name | Status |
|---|---|---|
| **KCNA** | Kubernetes and Cloud Native Associate | ✅ Earned |
| **KCSA** | Kubernetes and Cloud Native Security Associate | ✅ Earned |
| **CKA** | Certified Kubernetes Administrator | ✅ Earned |
| **CKAD** | Certified Kubernetes Application Developer | ✅ Earned |
| **CKS** | Certified Kubernetes Security Specialist | ✅ Earned |
| **ICA** | Istio Certified Associate | 🔄 In progress |

Completing all five CNCF Kubernetes certs qualifies for the **Kuberstronaut** designation — awarded to a small group of engineers globally who hold the full certification set.

---

## Experience

### DevOps Engineer — Omnishore *(Casablanca, Morocco)*
**November 2025 – Present**

Working in a Medtech production environment. Day-to-day: Kubernetes cluster operations, infrastructure automation with Ansible, containerized application lifecycle management, and CI/CD pipeline maintenance across multi-environment deployments. The security constraints of the Medtech domain pushed me early into thinking about supply chain integrity, least-privilege policies, and audit trails — which aligns with where the CNCF ecosystem is heading.

### Internship PFE — Tech My Team *(Marrakesh, Morocco)*
**February 2025 – June 2025**

Built a sovereign DevOps platform from scratch: GitLab CE, RKE2, ArgoCD, Harbor (private container registry), SonarQube, Helm, and Sealed Secrets. Migrated the team's source control from GitHub to GitLab and refactored CI/CD pipelines end-to-end. This is where I first operated ArgoCD's App-of-Apps pattern at a meaningful scale and learned why GitOps matters beyond just "Git as source of truth."

### Internship — Datalink *(Casablanca, Morocco)*
**June 2024 – September 2024**

Deployed a local LLM to assist internal developers — a GPU-absent, resource-constrained environment that forced creative thinking about inference optimization and model serving. Good early exposure to the gap between "it works on my laptop" and "it runs reliably for a team."

---

## Education

**Computer Network Engineering and Intelligent Telecommunications Systems**
Faculty of Sciences and Techniques, Settat — *2023–2025*

**Electrical Engineering and Automated Systems**
Faculty of Sciences and Techniques, Settat — *2022–2023*

**DEUST: Electrical Engineering & Mechanical Engineering**
Faculty of Sciences and Techniques, Settat — *2020–2022*

The electrical and systems background isn't a detour — it's why I think about infrastructure at the signal level, not just the API level.

---

## What I'm Working On

**Right now:**
- Preparing for the **ICA** (Istio Certified Associate) — moving past gateway-only usage into full mTLS, traffic policies, and observability
- Running a **production-grade homelab** on a single Dell OptiPlex 7020 MFF — RKE2, ArgoCD, Istio, Longhorn, Vault, Datadog — [see the full stack →](/homelab/)
- Planning **GitLab CE on Proxmox LXC** — moving my source of truth off GitHub and onto self-hosted infrastructure

**Learning arc (2025–2026):**

The next 8 phases in order: eBPF → SPIFFE/SPIRE → Tetragon → Sigstore → OPA/Gatekeeper → Crossplane → Cluster API → WASM runtimes. [See the full roadmap →](/roadmap/)
