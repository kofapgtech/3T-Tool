# 3T Impact Engine — Frontend

React 18 + TypeScript + Vite app, hand-written against the live Supabase schema (project `asnsktfnvroawwvvpyqu`). This app could not be `npm install`ed or built inside the build sandbox (no package-registry network access), so it needs to be installed and run locally.

## Setup

1. `cd` into this folder.
2. `npm install`
3. `cp .env.example .env.local` (the example already has the real Supabase URL and publishable key filled in — check they're still correct in Supabase → Project Settings → API before running).
4. `npm run dev` — starts the Vite dev server on `http://localhost:5173`.
5. `npm run build` — type-checks (`tsc -b`) and builds for production.

## If the build fails

Send me the exact error output and I'll fix the source directly. Likely first-run issues to watch for:

- Missing/renamed exports from `lucide-react`, `recharts`, or `@tanstack/react-query` if installed versions drift from what's pinned in `package.json`.
- Google OAuth redirect: in Supabase → Authentication → URL Configuration, make sure `http://localhost:5173` is in the allowed Redirect URLs list, or Google sign-in will bounce.
- Only users with a `profiles` row (created via the `handle_new_user` trigger from `raw_user_meta_data.org_id`/`role`) can sign in meaningfully — an auth user with no profile will authenticate but see restricted/empty data everywhere.

## What's built

- **Login** (`/login`) — email+password, magic link, Google OAuth. Invite-only (no self sign-up).
- **Organization Dashboard** (`/dashboard`) — summary cards, spend-vs-social-value chart, supplier leaderboard. Section order flips by role (`diversity_viewer` sees the supplier leaderboard first).
- **Projects** (`/projects`, `/projects/:id`) — project list/create (BIOS strategy picker only shows strategies with a defined social-value multiplier — the rest are blocked server-side by a trigger), cost line items, business value inputs, computed financials (TVO/NPV/ROI) and social value, submissions with evidence upload to the `submission-evidence` storage bucket.
- **Impact Sandbox** (`/sandbox`) — single-strategy modeling (pick one BIOS strategy, enter spend, see Social Value = spend × multiplier), save as a scenario.

## Known gaps / follow-ups

- Only 20 of 79 BIOS catalog strategies have a defined social-value multiplier; the other 59 are hidden from selection everywhere in the UI (enforced by the `projects_guard_bio_multiplier` DB trigger too).
- Several narrative fields on `business_impact_opportunities` (business intelligence, step 1-3 guidance, business case supplements, TCO line/use explainers) were left NULL during the bulk data load to manage payload size — not surfaced in the UI yet.
- Regenerate `src/lib/database.types.ts` after any future schema change: `supabase gen types typescript --project-id asnsktfnvroawwvvpyqu`.
