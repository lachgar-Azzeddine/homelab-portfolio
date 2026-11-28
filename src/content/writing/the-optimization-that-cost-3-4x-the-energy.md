---
title: "The optimization that cost 3.4x the energy"
description: "Turning on gzip made my pages three times smaller. An energy gate in my release pipeline measured the cost per request, rejected it at 3.37x, and the version nobody would have questioned never reached a visitor."
date: "2026-11-28"
tags: [energy, releases, performance]
---

Every new version of this site has to pass an energy gate before a visitor sees it. The gate starts the old version and the new one side by side, sends both the same traffic, and compares the CPU each one burned. On the machine that runs it, energy is power times CPU share, so the CPU ratio is the energy ratio. Above 1.10, the release is rejected.

The first real change I sent through it was one I was sure would pass: compression.

## The obvious win

The pages went out uncompressed. Turning on gzip in the web server, at the highest level, is a one-line change that every performance checklist recommends. Fewer bytes on the wire, faster pages, less network. It looked like a free improvement.

The gate rejected it. The new version used **3.37 times** the CPU per request of the old one.

## Why

Without compression, serving a static page is almost free: the server hands a file from the page cache to the socket and barely touches it. With compression on the fly, every request compresses the same page again, and level 9 is the most expensive level for a few percent fewer bytes than the default. The work wasn't wrong, it was repeated. Thousands of requests, thousands of identical compressions of files that never change.

Smaller responses were real. They were also the only thing I would have measured without the gate, and they made the change look like a win.

## Compress once

The pages are static, so the compression only needs to happen once: at build time. A small script after the build writes a gzipped copy next to each HTML, CSS, JS, XML and SVG file, at level 9, and only keeps it when it is smaller. The web server's `gzip_static` then sends the precompressed file to clients that accept gzip, with no work per request.

Same bytes on the wire: the site's pages, styles and feeds went from 129 KiB to 42 KiB. The gate measured **1.03**: inside the noise, passed, promoted.

The level 9 cost didn't disappear. It moved to the build, where it is paid once per release instead of once per request.

## Is the gate measuring anything?

A ratio is only useful if I know how much it moves on its own. Before trusting it, I ran the same image against itself three times. The ratios came out 0.917, 0.948 and 0.971, over about 4,900 requests per pod each, with no errors.

That told me two things:

- **The noise is a few percent.** The gate catches regressions above roughly 10-15 %. It would not catch a 5 % one, and I don't pretend it does.
- **Order matters.** In the first A/A runs every ratio was below 1, because the same pod always got each page first. Alternating who is asked first removed the bias.

Building it took a few failed runs too. Curl's `-o` applies to one URL only, so the first run counted page bodies as errors. Another run started the load in the same second the pods were created and measured connection refusals. Both failed closed: the release stopped, which is what a gate is for.

## What I took from it

- **An optimization is a trade, and you only see the side you measure.** I would have measured bytes and called it done.
- **Cost per request is a release property, like latency or errors.** It belongs in the same check that decides whether a version ships.
- **Static work should be done once.** Anything computed identically on every request is a build step waiting to happen.

The rejected version was the one I would have shipped without a second thought. That is the case a gate exists for.
