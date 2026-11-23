---
title: "Five namespaces through a quota of two"
description: "Capsule limits how many namespaces a tenant can create. Create five at once and all five get in. Fixing it properly took a ledger, and a long review with the maintainers."
date: "2026-11-23"
tags: [capsule, admission, concurrency]
---

Capsule turns one Kubernetes cluster into many tenants. A tenant can be limited to a number of namespaces:

```yaml
spec:
  namespaceOptions:
    quota: 2
```

Create two namespaces and the third is refused. Create five at the same time and all five are accepted.

## Why

The check runs in an admission webhook. When a namespace is created, the webhook looks at the tenant and asks: does it already have `quota` namespaces?

The count comes from the Tenant's status, and the status is written by Capsule's controller after namespaces exist. Five parallel requests all arrive before any of them has been persisted, so all five read the same count, zero, and all five pass. It is a textbook time-of-check to time-of-use race. The count being checked is not the count being changed.

I wrote a test that fires concurrent creates against a quota of 2. The existing code admitted 5.

## The first fix

To stop the race, admission itself has to take a slot, atomically, before letting the request through. Kubernetes already gives you an atomic primitive: optimistic concurrency. Every object has a `resourceVersion`, and an update based on a stale version fails with a conflict.

So my first version reserved slots on the Tenant itself, in an annotation: read the Tenant, check count plus reservations, add a reservation, update with the version I read. When two requests race, one update wins and the other gets a conflict, re-reads, and sees the slot is gone. Conflicts are the point. They are what serialises the requests.

The test went from 5 admitted to exactly 2.

## The review

The maintainers agreed it was a real bug, and asked for a better home for the state. Their review is the most useful thing I read that week:

- **Don't store mutable accounting in an annotation on the Tenant.** Every reservation would contend with the controller's own Tenant updates. Capsule already has a `QuantityLedger` type for exactly this coordination, so use one per tenant.
- **Use the admission request's UID as the reservation ID**, so a retried request is not counted twice.
- **Dry runs must not write.** `kubectl create --dry-run=server` would otherwise reserve slots, and the webhook must declare `sideEffects: NoneOnDryRun`.
- **Expiry is not absence.** My reservations expired after two minutes. But a namespace can exist while the tenant status is still stale, and once its reservation expires another create could pass. An expired reservation should trigger a check, not free the slot.
- **Refuse when unsure.** A missing or unreadable ledger must deny, never count as free capacity.

That fourth point is the one I keep thinking about. I had treated time as proof that a request was gone. It is not: a request can still be on its way to storage. The only safe release is after an authoritative check that the namespace does not exist, made late enough that the original request can no longer land.

## Where it is now

I posted a design back on the pull request before writing more code: a ledger per tenant owned by the Tenant, reservations keyed by request UID, verification before release, and tests for two webhook replicas, controller lag and ledger loss. The first part is written. The rest follows the maintainers' answers.

The pull request is [projectcapsule/capsule#2317](https://github.com/projectcapsule/capsule/pull/2317).

## What I took from it

- **An admission webhook cannot count without shared, persisted state.** Caches and status fields are always a little behind.
- **Conflicts are a feature.** Optimistic concurrency is the cheapest lock Kubernetes gives you.
- **Post the design before the code** when the reviewers know the system better than you do. It saves a rewrite.
