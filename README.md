# ManaOoru Village Connect

This project is a village community platform built with React, TanStack Start, and Supabase.
It already includes email/password login, signup, OTP/magic link, and Google OAuth support.

## What is included

- Supabase authentication and `auth.users` integration
- Email/password signup and login
- Magic link / email OTP login
- Phone OTP login
- Google sign-in button (requires Supabase OAuth configuration)
- User profiles with village, role, and profile photo support
- Saved posts, listings, notifications, theme, and profile options
- Supabase migrations in `supabase/migrations/`

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your Supabase project values:

```bash
cp .env.example .env
```

Update `.env` with your Supabase project details:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_AUTH_REDIRECT_URL` (typically `http://localhost:5173/` for local dev)

Optional but recommended for server-side admin operations:

- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Start the Supabase local environment

Make sure Docker Desktop is running, then in the project root:

```bash
npx supabase login
npx supabase start
```

If you already have a Supabase project and want to apply the schema:

```bash
npx supabase db push
```

### 4. Run the app

```bash
npm run dev
```

Open the app at `http://localhost:5173`.

## Email login / Signup flow

### Sign up using email

1. Open `/auth`
2. Click `Create account` if not already in signup mode
3. Enter your name, email, password, and village details
4. Choose your role
5. Submit the form

If the app sends a confirmation email, open that email and follow the link.

### Sign in using email/password

1. Open `/auth`
2. Enter your email and password
3. Click `Sign in`

### Magic link / email OTP

1. Enter your email
2. Click `Email OTP / Magic Link`
3. Check your inbox and follow the link

### Password reset

1. Enter your email
2. Click `Forgot password`
3. Follow the email link to reset your password

### Phone OTP

1. Enter your phone number with country code (for example `+919876543210`)
2. Click `Phone OTP`

### Google sign-in

The button is present in the UI.
To make Google login work, configure Supabase Auth with Google and set the redirect URL to:

```text
http://localhost:5173/
```

If Google is not configured, the app will show an error suggesting that the provider is not enabled.

## How to use the app

### Profile page

After signing in, go to `/profile`.
The profile page includes:

- Saved Posts: items you have saved from listings
- My Posts: active listings you created
- Settings: update profile photo and privacy settings
- Language: choose Telugu, English, or Hindi
- Dark Mode: switch between light and dark themes
- Notifications: toggle notifications on/off

### Navigation

The main menu includes quick links to:

- Workers
- Land lease
- Marketplace
- Services
- Problems
- Announcements
- Weather
- AI assistant

### Database and features

This project is already wired to Supabase tables for:

- `profiles`
- `listings`
- `user_roles`
- `villages`
- `complaints`
- `announcements`
- `government_works`
- `notifications`
- `products`
- `jobs`
- `events`
- `comments`
- `likes`

## Notes

- The app uses local storage for theme, notification preferences, and profile photo.
- If you want to use admin/server operations, set `SUPABASE_SERVICE_ROLE_KEY` in `.env`.
- The UI is already wired to Supabase auth and should work once your environment variables and Supabase project are configured.

## Troubleshooting

- If `npx supabase status` fails, make sure Docker Desktop is running.
- If email login fails, confirm your Supabase `SUPABASE_URL` and anon key are correct.
- If Google sign-in fails, verify the provider is enabled and redirect URL is configured.

---

If you want, I can also help you connect this app to a live Supabase project and verify email login end-to-end.