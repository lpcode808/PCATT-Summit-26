# PCATT Summit 2026 — Conference Guide

**Live guide → [lpcode808.github.io/PCATT-Summit-26](https://lpcode808.github.io/PCATT-Summit-26/)**

---

## The Vibe

This app was built the same way it teaches: through vibe coding.

Vibe coding is AI-assisted rapid prototyping — you describe what you want, iterate fast, and ship something real. No sprawling setup, no framework churn. Just a clear intention, a capable AI, and a willingness to follow the thread wherever it leads. The result is this guide: a mobile-first, offline-capable PWA that went from zero to deployed in a single session.

The app is both the artifact and the argument. If you're attending Gabriel Yanagihara's *AI 101 Vibe Coding: Build and Launch Your Own Projects* session, this is what that looks like in production.

---

## The Lineage

This is the third mod of the same core idea.

**East Meets West** built the original conference guide shell — a clean, static app designed to get out of the way and let attendees focus on the schedule.

**KS EdTech** (Kamehameha Schools, CONNECT26) adapted that shell for their June 2026 technology conference. Same bones, different branding, new data pipeline.

**PCATT Summit 26** is this repo — another adaptation, pointed at the [Pacific Center for Advanced Technology Training](https://pcatt.org) summit at the Ala Moana Hotel, June 4–5, 2026. Each mod has been a quick fork: swap the data, rewrite the labels, keep what works.

The point isn't the code. The point is that the same lightweight approach — vibe-coded, forked, adapted — scales across conferences, communities, and contexts.

---

## What It Does

- Browse and search 26 sessions across four AI-focused tracks
- Filter by strand: Trust in AI · Future of Work · Public/Social Interest in AI · Mechanics of AI
- Read speaker bios pulled from the official PCATT schedule
- Take personal notes and star sessions (saved locally, no account needed)
- Share via QR code or just the link above
- Works offline once loaded (service worker)

---

## Run It Locally

```sh
npm run serve
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173).

## Refresh the Schedule Data

```sh
curl -L https://pcatt.org/summit26-schedule/ -o scraped/summit26-schedule.html
npm test
```

`npm test` re-runs the extractor, injects fresh session and speaker data into the app, checks syntax, and runs a smoke test.

---

## Project Map

```
index.html                          main guide app
scripts/extract-pcatt-schedule.mjs  parses official PCATT HTML → JSON
scripts/update-pcatt-app.mjs        injects schedule/speaker data into HTML
scripts/static-smoke.mjs            lightweight regression check
scraped/summit26-schedule.html      raw page capture
scraped/summit26-schedule.json      structured session extract (26 entries)
```

---

## Stack

No framework. No build step. Vanilla HTML, CSS, and JavaScript — extracted data piped in via Node.js scripts, served as static files. The whole thing deploys to GitHub Pages with a push.

That's the vibe.
