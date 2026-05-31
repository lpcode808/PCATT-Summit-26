# PCATT Summit 2026 Handoff

## Current State

This is a standalone, single-file attendee guide for PCATT Summit 2026. It began as a fork of an earlier conference app (KSEDTECH / CONNECT26), but that inheritance has now been removed: all KSEDTECH/CONNECT26 assets, branding, and dead marketing-site files are gone, and the app is fully PCATT.

Schedule and speaker data come from the official PCATT Summit 2026 schedule page:

- Source URL: `https://pcatt.org/summit26-schedule/`
- Raw capture: `scraped/summit26-schedule.html`
- Structured data: `scraped/summit26-schedule.json`

## What Was Done (UX follow-up pass)

A second review focused on general UX logic and the first-time/new-user path. Two gaps fixed:

- **Schedule empty state.** `renderSchedule()` previously set `scheduleList.innerHTML` to the joined card markup with no guard, so a search (or strand filter) that matched nothing painted a completely blank area — no feedback. The `.strand-empty-msg` style existed but was never wired up. Now an empty result renders a clear message ("No sessions match **<query>**…") with a recovery hint, matching the existing Speakers/Notes empty states.
- **Export button gated when empty.** A brand-new user with zero notes could click **Export ↓** and open a sheet containing the literal "No notes saved yet." text. `updateNotesActionState()` now disables Export alongside Clear All when the note count is 0; added the missing `.export-btn:disabled` style and scoped its hover to `:not(:disabled)`. Import stays enabled (a returning user may import on a fresh device).

## What Was Done (persona UX-audit pass)

Ran a three-persona review (a busy mobile attendee, a low-vision presenter using a screen reader, and a technical attendee), then implemented the fixes everyone agreed were clear wins:

- **Killed placeholder leakage.** Added `isPlaceholderText()` so schedule cards no longer render the literal "Description TBD." body text (7 sessions) or the "9:30 AM – TBD" end-time range (all 36 entries showed it because `"TBD"` is truthy). Cards now show start time only until real end times land.
- **Day grouping.** The schedule list now emits a "Thursday, June 4, 2026" / "Friday, June 5, 2026" heading at each day boundary instead of one undifferentiated flat list.
- **Modal accessibility.** `openModal`/`closeModal` now move focus into the dialog and restore it on close; a global handler adds Escape-to-close and Tab focus-trapping; backdrop clicks close any modal (previously only the QR modal). Added `aria-label`s to the two confirm inputs, `aria-labelledby` linking each tabpanel to its tab, and `id`s on the tab buttons.
- **QR fallback.** The external QR `<img>` now has an `onerror` handler that reveals a "couldn’t load — use this link" fallback instead of a silent broken image when offline.
- **Real PWA.** Added `manifest.json`, `apple-touch-icon`, and Apple/mobile web-app meta tags so the "installable PWA" claim actually holds; service worker precaches the manifest and was bumped to `v4`.
- **Cleanup.** Renamed the misleadingly-named `--teal` CSS variable (its value is rose `#ff5c8a`) to `--rose` throughout, and nudged `--text-dim` from 0.38→0.5 opacity for low-vision legibility.

Deliberately left alone (would require inventing data or heavy infra): real room locations for registration/meals, real speaker affiliations (some still read "PCATT Summit 2026"), and self-hosting the Google Fonts for true offline typography.

## What Was Done (earlier pass)

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
