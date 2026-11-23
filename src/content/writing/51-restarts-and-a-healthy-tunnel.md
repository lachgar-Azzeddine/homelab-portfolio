---
title: "51 restarts and a healthy tunnel"
description: "A Cloudflare tunnel looked healthy while its pod crash-looped. The liveness probe and the binary were talking to different ports."
date: "2026-04-12"
tags: [kubernetes, probes, debugging]
---

I deployed `cloudflared` through Argo CD and it went straight into CrashLoopBackOff. By the time I looked, it had restarted 51 times.

```
NAME                          READY   STATUS             RESTARTS
cloudflared-7d9f8c-xkq2p      0/1     CrashLoopBackOff   51
```

The strange part: Cloudflare's dashboard showed the tunnel as healthy, with active connectors. The tunnel was fine. The pod was not.

## How I found it

The previous container's logs, and the pod's events, said the same thing: the liveness probe was failing.

```bash
kubectl logs -n cloudflared cloudflared-7d9f8c-xkq2p --previous
```

The probe checked `:2000/ready`. But `cloudflared` does not serve its metrics on 2000 by default. Unless told otherwise, it binds its metrics server to a random port, in this case 20241. Every 30 seconds the probe found nothing, declared the container dead, and Kubernetes restarted it.

The dashboard looked healthy because each new pod connected the tunnel within seconds, before the first liveness check. Then it was killed and reconnected, over and over. From the outside, a tunnel that keeps reconnecting looks like a tunnel that is up.

## The fix

Make the binary listen where the probe looks:

```yaml
args:
  - tunnel
  - --no-autoupdate
  - --metrics
  - 0.0.0.0:2000
  - run
```

The pod stabilised immediately, and the restart count stopped at 51.

## What I took from it

When a pod crash-loops but the service it provides looks healthy, check the probe before the application. The probe and the app have to agree on what healthy means and where to ask. Verify probe targets against what the binary actually does, not against what you assume its defaults are.
