---
title: "Incidents"
layout: "single"
url: "/incidents/"
summary: "Real post-mortems from operating a production-grade homelab — what broke, how I found it, and what I changed."
showToc: true
---

Every serious infrastructure breaks. What separates someone who operates infrastructure from someone who just installs it is what happens after it breaks — how fast you find the root cause, how precisely you fix it, and whether you document it so it never surprises you again.

These are real incidents from building and running this homelab. No simulated failures.

---

## INC-001 — Cloudflare Tunnel in CrashLoopBackOff (51 restarts)

**Date:** During initial cluster build  
**Duration:** ~2 hours  
**Impact:** Portfolio and all public-facing services unreachable  
**Layer:** Pod / container lifecycle

### What happened

Deployed the `cloudflared` pod via ArgoCD. Immediately entered CrashLoopBackOff. By the time I noticed, the restart count was at 51.

```
NAME                          READY   STATUS             RESTARTS
cloudflared-7d9f8c-xkq2p      0/1     CrashLoopBackOff   51
```

The tunnel itself showed as healthy in the Cloudflare dashboard. Active connectors, green status. The pod was the problem, not the tunnel.

### How I found it

```bash
kubectl logs -n cloudflared cloudflared-7d9f8c-xkq2p --previous
```

Liveness probe was failing. The probe was checking port `2000` — but `cloudflared` was serving its metrics endpoint on a random port (`20241`). Every 30 seconds, the probe declared the container dead and Kubernetes restarted it.

The Cloudflare dashboard showed healthy because the tunnel managed to establish a connection in the brief window before the first liveness check fired. Then the pod died and re-established, over and over.

### Root cause

The liveness probe in the deployment manifest checked `:2000/ready`. The `cloudflared` binary defaults to a random port for its metrics server unless explicitly told otherwise. The probe and the binary were never talking to the same port.

### Fix

Added `--metrics 0.0.0.0:2000` to the container args — forces cloudflared to bind its metrics server to the expected port:

```yaml
args:
  - tunnel
  - --no-autoupdate
  - --metrics
  - 0.0.0.0:2000
  - run
```

Pod stabilized immediately. Restart count stopped at 51.

### What I learned

When a pod is crash-looping but the external service looks healthy, the liveness probe is the first thing to check — not the application. The probe and the app have to agree on what "healthy" means and where to find it. Always verify probe targets against actual binary behavior, not assumed defaults.

---

## INC-002 — ArgoCD Redirect Loop (307) Through Istio Gateway

**Date:** During Istio integration  
**Duration:** ~3 hours  
**Impact:** ArgoCD UI completely inaccessible via browser  
**Layer:** Ingress / TLS termination

### What happened

Istio was deployed. ArgoCD VirtualService was configured. Navigating to `argocd.azzhomelab.tech` produced an immediate redirect loop — the browser reported "page isn't redirecting properly" and refused to load.

HTTP traffic was reaching the cluster. The Istio gateway was accepting connections. ArgoCD pods were running fine. But the browser couldn't display a single page.

### How I found it

Traced the request manually:

```bash
curl -vk https://argocd.azzhomelab.tech
```

The response chain was:
1. Cloudflare receives HTTPS request
2. Cloudflare Tunnel forwards to `argocd-server` as HTTP (port 80)
3. `argocd-server` receives HTTP and issues a `307 Temporary Redirect` → HTTPS
4. The redirect goes back to Cloudflare
5. Cloudflare forwards as HTTP again
6. Loop

ArgoCD's server has an internal policy: if it receives a plain HTTP request, it redirects to HTTPS. It has no way to know that TLS was already terminated upstream by Cloudflare. It sees HTTP and assumes the client needs to be upgraded.

### Root cause

Two TLS termination layers in conflict:
- Cloudflare terminates external TLS and forwards HTTP to the origin
- ArgoCD assumes any HTTP connection must be redirected to HTTPS

The fix had to break the assumption — tell ArgoCD it's already behind a TLS-terminating proxy and should serve HTTP without redirecting.

### Fix

Added `server.insecure: "true"` to the `argocd-cmd-params-cm` ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmd-params-cm
  namespace: argocd
data:
  server.insecure: "true"
```

This puts ArgoCD into insecure mode — it stops issuing 307 redirects and serves HTTP directly. TLS is handled upstream by Cloudflare. ArgoCD doesn't need to know about it.

### What I learned

When you have multiple layers of TLS handling in the request path, each layer needs to be explicitly aware of what the others are doing. The failure mode is subtle: everything looks healthy (tunnel up, gateway up, pods up) but the end-to-end request fails. Working backwards from the HTTP response code (`307`) and following the redirect chain manually was the only way to see the loop.

This is also why the dual ingress architecture (Cloudflare for public, Istio for private) exists — mixing the two paths in a single request creates exactly this kind of layered TLS conflict.

---

## INC-003 — MetalLB Permanently OutOfSync in ArgoCD

**Date:** Post-deployment, noticed during routine status check  
**Duration:** Ongoing cosmetic issue (~1 day to diagnose)  
**Impact:** No service impact — MetalLB functioned normally throughout  
**Layer:** Kubernetes API / GitOps

### What happened

`argocd app list` showed MetalLB as `OutOfSync` despite no changes to the manifests. Every manual sync succeeded briefly, then flipped back to `OutOfSync` within minutes. The L2 advertisement was working, VIPs were being assigned, all services were reachable.

```
NAME      SYNC STATUS   HEALTH STATUS
metallb   OutOfSync     Healthy
```

ArgoCD was reporting a diff, but diffing the live state against the Git manifests showed nothing meaningful.

### How I found it

Ran the ArgoCD diff with verbose output:

```bash
argocd app diff metallb --refresh
```

The diff was entirely in the `metadata.annotations` field of the MetalLB CRDs — specifically `kubectl.kubernetes.io/last-applied-configuration`. That annotation stores the previous configuration as a JSON string for three-way merge purposes. For MetalLB's CRDs, that JSON string exceeded **256KB** — Kubernetes's hard limit for annotation values.

When ArgoCD tried to store the last-applied state, Kubernetes truncated or rejected the annotation. ArgoCD then saw a discrepancy between what it thought it had applied and what was in the cluster, and reported OutOfSync.

### Root cause

Kubernetes stores the full previous resource configuration in an annotation for diff purposes. MetalLB's CRDs are large enough that this annotation exceeds the 262,144 byte limit. The annotation can't be stored, so the three-way merge can never fully reconcile.

### Fix

Two steps:

**1. Remove the oversized annotation from the affected CRDs:**

```bash
kubectl annotate crd bgppeers.metallb.io \
  kubectl.kubernetes.io/last-applied-configuration-
```

**2. Enable Server-Side Apply in the ArgoCD Application** so Kubernetes manages the merge server-side instead of storing it in annotations:

```yaml
syncPolicy:
  syncOptions:
    - ServerSideApply=true
```

MetalLB has been `Synced` since. The underlying issue — CRD size — is a known Kubernetes limitation. Server-Side Apply is the correct long-term solution for any large CRD managed by GitOps.

### What I learned

`OutOfSync` in ArgoCD doesn't always mean your manifests are wrong. Sometimes it means the GitOps machinery itself (three-way merge via annotations) has hit a platform limit. When a sync succeeds but immediately reverts, the problem is in the reconciliation mechanism, not the resource definition. Server-Side Apply should be the default for any CRD-heavy application managed by ArgoCD.

---

*More incidents will be added as they happen. The cluster is still running.*
