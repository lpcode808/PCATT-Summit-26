# PCATT Summit 2026 Guide

A mobile-first, offline-capable attendee guide for the PCATT Summit 2026 — built as a single self-contained `index.html` (no build step, no framework).

## What It Does

- Full two-day schedule for PCATT Summit 2026, generated from the official schedule page
- Search across sessions, speakers, strands, and rooms
- Strand/track filters for Trust in AI, AI and the Future of Work, Public/Social Interest in AI, and Mechanics of AI
- Speaker list generated from session presenters and panelists
- Local notes, starred speakers, JSON/Markdown export & import, and QR sharing
- Installable PWA with a service worker for offline use on event day

## Source

Primary source: [https://pcatt.org/summit26-schedule/](https://pcatt.org/summit26-schedule/)

Captured files (raw source data, committed for reproducibility):

- `scraped/summit26-schedule.html` — raw fetched page
- `scraped/summit26-schedule.json` — structured extract with source URL and fetch timestamp

The extractor captures the official Elementor session cards (keynotes + breakout tracks) **and** the surrounding agenda blocks — registration, opening remarks, lunch, lunch panels, the Pau Hana mixer, and the all-day Time Capsule Gallery. As of 2026-05-29 it produces 36 schedule entries (26 session cards + 10 agenda blocks).

## Quick Start

```sh
npm run serve
```

Then open [http://127.0.0.1:4173/](http://127.0.0.1:4173/).

## Refresh Data

```sh
curl -L https://pcatt.org/summit26-schedule/ -o scraped/summit26-schedule.html
npm test
```

`npm test` reruns the extractor, regenerates the embedded schedule/speaker data in `index.html`, and runs the static smoke test.

## Project Map

- `index.html` — the entire app (markup, styles, and logic, with `SCHEDULE`/`SPEAKERS` data injected by the build script)
- `favicon.svg` — app icon
- `sw.js` — service worker (offline cache; bump `CACHE_NAME` when shipping changes)
- `scripts/extract-pcatt-schedule.mjs` — reproducible scrape parser (HTML → JSON)
- `scripts/update-pcatt-app.mjs` — injects schedule/speaker data into `index.html`
- `scripts/static-smoke.mjs` — no-dependency regression check
- `scraped/` — raw and structured PCATT source data

## Known Limitations

- Official session **end times** aren't published, so each card shows its start time (`timeEnd` is `TBD`).
- A few official descriptions are still `TBA` or focus-only blurbs; those are preserved verbatim — the extractor never invents missing details.
- Speaker affiliations are not reliably separated from names, so the speaker list uses a generic "PCATT Summit 2026" company placeholder.
