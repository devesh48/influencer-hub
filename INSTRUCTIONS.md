# CreatorHub — Setup & Development Instructions

Complete guide to set up, run, and contribute to the CreatorHub project from scratch.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [External Services Setup](#external-services-setup)
   - [Clerk (Authentication)](#1-clerk-authentication)
   - [Supabase (Database & Storage)](#2-supabase-database--storage)
   - [Google Cloud Console (Calendar API)](#3-google-cloud-console-calendar-api)
3. [Local Development Setup](#local-development-setup)
4. [Supabase Database Schema](#supabase-database-schema)
5. [Supabase Storage Setup](#supabase-storage-setup)
6. [Supabase Row Level Security (RLS)](#supabase-row-level-security-rls)
7. [Clerk JWT Template for Supabase](#clerk-jwt-template-for-supabase)
8. [Running the App](#running-the-app)
9. [Project Scripts](#project-scripts)
10. [Development Workflow](#development-workflow)
11. [Adding New Features](#adding-new-features)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)
14. [Environment Variable Reference](#environment-variable-reference)

---

## Prerequisites

Install these tools before starting:

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | 18.x | [nodejs.org](https://nodejs.org) |
| npm | 9.x | Included with Node |
| Git | 2.x | [git-scm.com](https://git-scm.com) |

Verify your versions:

```bash
node -v    # v18.0.0 or higher
npm -v     # 9.0.0 or higher
git --version
```

---

## External Services Setup

You need accounts on three external services before the app will run:

### 1. Clerk (Authentication)

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and create a free account
2. Click **"Add application"**
3. Name it `CreatorHub` (or any name)
4. Enable sign-in methods: **Email**, **Google** (recommended)
5. On the app overview page, copy:
   - **Publishable Key** → `VITE_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → (keep this server-side only — not needed in this frontend app)
6. Under **Configure → Sessions**, set the session token lifetime to your preference (default 7 days is fine)

> **Clerk JWT Template (required for Supabase)** — see [section below](#clerk-jwt-template-for-supabase) after setting up Supabase.

---

### 2. Supabase (Database & Storage)

1. Go to [app.supabase.com](https://app.supabase.com) and create a free account
2. Click **"New project"**
   - Name: `creatorhub`
   - Database Password: generate a strong password and save it
   - Region: choose closest to your users
3. Wait for the project to finish provisioning (~2 minutes)
4. Go to **Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

---

### 3. Google Cloud Console (Calendar API)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project: `CreatorHub`
3. Enable the **Google Calendar API**:
   - Navigate to **APIs & Services → Library**
   - Search "Google Calendar API" → Enable
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services → Credentials**
   - Click **"+ Create Credentials" → OAuth client ID**
   - Application type: **Web application**
   - Name: `CreatorHub Web`
   - Authorized redirect URIs:
     - `http://localhost:5173/google-callback` (development)
     - `https://yourdomain.com/google-callback` (production)
5. Copy:
   - **Client ID** → `VITE_GOOGLE_CLIENT_ID`
6. Configure the **OAuth consent screen**:
   - User type: External
   - Add your email as a test user during development

---

## Local Development Setup

### Step 1 — Clone the repository

```bash
git clone <your-repo-url>
cd influencer-hub
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Create environment file

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in all values:

```env
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx

# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_AVATARS_BUCKET=creatorHub-bucket

# Google Calendar
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/google-callback
```

---

## Supabase Database Schema

Run these SQL statements in the **Supabase SQL Editor** (Dashboard → SQL Editor → New query):

```sql
-- ================================================
-- PROFILES
-- ================================================
create table public.profiles (
  id           uuid primary key,            -- matches Clerk user ID
  username     text unique not null,
  display_name text,
  bio          text,
  avatar_url   text,
  instagram    text,
  background_gradient text default 'from-purple-600 to-pink-500',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

-- ================================================
-- PRODUCTS
-- ================================================
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  description text,
  price       numeric(10,2) not null default 0,
  type        text not null default 'digital-product',
  is_active   boolean not null default true,
  created_at  timestamptz default now()
);

-- ================================================
-- SESSION TYPES
-- ================================================
create table public.session_types (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  title            text not null,
  description      text,
  duration_minutes integer not null default 60,
  price            numeric(10,2) not null default 0,
  original_price   numeric(10,2),
  currency         text not null default 'INR',
  is_most_popular  boolean not null default false,
  is_active        boolean not null default true,
  created_at       timestamptz default now()
);

-- ================================================
-- TESTIMONIALS
-- ================================================
create table public.testimonials (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  text       text not null,
  author     text not null,
  date       text,
  avatar_url text,
  rating     integer check (rating between 1 and 5) default 5,
  created_at timestamptz default now()
);

-- ================================================
-- GOOGLE TOKENS
-- ================================================
create table public.google_tokens (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  access_token  text not null,
  refresh_token text,
  expiry_date   bigint,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(user_id)
);
```

---

## Supabase Storage Setup

1. Go to **Storage** in the Supabase dashboard
2. Click **"New bucket"**
   - Name: `creatorHub-bucket`
   - Public: **yes** (avatars need to be publicly readable)
3. Under **Policies** for the bucket, add these policies:

```sql
-- Allow authenticated users to upload their own avatar
create policy "Users can upload their own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'creatorHub-bucket'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatar
create policy "Users can update their own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'creatorHub-bucket'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public reads on all avatars
create policy "Public read access for avatars"
on storage.objects for select
to public
using (bucket_id = 'creatorHub-bucket');
```

---

## Supabase Row Level Security (RLS)

Enable RLS on all tables and add policies so users can only read/write their own data:

```sql
-- Enable RLS on all tables
alter table public.profiles       enable row level security;
alter table public.products       enable row level security;
alter table public.session_types  enable row level security;
alter table public.testimonials   enable row level security;
alter table public.google_tokens  enable row level security;

-- ================================================
-- PROFILES POLICIES
-- ================================================
-- Public can read any profile (needed for /:username page)
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

-- Users can only insert/update their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid()::text = id::text);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid()::text = id::text);

-- ================================================
-- PRODUCTS POLICIES
-- ================================================
create policy "Public can view active products"
  on public.products for select using (is_active = true);

create policy "Users manage own products"
  on public.products for all
  using (auth.uid()::text = user_id::text);

-- ================================================
-- SESSION TYPES POLICIES
-- ================================================
create policy "Public can view active session types"
  on public.session_types for select using (is_active = true);

create policy "Users manage own session types"
  on public.session_types for all
  using (auth.uid()::text = user_id::text);

-- ================================================
-- TESTIMONIALS POLICIES
-- ================================================
create policy "Public can view testimonials"
  on public.testimonials for select using (true);

create policy "Users manage own testimonials"
  on public.testimonials for all
  using (auth.uid()::text = user_id::text);

-- ================================================
-- GOOGLE TOKENS POLICIES
-- ================================================
create policy "Users manage own google tokens"
  on public.google_tokens for all
  using (auth.uid()::text = user_id::text);
```

---

## Clerk JWT Template for Supabase

Supabase uses the JWT `sub` claim to identify users in RLS policies. You must configure Clerk to issue JWTs that Supabase can verify.

1. In the Clerk dashboard, go to **Configure → JWT Templates**
2. Click **"+ New template"** → choose **Supabase**
3. Name it `supabase` (must match exactly — the app uses `getToken({ template: "supabase" })`)
4. In the Claims editor, ensure it has at minimum:

```json
{
  "sub": "{{user.id}}",
  "role": "authenticated"
}
```

5. Under **Signing**, copy the **JWKS endpoint URL**
6. In Supabase, go to **Settings → Auth → JWT Settings**
   - Set **JWT Secret** to your Clerk JWKS endpoint (or use the Supabase-Clerk integration guide)

> Detailed guide: [docs.clerk.com/integrations/databases/supabase](https://clerk.com/docs/integrations/databases/supabase)

---

## Running the App

```bash
# Development (hot reload on http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

### First Run Checklist

After starting the dev server, verify:

- [ ] Landing page loads at `http://localhost:5173`
- [ ] Sign-up creates a Clerk account
- [ ] After sign-up, redirected to `/dashboard/onboarding`
- [ ] Username claim saves a row in `profiles` table
- [ ] After onboarding, dashboard loads at `/dashboard`
- [ ] Public profile renders at `/:username`
- [ ] Avatar upload works (check Supabase Storage → `creatorHub-bucket`)

---

## Project Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Vite HMR dev server on port 5173 |
| Build | `npm run build` | Production bundle to `dist/` |
| Preview | `npm run preview` | Serve `dist/` locally |
| Lint | `npm run lint` | ESLint across all `src/` files |

---

## Development Workflow

### Branch strategy

```
main          ← production-ready, protected
└── feature/short-description    ← all new work
└── fix/short-description        ← bug fixes
└── chore/short-description      ← maintenance
```

### Committing

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add testimonial CRUD to dashboard
fix: avatar upload fails when file is PNG
chore: bump supabase-js to 2.96
docs: add Google OAuth setup to INSTRUCTIONS
```

### Pull Request flow

1. Create a branch from `main`
2. Make changes, commit with conventional commits
3. Push branch and open a PR using the PR template
4. Ensure CI passes (lint + build)
5. Get at least one review
6. Merge via squash merge

---

## Adding New Features

### Adding a new dashboard page

1. Create the page component in `src/features/profile/dashboard/YourPage.jsx`
2. Add the route in [src/App.jsx](src/App.jsx) inside the protected `DashboardLayout` block:
   ```jsx
   <Route path="/dashboard/your-page" element={<YourPage />} />
   ```
3. Add a nav link in both [src/components/layout/Sidebar.jsx](src/components/layout/Sidebar.jsx) and [src/components/layout/MobileSidebar.jsx](src/components/layout/MobileSidebar.jsx)

### Adding a new Supabase table

1. Write the `CREATE TABLE` SQL and run it in the Supabase SQL Editor
2. Add RLS policies immediately — never ship a table without them
3. Update [PROJECT.md](PROJECT.md) with the new table schema

### Adding a new environment variable

1. Add it to `.env.local` (never commit this file)
2. Add a placeholder entry in `.env.example` with a descriptive comment
3. Document it in the [Environment Variable Reference](#environment-variable-reference) below
4. Update [PROJECT.md](PROJECT.md)

---

## Deployment

### Vercel (recommended)

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import Project**
3. Select the `influencer-hub` repo
4. Framework preset: **Vite**
5. Add all environment variables from `.env.local` in the Vercel dashboard
6. Deploy — Vercel auto-deploys on every push to `main`

**Post-deploy steps:**
- Update `VITE_GOOGLE_REDIRECT_URI` to your production domain
- Add the production redirect URI in Google Cloud Console
- Update Clerk's allowed origins and redirect URLs

### Netlify

1. `npm run build` → uploads the `dist/` folder to Netlify
2. Or connect GitHub repo for continuous deployment
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add all env vars in **Site settings → Environment variables**

### Environment Variables in Production

All `VITE_*` variables must be set in your hosting provider's dashboard. They are embedded into the JS bundle at build time — they are **not** secret. Never put secrets (API secret keys, database passwords) in `VITE_*` variables.

---

## Troubleshooting

### "Missing Publishable Key" error on load

Your `VITE_CLERK_PUBLISHABLE_KEY` is missing or incorrectly set. Confirm `.env.local` exists and the key starts with `pk_test_` or `pk_live_`. Restart the dev server after changing env files.

### Supabase queries return empty / RLS blocks data

- Confirm RLS policies were created (check **Authentication → Policies** in Supabase)
- Confirm the Clerk JWT template is named exactly `supabase`
- Open browser DevTools → Network tab and inspect the request headers — the `Authorization: Bearer <token>` header must be present on Supabase requests

### Avatar upload fails

- Confirm the `creatorHub-bucket` bucket exists in Supabase Storage
- Confirm the bucket is set to **Public**
- Confirm the storage policies allow authenticated users to insert objects
- Check `VITE_SUPABASE_AVATARS_BUCKET` matches the exact bucket name

### Username is taken / already exists

The `profiles.username` column has a `UNIQUE` constraint. The app checks availability before saving, but if you see a constraint error, the username was taken between the check and the insert. Try a different username.

### Google Calendar OAuth redirect mismatch

The URI in `VITE_GOOGLE_REDIRECT_URI` must exactly match one of the **Authorized redirect URIs** you added in Google Cloud Console, including the protocol (`http://` vs `https://`) and trailing slashes.

### Hot reload not working

Vite requires files to be inside the `src/` directory for HMR. Files outside `src/` (like config files) require a full restart.

---

## Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk app publishable key (starts with `pk_`) |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL (e.g., `https://xxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key (JWT string) |
| `VITE_SUPABASE_AVATARS_BUCKET` | Yes | Supabase Storage bucket name for avatars |
| `VITE_GOOGLE_CLIENT_ID` | No* | Google OAuth client ID for Calendar integration |
| `VITE_GOOGLE_REDIRECT_URI` | No* | OAuth callback URL (must match Google Cloud Console) |

*Required only if using the Google Calendar booking feature.
