# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, no-build, no-backend prototype for "oneMedicare" — a fictional multi-tenant directory
of health/wellness centers — with one center (Skaria Medical Center) built out as a fully
custom-branded standalone profile page. There is no package.json, build tool, bundler, or test
suite. Everything is plain HTML/CSS/vanilla JS served directly from the filesystem or any static
file server (e.g. `python3 -m http.server`).

**`index.html` is the Skaria page**, not the oneMedicare directory home. The domain root is meant
to land visitors on Skaria; the oneMedicare multi-tenant directory homepage lives at
`directory.html` instead. This is a deliberate rename (Skaria swapped places with the former
`index.html`) — don't "fix" it back without checking with the user first.

## Data model — single source of truth

`assets/data.js` defines `window.OM_DATA` (`CATEGORIES`, `VALUE_PROPS`, `CENTERS`,
`PRACTITIONERS`, `TESTIMONIALS`, `PLATFORM_CONTACT`) and is loaded by every page before
`assets/app.js`. There is no API layer — all rendering reads from this in-memory object.
When adding/editing a center, practitioner, or testimonial, edit `data.js` only; the rendering
scripts read `.centerSlug` / `.slug` foreign keys to join `CENTERS`, `PRACTITIONERS`, and
`TESTIMONIALS` together.

## Page/script wiring

Every page loads `assets/data.js` then `assets/app.js`. `app.js` is one large boot routine
(`DOMContentLoaded`) that fans out to page-specific `init*` functions, each of which no-ops if its
root element isn't present on the current page — this is how one shared script serves four
different pages:

- `renderHeader()` / `renderFooter()` — shared oneMedicare chrome, driven by `[data-site-header]` /
  `[data-site-footer]` placeholder elements and a `data-active` attribute for nav highlighting.
  Their "Home" links point to `directory.html`, not `index.html`.
- `initHome()` — `directory.html` (value props, category grid, featured centers, testimonials).
- `initDirectory()` (+ `initCentersLanding()`) — `centers.html` (search, category filter pills,
  querystring sync via `?category=`, the animated 3D hero "orbit" scene).
- `initCenterProfile()` — `center.html?slug=<slug>` generic tabbed profile renderer (offerings,
  services, team, schedule, products, blog, reviews, contact tabs). Reads `?slug=` or
  `data-center-slug` on `#centerProfile`, falls back to the featured center.
- `initOnboard()` — `onboard.html` multi-step form (mocked submission only, nothing is sent to a
  server; state lives in memory and is rendered into a review panel + fake `APP-<ref>` code).

**`index.html` is the exception**: it does not use `initCenterProfile()`. It has its own
standalone renderer, `assets/skaria.js`, loaded after `app.js`, which fully replaces the shared
header/footer content (`[data-site-header]`/`[data-site-footer]`) with Skaria-branded
markup/nav and renders single-page sections with anchor-based scroll-spy navigation
(`#overview #shop #services #team #reviews #journal #contact`) instead of the tab system used by
`center.html`. Centers other than Skaria always go through `center.html?slug=...`; Skaria is
special-cased in `app.js`'s `centerProfileHref()` to always link to `index.html` directly.

## Styling structure

- `assets/styles.css` — base design system for the shared oneMedicare chrome and generic
  `center.html` profile: CSS custom properties in `:root` (`--color-*`, `--font-*`, `--space-*`,
  `--cat-*` per-category accent colors), warm paper/index-card/rubber-stamp aesthetic.
- `assets/centers.css` — page-specific additions for `centers.html`, all rules scoped under
  `#centersPage` so they never leak into other pages.
- `assets/skaria.css` — Skaria's full brand override, scoped under
  `#centerProfile[data-center-slug="skaria"]`. It redefines `--color-amber`/`--color-amber-deep`
  to a teal palette so shared components (buttons, pills) reskin automatically, then adds many
  Skaria-only component classes (`.emvi-*`, `.sk-*`, `.vm-*`, founder/specialty strips, etc.).

When changing shared visual tokens, check both `centers.css` and `skaria.css` for scoped
overrides that might need to move in tandem. When changing anything Skaria-specific, prefer
editing `skaria.css`/`skaria.js`/`index.html` — don't touch the generic `center.html` path.

## Working without a build step

No compilation, linting, or test command exists — verify changes by opening the HTML files
directly (or via a static server) in a browser. There's no package manager to install.
