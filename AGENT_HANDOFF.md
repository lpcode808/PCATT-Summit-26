# PCATT Summit 2026 Handoff

## Current State

This is a standalone, single-file attendee guide for PCATT Summit 2026. It began as a fork of an earlier conference app (KSEDTECH / CONNECT26), but that inheritance has now been removed: all KSEDTECH/CONNECT26 assets, branding, and dead marketing-site files are gone, and the app is fully PCATT.

Schedule and speaker data come from the official PCATT Summit 2026 schedule page:

- Source URL: `https://pcatt.org/summit26-schedule/`
- Raw capture: `scraped/summit26-schedule.html`
- Structured data: `scraped/summit26-schedule.json`

## What Was Done (this pass)

- **Full agenda extraction.** Rewrote `scripts/extract-pcatt-schedule.mjs` to capture not just the Elementor tooltip session cards but also the non-tooltip agenda blocks: registration/breakfast, opening remarks, lunch, lunch panels (with moderator + panelists), the Pau Hana mixer, and the all-day Time Capsule Gallery. Output grew from 26 → 36 entries, all in chronological document order. No details are invented; `TBA`/`TBD` are preserved.
- **Purged KSEDTECH leftovers.** Deleted the entire `assets/` directory (24 orphaned KS images — logos, KS presenter photos, KS strand icons), the dead `styles.css` and `script.js` (old KS *marketing-site* code, never referenced by the app), and the stale, divergent `conference-skeleton-export/` duplicate.
- **Simplified the build.** `update-pcatt-app.mjs` now targets only `index.html`, uses the extractor's `type` field, and skips presenter-less blocks when building the speaker list. Panelists are now included as speakers (33 total).
- **Visual pass toward PCATT branding.** Aligned the accent palette to PCATT's official rose/pink (`#ff5a8a`) and fixed a leftover inconsistency (orange-tinted backgrounds paired with pink text). Added a proper "Session" badge for breakout cards (was rendering the raw word "breakout"). Tweaked the favicon gradient to match.
- **Refreshed copy + docs.** Updated the schedule-status callout (meals/registration are no longer "still being pulled in"), README, and this handoff. Bumped the service-worker cache to `v2`.

## Verification

`npm test` runs extract → update → static smoke and prints `Static smoke test passed.`

Also verified with a headless render (Playwright, 414px mobile viewport): 36 cards in correct chronological order, badges render correctly (Keynote 2, Session 24, Panel 2, Dining 2, Networking 3, All Day 2, Welcome 1), strand filters work, and the lunch panel expands with moderator/panelists. The only console error is the sandbox blocking the external QR image — not an app bug.

## Best Next Moves

- Add real session **end times** and **speaker affiliations** once PCATT publishes them (extractor preserves `TBD`/placeholder today; `company` is a generic placeholder).
- Consider day-grouping headers (Thursday / Friday) in the schedule list — currently a flat chronological list with each card showing its day in the meta row.
- When the official page changes, re-run the Refresh Data steps in the README and re-run `npm test`.
