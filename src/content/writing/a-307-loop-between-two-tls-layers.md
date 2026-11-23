---
title: "A 307 loop between two TLS layers"
description: "Argo CD's UI redirected forever. Every component was healthy. Two layers each believed they were responsible for HTTPS."
date: "2026-04-12"
tags: [argocd, tls, ingress]
---

Argo CD was running, its route was configured, and opening the UI in a browser produced "this page isn't redirecting properly". Traffic reached the cluster. The pods were healthy. Not a single page loaded.

## Following the redirect by hand

```bash
curl -vk https://<argocd-host>
```

The chain went like this:

1. Cloudflare receives the HTTPS request and terminates TLS.
2. The tunnel forwards it to `argocd-server` as plain HTTP.
3. `argocd-server` sees HTTP and answers `307 Temporary Redirect` to HTTPS.
4. The browser follows the redirect back to Cloudflare.
5. Cloudflare forwards it as HTTP again. Repeat.

Argo CD's server upgrades any plain HTTP request to HTTPS. It has no way of knowing that TLS was already terminated one hop earlier. It sees HTTP and assumes the client needs upgrading.

## The fix

Tell Argo CD it sits behind a TLS-terminating proxy, so it serves HTTP without redirecting:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmd-params-cm
  namespace: argocd
data:
  server.insecure: "true"
```

The name is alarming, but the meaning is narrow: Argo CD stops doing TLS itself, because the edge already does it.

## What I took from it

With more than one layer handling TLS in a request path, each layer has to know what the others do. The failure is quiet: tunnel up, gateway up, pods up, and the request still fails end to end. The response code, followed by hand, was the only thing that showed the loop.
