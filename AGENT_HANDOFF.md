# PCATT Summit 2026 Handoff

## Current State

This repo is an initial fork of `/Users/justinlai/Coding/KSEDTECH-2026` into `/Users/justinlai/Coding/PCATT-Summit-26`.

The KSEDTECH guide app shell remains, but the primary schedule and speaker data now come from the official PCATT Summit 2026 schedule page:

- Source URL: `https://pcatt.org/summit26-schedule/`
- Raw capture: `scraped/summit26-schedule.html`
- Structured data: `scraped/summit26-schedule.json`

## What Changed

- Removed the copied KSEDTECH `.git` directory.
- Added `scripts/extract-pcatt-schedule.mjs`.
- Added `scripts/update-pcatt-app.mjs`.
- Replaced embedded `SCHEDULE` and `SPEAKERS` constants in:
  - `index.html`
  - `conference-skeleton-export/index.html`
- Renamed storage keys and UI labels from CONNECT26 to PCATT Summit 2026.
- Rewrote `scripts/static-smoke.mjs` for the current app surface.
- Updated `README.md` and `package.json`.

## Data Notes

The official PCATT page is WordPress/Elementor HTML. The most useful schedule data is embedded in `.topic-tooltip` cards with a visible trigger and a hidden detail box. The extractor currently captures those cards and associates them with the nearest preceding date/time marker.

Captured count on 2026-05-29: 26 entries.

Not yet captured:

- Registration / breakfast / networking blocks
- Lunch blocks and lunch panels outside tooltip cards
- PCATT 25 years Time Capsule Gallery all-day block
- Clean affiliation fields for every presenter

Do not invent missing details. Keep official `TBA` values as `TBA`.

## Verification

Run:

```sh
npm test
```

Current expected result:

```text
Static smoke test passed.
```

## Best Next Moves

- Extend the extractor to include non-tooltip agenda blocks so the day feels complete.
- Do a visual pass and retheme away from the inherited CONNECT26/KSEDTECH look toward PCATT branding.
- Decide whether to keep both root `index.html` and `conference-skeleton-export/index.html`; for now they are synced by script.
- Initialize git and add a `.gitignore` when Justin is ready to treat this as its own repo.
