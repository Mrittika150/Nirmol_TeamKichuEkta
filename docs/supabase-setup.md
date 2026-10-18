# Connecting Nirmol to Supabase (hosted project)

Written 18 Oct 2026 for the submission build. Takes about 30–40 minutes.
Order matters: do the steps top to bottom.

## A. Database (SQL Editor)

Open Supabase → your project → **SQL Editor**. For each file below: **New query**,
paste the whole file, click **Run**, and check it says *Success* before the next.
Files are in `supabase/setup/`.

| Step | File | Notes |
|---|---|---|
| 1 | `step1_init.sql` | Skip if Table Editor already shows `profiles`, `forecast_runs` etc. |
| 2 | `step2_forecast_publication.sql` | Lets the hourly job publish the Nirmol model forecast |
| 3 | `step3_account_settings.sql` | Saved places / preferences in My Nirmol |
| 4a | `step4a_report_category_value.sql` | Must run **on its own** before 4b |
| 4b | `step4b_reporting.sql` | Pollution reports, private photo bucket, privacy rules |
| 5 | `step5_community_moderation.sql` | Community map + moderator queue |
| 6 | `step6_advisor_quotas.sql` | Advisor daily limits |
| 7 | `step7_check.sql` | Read-only: every row should show `ok = true` |

If a step fails, stop and send the error text (not keys) to the team. Do not
re-run earlier steps: they are not repeatable.

## B. Authentication settings

1. **Authentication → Sign In / Providers → Email**: keep Email enabled.
   For the demo, turn **Confirm email OFF** (Supabase's built-in mailer sends
   only a few emails per hour). Anonymous sign-ins are not used.
2. **Authentication → URL Configuration**:
   - Site URL: your Vercel address (`https://….vercel.app`), or
     `http://localhost:3000` until Vercel works.
   - Redirect URLs: add `http://localhost:3000/auth/callback` and
     `https://….vercel.app/auth/callback`.

## C. Keys into the app

From **Project Settings → API Keys** (and the project URL), fill these in
`web/.env.local`; the other lines are already filled:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

Restart `npm run dev` after editing. On Vercel add **every** line of
`web/.env.local` under Settings → Environment Variables, with
`NIRMOL_SITE_URL=https://….vercel.app`, then Redeploy.

## D. Moderator account

1. In the app, open `/login`, sign up with the moderator's email.
2. In SQL Editor, open `step8_make_moderator.sql`, replace the email in both
   places, Run. The second query should show `is_moderator = true`.
3. Sign out and in again; `/moderation` now shows the review queue.

## E. Hourly forecast (GitHub)

Repository → **Settings → Secrets and variables → Actions**:

- **Secrets** tab: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Variables** tab: `NIRMOL_ATOMIC_PUBLISHER_ENABLED` = `true`.

Then **Actions → Hourly forecast → Run workflow**. A green run means the Nirmol
model forecast is in the database. On the dashboard, choose
**"Dhaka evaluation reference (Baridhara)"**: the source label switches from
CAMS to the Nirmol model and the SHAP explanation appears. Other places keep
CAMS by design (the model is evaluated at that site only).

## F. Quick end-to-end check

1. `/reports`: sign in, submit a report with a photo; the AI suggestion appears.
2. `/moderation` (moderator): approve it.
3. `/community`: the approved report appears on the map.
4. `/advisor`: ask "আজ বাইরে হাঁটা কি ঠিক?" and get a Bangla answer.
