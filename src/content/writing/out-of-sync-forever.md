---
title: "OutOfSync forever, with nothing to sync"
description: "Argo CD kept reporting a diff on a healthy app. The diff was in an annotation too large for Kubernetes to store."
date: "2026-04-12"
tags: [argocd, gitops, kubernetes]
---

One application in Argo CD showed `OutOfSync` although nothing had changed in Git. A manual sync succeeded, then flipped back to `OutOfSync` within minutes. The app itself worked perfectly.

```
NAME      SYNC STATUS   HEALTH STATUS
metallb   OutOfSync     Healthy
```

## Reading the diff

```bash
argocd app diff metallb --refresh
```

The whole diff sat in `metadata.annotations` of the app's CustomResourceDefinitions, in `kubectl.kubernetes.io/last-applied-configuration`. Client-side apply stores the previous configuration there, as a JSON string, to compute three-way merges.

For these CRDs, that JSON string was larger than 256 KiB, the hard limit for the total size of an object's annotations. The annotation could not be stored as Argo CD expected, so Argo CD always saw a difference between what it believed it had applied and what the cluster held.

## The fix

First, remove the oversized annotation from the affected CRDs:

```bash
kubectl annotate crd bgppeers.metallb.io \
  kubectl.kubernetes.io/last-applied-configuration-
```

Then switch the application to server-side apply, so the API server tracks field ownership itself instead of in an annotation:

```yaml
syncPolicy:
  syncOptions:
    - ServerSideApply=true
```

It has stayed `Synced` since.

## What I took from it

`OutOfSync` does not always mean the manifests are wrong. Sometimes the machinery that computes the diff has hit a platform limit. When a sync succeeds and immediately reverts, look at the reconciliation mechanism, not the resource. For any application with large CRDs, server-side apply should be the default.
