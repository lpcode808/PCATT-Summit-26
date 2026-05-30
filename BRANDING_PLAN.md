# PCATT Branding / Color Plan

Status: **NOT STARTED.** The app's visual theme is still inherited from the
KSEdTech (CONNECT26) fork. A prior pass nudged a single accent toward pink, but
the base theme, CSS variable names, strand colors, favicon, and `theme-color`
are all still KSEdTech. This document is the spec for a fresh session to
implement. No code changes have been made for branding yet.

---

## 1. Current state (what's actually there)

- **Dark navy base theme**, not PCATT. `--bg: #06226b`, surfaces in the
  `#12347d`/`#1d418a` blue family (`index.html` `:root`, ~lines 22–41).
- **KSEdTech variable names** still in use: `--orange` (which confusingly holds
  a *pink* `#ff5a8a`), `--teal` (44 uses), `--lime` (16 uses). Renaming these is
  part of the job, not just revaluing.
- **Strand colors don't match PCATT.** Chips are generated as
  `strand-${slug}` (`index.html:3629`), so PCATT strands need classes like
  `strand-trust-in-ai`, `strand-ai-and-the-future-of-work`,
  `strand-public-social-interest-in-ai`, `strand-mechanics-of-ai`,
  `strand-keynote-speaker`. But the CSS only defines the **old KSEdTech**
  strands: `strand-culture`, `strand-transformation`, `strand-well-being`,
  `strand-advocacy`, `strand-agency` (`index.html` ~lines 710–714). Result:
  **every PCATT strand chip currently falls back to default — no color.**
- **Secondary bug:** the schedule-card strand chip uses
  `strand-${s.strand.toLowerCase()}` (`index.html:3678`) which keeps the spaces
  (`strand-trust in ai`) and is an invalid class. It should use the same
  `slugify()` the filter buttons use (`index.html:3629`). Fix while you're in
  there.
- **Badge classes** (`index.html` ~lines 623–637) reference KSEdTech session
  types that PCATT data never emits (`fireside`, `pitch`, `roundtable`,
  `mindfulness`, `ceremony`). PCATT's actual `type` values are: `keynote`,
  `breakout`, `panel`, `meal`, `networking`, `welcome`, `background`. Dead
  classes are harmless but should be pruned/retargeted for clarity.
- **Favicon** (`favicon.svg`) is a teal→navy→pink gradient
  (`#43a6c9 → #003571 → #d6336c`) — matches neither KSEdTech nor PCATT.
- **`theme-color` meta** is `#06226b` navy (`index.html:18`).
- **Fonts:** Sen + Manrope (Google Fonts, `index.html:19`). Not PCATT-specific
  but inoffensive; treat as optional (see §6).
- KSEdTech *text* only survives in `README.md` and `AGENT_HANDOFF.md` as
  intentional lineage notes — leave those.

---

## 2. PCATT brand palette (source of truth)

Extracted from PCATT's own site CSS in `scraped/summit26-schedule.html`
(hex frequency counts):

| Hex        | Role on pcatt.org            | Notes                          |
|------------|------------------------------|--------------------------------|
| `#ff4e80`  | Primary rose/pink (dominant) | The signature PCATT accent     |
| `#fd2864`  | Bright pink-red              | Hover/active accent variant    |
| `#ae103a`  | Crimson                      | Deeper accent / headings       |
| `#b10938`  | Deep crimson/maroon          | Darkest accent                 |
| `#ffffff`  | Page base                    | PCATT's site is light/white    |
| `#000000`  | Text                         | Near-black body text           |

Brand logo assets (white logo, for reference / possible header use):
- `https://pcatt.org/wp-content/uploads/2024/10/PCATT-LOGO_New_White.png`
- `https://pcatt.org/wp-content/uploads/2024/10/cropped-PCATT-LOGO_FaviconNew.png`
- `https://pcatt.org/wp-content/uploads/2025/10/PCATT-SUMMIT-2026_header-copy-1.png`

Note: the environment blocks outbound fetches to pcatt.org (HTTP 403). Work
from the scraped capture, or have the implementer pull the logo locally if a
real logo/favicon is wanted.

---

## 3. KEY DECISION — light vs. dark (resolve this first)

PCATT's website is **light** (white base, rose/crimson accents). The app is
currently **dark**. Pick one before touching tokens:

- **Option A — Light theme to mirror pcatt.org (recommended for "on-brand").**
  White/very-light surfaces, near-black text, `#ff4e80` primary, `#ae103a`
  crimson for emphasis. Biggest visual change; most faithful to PCATT.
- **Option B — Keep dark, swap accents to PCATT rose/crimson.** Far smaller
  diff: retire the blue/teal/lime, drive everything from `#ff4e80` +
  crimson + neutral grays on the existing dark base. Reads as a modern dark
  companion app "in PCATT colors" but won't match the website's look.

The token values in §4 are written for **Option A**. If Option B is chosen,
keep the dark `--bg`/surfaces and only apply the accent/strand/badge rows.

---

## 4. Proposed `:root` tokens (Option A — light)

