---
title: "A stopped VM was billed 2.9 Wh in one minute"
description: "Kepler re-exports a stopped VM's whole counter under a new label. My energy budget read it as fresh energy and put a tenant to sleep for power it never used."
date: "2026-11-22"
tags: [energy, kepler, promql]
---

I run an energy budget per tenant. A controller, [joule-budget](https://github.com/lachgar-Azzeddine/joule-budget), adds up the joules each tenant spends every minute, and when a tenant goes over its daily budget it puts the tenant to sleep: control plane scaled to zero, workloads stopped, worker VMs powered off. When the budget allows again, everything comes back.

The first time it powered a VM off for real, the tenant's usage jumped by 2.9 Wh in a single minute. The tenant had been comfortably inside its 5 Wh day. That one jump pushed it over, and the controller put it to sleep, VM and all, for energy it never used.

## The query

A tenant's VMs are charged with Kepler's per-VM counter. The window is the current day, so the controller asks for the increase since midnight UTC:

```text
sum(increase(kepler_vm_cpu_joules_total{vm_name=~"^(tenant-worker)$", zone="package"}[52800s]))
```

That had worked for days. The number only jumped at the exact minute the VM stopped.

## What Kepler does when a VM stops

I listed the series behind the number, grouped by every label:

```text
count by (vm_name, state) (kepler_vm_cpu_joules_total{vm_name="tenant-worker"})
```

Two series came back. One had `state="running"`. The other, brand new, had `state="terminated"`.

When a VM stops, Kepler does not drop it. It keeps the VM's lifetime total and exports it again under `state="terminated"`. For Kepler that is reasonable: the energy was spent, and a terminated VM is still worth reporting.

For a counter, though, a new label value is a new series. The `terminated` series appears in the middle of my window already holding the VM's entire lifetime total, about 2.9 Wh.

## Why increase() counted all of it

How `increase()` treats a series that starts inside the window depends on the query engine. Prometheus extrapolates from the samples it has. MetricsQL, which my metrics store speaks, counts a series that appears mid-window from zero, so that a freshly started process is not undercounted.

Both choices are defensible for a process that starts counting from zero. Neither is right for a series that is born holding a lifetime total. Mine added the full 2.9 Wh to the day, the budget tipped over, and the controller did exactly what it was built to do: it powered the tenant off, for energy it never used.

## The fix

Charge only the running series:

```text
sum(increase(kepler_vm_cpu_joules_total{vm_name=~"^(tenant-worker)$", zone="package", state="running"}[52800s]))
```

A running VM's energy is complete in the `running` series. The `terminated` one only repeats a total that was already counted while the VM ran. After the fix, the same tenant read 3.64 Wh for the day, matching what it had actually done, and woke up.

## What I took from it

- **A label that describes a lifecycle splits a counter.** Any time a metric has a state-like label, a change of state is a new series, and anything summing increases across states has to decide what that means.
- **Look at the series before the sum.** `count by (every label)` on the raw metric would have shown me the two series in a second. I only ran it after the sum was wrong.
- **Test the action, not just the measurement.** The budget math had unit tests and passed. It took a real power-off to produce the series that broke it.

Kepler's behaviour is a fair design choice, but it is easy to trip over, so it deserves a line in its documentation. That note is on my list.
