# Paisley IB Library

*A GCS Creative Project by Grace Campbell-Sheran © 2026. All rights reserved.*

A teacher-managed library dashboard for the Promethean Board, with a student-facing
Display Mode and a PIN-protected Admin Mode. Built with React + Vite, deployed on
Netlify, content stored in Netlify Blobs. Icons via `lucide-react`.

## What's built

**Display Mode:** Header, Statement of Inquiry, Today's Inquiry Questions, Library
Learning Space (saved-link library with full-screen expand), ATL Skill Spotlight,
Learner Profile Spotlight, Today's Focus, the 10-attribute Learner Profile strip,
live Clock, Voice Level, a Timer/countdown, bottom nav, and every student-safe
overlay (Library Rules, The Garage, DOER Maker Space, Instructional Space, Paisley
Shelves, Lowrance Shelves, Special Collections, Links).

**Tap-to-cycle:** the title bar of any rotating card (Inquiry Questions, ATL
Spotlight, Learner Profile Spotlight, Today's Focus, Statement of Inquiry, and
Library Learning Space) is tappable — it advances to the next saved item. This is
intentionally **local to the browser tab and not persisted**: it resets on reload
and never touches Netlify Blobs, so it can only browse content Grace already
approved in Admin Mode, never add or change anything. That's what lets it work
without an Admin login.

**Timer:** configured only in Admin Mode (label + duration, Start/Pause/Reset).
The countdown itself is stored in Netlify Blobs, so it's visible read-only on the
main Display and in the full-screen media overlay (top-left, alongside the clock),
and survives a page refresh mid-countdown.

**Full-screen media:** the clock and timer stay visible (top-left) the entire time
media is expanded, so you can present without losing track of time.

**Admin Mode:** PIN gate (defaults to `0000`, changeable from a panel inside Admin
— see below), full editors for every content bank above, plus Rules, Space
notes, Special Collections, Research/eResources links, Announcements, and
multilingual (English/Spanish) toggles.

**Content banks are pre-filled** with real starter content (6+ options each for
Inquiry Questions, ATL Spotlight, Today's Focus; all 10 for Learner Profile
Spotlight) so rotation has real variety on day one. The Statement of Inquiry is
deliberately left with just the one yearlong default — the build spec calls for
that to stay a stable anchor rather than auto-populated alternates, so extra
statements are left for Grace to add intentionally in Admin Mode.

**Not yet built:**
- SCHEDULE-based rotation (date-range assignment) — AUTO/HOLD/CUSTOM exist, SCHEDULE is per-item on some banks but not exposed everywhere
- Multilingual translations are English-only by default — Grace fills in Spanish per item in Admin Mode as needed


## Local development

```bash
npm install
npm run dev
```

This runs in **mock mode** automatically — content lives in memory (not persisted)
so you can preview and click through everything without deploying. Admin PIN in
mock mode is `0000`.

## Deploying (GitHub + Netlify)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial Paisley IB Library scaffold"
   git branch -M main
   git remote add origin https://github.com/<your-username>/paisley-ib-library.git
   git push -u origin main
   ```

2. **Connect the repo in Netlify**
   - Netlify dashboard → **Add new site → Import an existing project**
   - Choose the GitHub repo you just pushed
   - Build command: `npm run build` (already set in `netlify.toml`)
   - Publish directory: `dist` (already set in `netlify.toml`)

3. **(Optional) Set an environment variable** (Netlify dashboard → Site
   configuration → Environment variables):
   - `SESSION_SECRET` — any long random string, used to sign Admin session
     tokens. Not required — there's a static fallback — but recommended for
     production.

   You do **not** need to set a PIN here. The Admin PIN now lives in Netlify
   Blobs, not an env var — see below.

4. **Deploy** — Netlify will build and deploy automatically. Netlify Blobs works
   out of the box on Netlify's servers with no extra setup; the site's content
   banks will start seeded with the defaults in `src/data/defaults.js` the first
   time each bank is read.

## Admin PIN

The first time you (or Grace) enter Admin Mode on a fresh deploy, the PIN is
**`0000`**. Once logged in, there's a **Change Admin PIN** panel at the top of
the Admin dashboard — set a real PIN there and it takes effect immediately for
all future logins. The PIN is stored in Netlify Blobs (not in code, not in an
env var), so changing it doesn't require a redeploy.

5. **On the Promethean Board**, open the deployed Netlify URL and use the
   **Full Screen** button in the top right of Display Mode.

## Entering Admin Mode

Tap the small copyright line in the bottom-right corner of the footer — it opens
a PIN prompt. This is intentionally the only entry point from the student-facing
screen.

## Project structure

```
netlify/functions/    Serverless functions (Blobs read/write, PIN auth)
src/components/       Display.jsx (student view), Admin.jsx (teacher dashboard),
                       Overlays.jsx (rules/space modals)
src/data/defaults.js  Seed content for every bank
src/lib/blobsClient.js  Client wrapper — auto-detects mock vs. real backend
```