Replace the KSEdTech-named vars with semantic names and PCATT values
(`index.html` ~lines 22–41). Keep old names as aliases only if a full
find/replace of 60+ usages is out of scope this pass.

```css
:root {
  /* base */
  --bg: #ffffff;
  --surface: #fff5f8;          /* faint rose-tinted card */
  --surface-elevated: #ffffff;
  --surface-input: #fdf0f4;

  /* brand accents */
  --primary: #ff4e80;          /* PCATT rose */
  --primary-strong: #fd2864;   /* hover/active */
  --crimson: #ae103a;          /* emphasis / headings */
  --crimson-deep: #b10938;

  /* neutrals / text */
  --text: #1a1014;
  --text-muted: rgba(26, 16, 20, 0.62);
  --text-dim: rgba(26, 16, 20, 0.40);
  --border: rgba(26, 16, 20, 0.12);
  --border-active: rgba(255, 78, 128, 0.55);

  /* dims for chip backgrounds */
  --primary-dim: rgba(255, 78, 128, 0.12);
  --crimson-dim: rgba(174, 16, 58, 0.12);

  --radius: 12px;
  --radius-sm: 8px;
  --font-display: 'Sen', sans-serif;
  --font-body: 'Manrope', sans-serif;
}
```

Then sweep the file for `var(--orange|--teal|--lime|--orange-dim|--teal-dim|--lime-dim)`
(67 total uses) and repoint to the new tokens. The dark-only literals scattered
in rules (e.g. `#6aabdf`, `#ff8fb0`, `rgba(0,53,113,…)`) also need updating —
search for `rgba(0, 53, 113` and the blue hexes.

---

## 5. Strand & badge color mapping

### Strands (define real PCATT classes; delete the KSEdTech ones)
Replace `index.html` ~lines 710–714 with classes keyed to PCATT strand slugs.
Suggested distinct-but-on-family palette (all derived from rose→crimson plus
two neutrals so the four tracks stay legible):

```css
.strand-keynote-speaker          { background: var(--primary-dim);  color: var(--crimson-deep); }
.strand-trust-in-ai              { background: rgba(255, 78, 128, 0.16); color: #ae103a; }
.strand-ai-and-the-future-of-work{ background: rgba(253, 40, 100, 0.14); color: #b10938; }
.strand-public-social-interest-in-ai { background: rgba(174, 16, 58, 0.12); color: #8c0c2e; }
.strand-mechanics-of-ai          { background: rgba(26, 16, 20, 0.06);   color: #4f4f4f; }
```
(If you prefer four clearly different hues instead of a rose monochrome ramp,
that's a design call — just keep keynote = rose and ensure WCAG-AA contrast on
the chosen base.)

**Also fix `index.html:3678`** to use the slug, matching `:3629`:
```js
// from: strand-${esc(s.strand.toLowerCase())}
// to:   strand-${esc(slugify(s.strand))}
```

### Badges (`index.html` ~lines 623–637)
Keep only the types PCATT emits and recolor to the new palette:
`badge-keynote`, `badge-breakout`, `badge-panel`, `badge-meal`,
`badge-networking`, `badge-welcome`, `badge-background`. Point keynote/panel at
the rose/crimson accents, meals/background at neutral grays. Delete
`badge-fireside`, `badge-pitch`, `badge-roundtable`, `badge-mindfulness`,
`badge-ceremony`, `badge-presentation`, `badge-announcement` (unused).

### Notes accents (`index.html` ~lines 1304–1347)
These `--note-accent*` variants are teal/orange/lime. Repoint to
rose/crimson/neutral so the notes tab matches.

---

## 6. Favicon, theme-color, fonts

- **`favicon.svg`:** redo the gradient in PCATT rose→crimson
  (`#ff4e80 → #ae103a`), drop the teal/navy stops. Keep the `>` prompt glyph
  (it ties to the "vibe coding" story) but recolor the cursor block to white or
  light rose. Alternatively, base it on the real PCATT favicon PNG listed in §2.
- **`theme-color` meta (`index.html:18`):** set to `#ff4e80` (or `#ffffff` for
  a light theme with a rose accent bar — match whichever §3 option you pick).
- **Fonts (optional):** Sen/Manrope are fine. Only change if PCATT specifies a
  brand typeface; not required for "on-brand enough."

---

## 7. Cache + verification

- Bump the service-worker cache version in `sw.js` (currently `v2` → `v3`) so
  returning visitors don't get the stale dark theme from cache.
- Run `npm test` — must still print `Static smoke test passed.` (the smoke test
  checks structure/data, not colors, so it should pass unchanged; just confirm
  nothing was broken syntactically).
- Visual check at a mobile width (~414px): schedule cards, strand filter chips
  (all five PCATT strands should now be colored, not default), speaker cards,
  notes tab, badges, header. Verify text contrast on the new base.

---

## 8. Suggested commit boundaries

1. Tokens + global accent sweep (`:root` + var repointing).
2. Strand classes + the `:3678` slug bug.
3. Badge cleanup + note accents.
4. favicon.svg + theme-color + sw.js cache bump.

Keep it on the working branch; don't open a PR unless asked.
