# ManaOoru — Production Auth System

## What's new in this pass

| Feature | Status | Where |
|---|---|---|
| Google Login | Already working — verify provider is enabled in Supabase dashboard | `lib/supabase/auth.ts` `signInWithOAuth` |
| Phone OTP (send + verify) | Complete | `routes/auth.tsx` |
| Session persistence | Already production-grade (untouched) | `integrations/supabase/client.ts` |
| Protected routes | Extended with profile-completion gate | `components/ProtectedRoute.tsx` |
| Role-based routing | Already solid (untouched) | `routes/dashboard.tsx`, `routes/official.tsx` |
| **Complete profile after signup** | **New** | `routes/complete-profile.tsx` |
| Email verification (if enabled) | **New**: banner + resend, only shown for password accounts | `routes/profile.tsx`, `lib/auth.tsx` |
| **Profile image upload** | **New**: real Supabase Storage, was base64-in-localStorage before | `routes/complete-profile.tsx`, `routes/profile.tsx` |
| **Username uniqueness** | **New**: DB constraint + live availability check | migration + `lib/supabase/auth.ts` |
| Village selection | Already existed, now also gates signup | `lib/village-preferences.ts` |
| Occupation selection | Already existed, now also gates signup | same |
| **Language selection** | **Upgraded**: now persists to your account, not just this browser | `routes/profile.tsx` |
| **Profile editing** | **Rebuilt**: real Supabase writes, was local-only before | `routes/profile.tsx` |
| Logout | Already existed (`SiteNav`), added to Profile → Account too | — |
| **Account deletion** | **New**: real hard delete via server function | `lib/api/account.functions.ts` |

**Supabase connection: untouched.** No changes to `client.ts`, `config.ts`, or how credentials are resolved.

---

## One-time setup required before this works end-to-end

### 1. Run the new migration
```
supabase/migrations/20260708130000_auth_username_profile_completion.sql
```
Adds `username` (unique, case-insensitive), `preferred_language`, and `profile_completed_at` to `profiles`.

### 2. Account deletion needs two *additional* server-only env vars
Account deletion calls `supabase.auth.admin.deleteUser()`, which requires the **service role key** — this can only run server-side, never in the browser. Your `.env.example` already documents these; you need to actually set them for deletion to work:

```
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

These are separate from the `VITE_`-prefixed ones — the `VITE_` versions ship to the browser, these two never do. Get the service role key from Supabase → Project Settings → API. **Never commit this key or put `VITE_` in front of it.**

Every other feature in this pass (username, photo upload, language, profile editing) works with just your existing `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` — only account deletion needs the two extra ones.

### 3. Google OAuth / Phone OTP providers
Unchanged from before — still need to be enabled in Supabase Auth settings for those specific sign-in methods to work. Everything else in this pass works regardless.

---

## How the profile-completion flow works

1. User signs up any way (Google, phone, email).
2. Supabase's `handle_new_user` trigger (already existed, untouched) creates a bare `profiles` row automatically.
3. The moment they hit any page wrapped in `<ProtectedRoute>` (dashboard, profile, post-work, post-worker, official), `ProtectedRoute` checks `needsProfileCompletion` — true until `profile_completed_at` is set — and redirects to `/complete-profile`.
4. They pick a username (live-checked against the DB as they type), name, occupation, language, village, and optional photo.
5. On submit: photo uploads to Supabase Storage (if provided), profile row is updated, `profile_completed_at` is stamped, and they land on their role's dashboard.
6. Public browsing pages (workers, marketplace, land, etc.) are **not** gated — guests and incomplete profiles can still browse freely; only actions that need a real identity are gated.

## How account deletion works

`profile.tsx` → Account tab → two-step confirm → calls `deleteMyAccount()` → hits the new `deleteMyAccount` server function → verifies the caller's own bearer token (can only ever delete your own account, never someone else's) → uses the service-role admin client to delete the `auth.users` row → cascades through `profiles` and everything that references it (listings, complaints, scheme applications, blood donor entries, poll votes, etc. — see the cascade chain in the migration files). This is a hard delete with no recovery, by design (matches the "Account deletion" requirement).

---

## Verification

- `tsc --noEmit`: 0 errors (including strict `noUnusedLocals`/`noUnusedParameters`)
- ESLint: 0 errors, 7 pre-existing low-risk warnings (unchanged from last audit)
- New migration SQL: paren-balanced, follows existing RLS/index conventions
