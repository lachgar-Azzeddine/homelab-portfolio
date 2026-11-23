# azzhomelab.tech

My website. It runs on an energy budget of 30 mWh a day: every visit spends a little of it, the whole site dims as the day's energy runs down, and when it is spent the site sleeps until midnight UTC.

## How it is built

- **Astro**, static output, no client framework. The only scripts are the energy meter and the "play a day" demo.
- **Content** lives in `src/content/writing/*.md` (articles) and `src/lib/site.ts` (journey, work, resume). The resume page and `resume.pdf` are generated from the same data.
- **Energy**: `src/lib/energy.ts` reads `/api/energy` and sets one CSS variable, `--energy`, from 1 (full) to 0 (spent). Everything visual derives from it.
- **Image**: `nginx-unprivileged` serving `dist/`, built, signed with cosign (keyless) and given SLSA build provenance in CI.

## Write an article

Add `src/content/writing/<slug>.md`:

```markdown
---
title: "The title"
description: "One or two sentences for lists and previews."
date: "2026-11-23"
tags: [kubernetes, debugging]
---

The article, in Markdown.
```

## Run it

```sh
npm ci
npm run dev        # http://localhost:4321
npm run build      # dist/
node scripts/resume-pdf.mjs   # dist/resume.pdf (needs: npx playwright install chromium)
```

Node 22 or newer.
