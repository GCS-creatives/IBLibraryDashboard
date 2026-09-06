# Paisley IB Library

*A GCS Creative Project by Grace Campbell-Sheran © 2026. All rights reserved.*

A teacher-managed library dashboard for the Promethean Board, with a student-facing
Display Mode and a PIN-protected Admin Mode. Built with React + Vite, deployed on
Netlify, content stored in Netlify Blobs. Icons via `lucide-react`.

## What's built in this first pass

**Fully wired (Display + Admin + storage):**
- Header, Statement of Inquiry (with restore-default), Today's Inquiry Questions
- Library Learning Space media stage (embed + full-screen expand/collapse)
- ATL Skill Spotlight & Learner Profile Spotlight (display only for now — Admin can
  hold a specific set via the Inquiry Questions/Focus panels' pattern; spotlight-specific
  Admin editors are the next piece to add)
- Complete 10-attribute Learner Profile strip
- Today's Focus, live Clock, Voice Level (0–2 selectable, 3 defined but locked)
- Bottom nav + all student-safe overlays: Library Rules (general, checkout, yellow
  tag/RYA, media office), The Garage, DOER Maker Space, Instructional Space, Paisley
  Shelves, Lowrance Shelves, Special Collections, Research Help/eResources
- Admin Mode: PIN gate, Statement of Inquiry bank, Inquiry Questions, Media, Today's
  Focus (with HOLD), Voice Level, Special Collections, Research/eResources links, and
  editable text for every rule/space rule set

**Not yet built (flagged so nothing is silently missing):**
- Admin editors specifically for ATL Spotlight and Learner Profile Spotlight banks
  (rotation banks exist in storage; UI to add/select them isn't wired yet)
- SCHEDULE-based rotation (date-range assignment) — AUTO/HOLD exist, SCHEDULE doesn't yet
- Multilingual/DLI content toggles
- Announcements bank UI

Let me know which of these you want next and I'll add them the same way.

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
