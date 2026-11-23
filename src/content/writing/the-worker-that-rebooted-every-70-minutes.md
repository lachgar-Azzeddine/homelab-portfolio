---
title: "The worker that rebooted every 70 minutes"
description: "A Talos worker joined a Kamaji control plane, ran pods for 70 minutes, then rebooted, forever. The cause was a certificate nobody could issue, and the fix became kamaji-trustd."
date: "2026-11-22"
tags: [talos, kamaji, debugging]
---

Kamaji runs Kubernetes control planes as pods: each tenant gets its own API server, scheduler and controller manager, hosted in a management cluster. Workers can be anything that speaks the kubelet protocol. I wanted them to be Talos Linux, an immutable OS with no shell and an API instead of SSH.

It almost worked. The worker joined, became Ready, ran pods. Then, about 70 minutes after boot, it rebooted. It came back, joined, ran pods, and rebooted again 70 minutes later.

## Exactly 70 minutes

A period that regular is never a resource problem. Memory leaks and full disks don't keep time. Something was waiting for something, and giving up on a timer.

Talos keeps a boot sequence, and the worker's never finished. Kubelet was up, so Kubernetes was happy, but Talos itself was still waiting on one step: its own API daemon, `apid`.

## What apid waits for

`apid` is how you talk to a Talos node. It serves mutual TLS, so it needs a certificate. A Talos worker does not mint its own. It sends a certificate signing request to **trustd**, a small service on the Talos control-plane nodes, on port 50001 at the cluster endpoint. trustd checks the worker's token and signs the request with the cluster's OS certificate authority.

A Kamaji control plane is not made of Talos nodes. It is an API server in a pod. There is no trustd behind port 50001, so the request goes nowhere and the worker retries.

The last piece was in Talos' source, in `pkg/machinery/constants`:

```go
// BootTimeout is the timeout to run all services.
BootTimeout = 70 * time.Minute
```

After 70 minutes of an unfinished boot, Talos declares the boot failed and reboots. So every worker would run fine for exactly that long, then start over.

## kamaji-trustd

The missing piece is small, so I wrote it: [kamaji-trustd](https://github.com/lachgar-Azzeddine/kamaji-trustd) implements trustd's one gRPC method, `Certificate`, and nothing else.

- It checks the token the worker presents, with a constant-time comparison against the cluster's trustd token.
- It signs the CSR with the tenant's OS CA, server-auth only, short-lived, and strips any organisation the request tries to claim.
- It returns the CA so the worker can trust its peers.

It runs as an extra container inside the tenant's control-plane pod, because Kamaji lets a TenantControlPlane declare additional containers, volumes and service ports. Port 50001 on the tenant's endpoint now leads somewhere. The CA key and token live in a Secret next to the control plane, never in Git.

One detail cost me an evening: a Talos worker builds its CSR with the same key type as the CA, and the OS CA is Ed25519. My first test used an ECDSA CSR and failed with a signature-algorithm mismatch that real workers would never hit. The test now builds its CSR the same way Talos does.

## Result

The worker's boot sequence now completes in 28 seconds, with `apid` running and serving its own certificate. After 75 minutes the worker was still up, and it has not rebooted since.

## What I took from it

- **A regular period points at a timeout.** Search the source for the number before searching the logs for an error.
- **"Ready" in Kubernetes is not "booted" in the OS.** Both layers have their own idea of healthy, and the gap between them can hide a loop for a long time.
- **When an integration is missing one small piece, write the piece.** It is under 300 lines of Go, plus tests, and it turned an unsupported combination into one that works.
