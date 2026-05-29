# PCATT Summit 2026 Guide

Static attendee guide forked from the KSEDTECH conference app and adapted for PCATT Summit 2026.

## What It Does

- Mobile-first schedule guide for PCATT Summit 2026
- Searchable schedule from the official PCATT schedule page
- Strand/track filters for Trust in AI, Future of Work, Public/Social Interest in AI, and Mechanics of AI
- Speaker list generated from extracted session presenters
- Local notes, starred speakers, export/import, and QR sharing from the original guide app

## Source

Primary source: [https://pcatt.org/summit26-schedule/](https://pcatt.org/summit26-schedule/)

Captured files:

- `scraped/summit26-schedule.html` - raw fetched page
- `scraped/summit26-schedule.json` - structured extract with source URL and fetch timestamp

The extractor currently captures the official Elementor tooltip session cards. It produced 26 scheduled/keynote/breakout entries from the page on 2026-05-29.

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

`npm test` reruns the extractor, regenerates the app data in both app copies, checks `script.js` syntax, and runs the static smoke test.

## Project Map

- `index.html` - primary guide app
- `conference-skeleton-export/index.html` - copied app shell kept in sync for now
- `scripts/extract-pcatt-schedule.mjs` - reproducible scrape parser
- `scripts/update-pcatt-app.mjs` - injects schedule/speaker data into the app
- `scripts/static-smoke.mjs` - no-dependency regression check
- `scraped/` - raw and structured PCATT source data

## Known Limitations

- The first pass keeps the KSEDTECH app structure and much of its visual shell.
- General schedule blocks such as registration, breakfast, lunch, and networking are visible in the raw page but are not yet extracted into `SCHEDULE`; only session/keynote cards are captured.
- Several official descriptions are still `TBA` or focus-only blurbs; those are preserved as-is.
- Speaker affiliations are not reliably separated from names in the current extractor.
