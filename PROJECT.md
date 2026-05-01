# CreatorHub — Project Documentation

> A link-in-bio platform for creators, coaches, tarot readers, and spiritual entrepreneurs to monetize their social audience and sell digital products, courses, sessions, and services.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Directory Structure](#directory-structure)
5. [Environment Variables](#environment-variables)
6. [Getting Started](#getting-started)
7. [Routing](#routing)
8. [Authentication & Authorization](#authentication--authorization)
9. [Database Schema](#database-schema)
10. [Features](#features)
11. [Component Reference](#component-reference)
12. [State Management & Data Flow](#state-management--data-flow)
13. [Styling Guide](#styling-guide)
14. [Image Handling](#image-handling)
15. [Google Calendar Integration](#google-calendar-integration)
16. [Known Gaps & Upcoming Work](#known-gaps--upcoming-work)

---

## Project Overview

| Field | Value |
|-------|-------|
| Package Name | `creator-hub` |
| Version | `0.0.0` |
| Language | JavaScript (JSX) |
| Framework | React 19 |
| Build Tool | Vite 7 |
| Module System | ES Modules (`type: "module"`) |
| Styling | Tailwind CSS 3 |
| Auth | Clerk |
| Backend/DB | Supabase (PostgreSQL + Storage) |

**What it does:** Creators sign up, go through a brief onboarding to claim a username, then get a shareable public profile page at `/:username`. From the dashboard they manage their digital products, 1:1 coaching sessions, appearance, and analytics.

---

## Tech Stack

### Core
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.2.0 | UI library |
| `react-dom` | 19.2.0 | DOM rendering |
| `react-router-dom` | 7.13.0 | Client-side routing |
| `vite` | 7.2.4 | Dev server & bundler |

### Authentication
| Package | Version | Purpose |
|---------|---------|---------|
| `@clerk/clerk-react` | 5.60.0 | Auth — sign-in, sign-up, session |

### Backend & Storage
| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | 2.95.3 | PostgreSQL DB + file storage |

### UI & Styling
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 3.4.17 | Utility-first CSS |
| `@headlessui/react` | 2.2.9 | Accessible headless components |
| `@heroicons/react` | 2.2.0 | SVG icon set |

### Data Visualization
| Package | Version | Purpose |
|---------|---------|---------|
| `chart.js` | 4.5.1 | Charting library |
| `react-chartjs-2` | 5.3.1 | React wrapper for Chart.js |

### Dev Tools
| Package | Purpose |
|---------|---------|
| `eslint` | Linting |
| `postcss` + `autoprefixer` | CSS processing |
| `@vitejs/plugin-react` | HMR & JSX transform |

---

## Architecture

```
Browser
  │
  └── React SPA (Vite)
        │
        ├── ClerkProvider          ← Handles user sessions & JWTs
        │     └── SupabaseProvider ← Injects Clerk JWT into Supabase client
        │           └── BrowserRouter
        │                 └── App.jsx (routes)
        │
        ├── Supabase (PostgreSQL)  ← Primary data store
        │     ├── profiles table
        │     ├── products table
        │     ├── testimonials table
        │     ├── session_types table
        │     └── Storage bucket (avatars)
        │
        └── Google Calendar API    ← OAuth for booking link
```

### Auth Bridge Pattern
Supabase uses Row Level Security (RLS). To authenticate Supabase queries with the Clerk session, the app fetches the Clerk JWT and passes it as a custom header when creating the Supabase client. This is handled by `SupabaseContext.jsx`.

---

## Directory Structure

```
influencer-hub/
├── index.html                          # App shell, mounts React at #root
├── vite.config.js                      # Vite config with React plugin
├── tailwind.config.js                  # Custom colors (purple primary, pink accent)
├── postcss.config.js                   # Tailwind + autoprefixer
├── eslint.config.js                    # Flat ESLint config (v9)
├── package.json
│
└── src/
    ├── main.jsx                        # Entry — wraps app in ClerkProvider + SupabaseProvider
    ├── App.jsx                         # Root component: BrowserRouter + all route definitions
    ├── index.css                       # Tailwind base/components/utilities + body styles
    │
    ├── pages/                          # Top-level route pages (public)
    │   ├── Home.jsx                    # Landing page (hero, features, CTAs)
    │   ├── SignIn.jsx                  # Clerk <SignIn> embedded component
    │   ├── SignUp.jsx                  # Clerk <SignUp> embedded component
    │   └── NotFound.jsx                # 404 fallback
    │
    ├── features/
    │   └── profile/
    │       ├── dashboard/              # All /dashboard/* pages
    │       │   ├── StorePage.jsx               # Product grid + stats header
    │       │   ├── AnalyticsPage.jsx           # Bar charts, traffic, location data
    │       │   ├── AppearancePage.jsx          # Theme presets, colors, typography
    │       │   ├── SettingsPage.jsx            # Account, 2FA, Stripe (placeholders)
    │       │   ├── PublicProfileSettings.jsx   # Edit bio, avatar, social links
    │       │   ├── OnboardingProfileSetup.jsx  # First-time setup (username claim)
    │       │   ├── GoogleCalenderConnect.jsx   # Google Calendar OAuth button
    │       │   └── SessionTypeManager.jsx      # CRUD for 1:1 session offerings
    │       │
    │       └── public/
    │           └── PublicProfilePage.jsx       # Creator's public /:username page
    │
    ├── components/
    │   ├── layout/
    │   │   ├── DashboardLayout.jsx     # Protected wrapper; redirects to onboarding if no profile
    │   │   ├── Header.jsx              # Top bar: user avatar, nav links, mobile toggle
    │   │   ├── Sidebar.jsx             # Desktop left nav (hidden on mobile)
    │   │   ├── MobileSidebar.jsx       # Slide-out menu for mobile
    │   │   └── PublicLayout.jsx        # Wrapper for /:username route
    │   │
    │   ├── store/
    │   │   ├── ProductCard.jsx         # Reusable product display card
    │   │   ├── AddProductPlaceholder.jsx  # Empty state CTA card
    │   │   ├── SessionBookingCards.jsx    # Grid of bookable 1:1 sessions
    │   │   └── TestimonialBlock.jsx       # Star-rated testimonial card
    │   │
    │   └── ui/                         # Placeholder stubs (not yet implemented)
    │       ├── Button.jsx
    │       ├── Card.jsx
    │       ├── Input.jsx
    │       └── Modal.jsx
    │
    ├── contexts/
    │   └── SupabaseContext.jsx         # React context providing authenticated Supabase client
    │
    ├── hooks/
    │   ├── useSupabaseAuth.js          # Hook: init Supabase client with Clerk JWT
    │   └── useLocalStorage.js          # Stub (not implemented)
    │
    ├── lib/
    │   ├── supabaseClient.js           # Unauthenticated (anon) Supabase client
    │   ├── api.js                      # Stub for future API helpers
    │   └── util.js                     # Stub for utility functions
    │
    ├── data/
    │   └── mockData.jsx                # Hardcoded products, testimonials, analytics
    │
    ├── routes/
    │   └── AppRoutes.jsx               # Unused — routing lives in App.jsx
    │
    ├── styles/
    │   └── globals.css                 # Stub
    │
    └── assets/
        └── react.svg
```

---

## Environment Variables

Create a `.env.local` file in the project root (never commit this file):

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SUPABASE_AVATARS_BUCKET=creatorHub-bucket

# Google Calendar OAuth
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/google-callback
```

> All Vite env vars must be prefixed `VITE_` to be exposed to the client bundle.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- A Clerk account ([clerk.com](https://clerk.com))
- A Supabase project ([supabase.com](https://supabase.com))

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd influencer-hub

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local    # then fill in your keys

# Start dev server
npm run dev
# → http://localhost:5173
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across `src/` |

---

## Routing

All routes are defined in [src/App.jsx](src/App.jsx).

### Public Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Landing page |
| `/sign-in/*` | `SignIn` | Clerk sign-in (handles OAuth callbacks) |
| `/sign-up/*` | `SignUp` | Clerk registration |
| `/:username` | `PublicProfilePage` | Creator's public profile |
| `*` | `NotFound` | 404 fallback |

### Protected Routes (require Clerk session)

All nested under `DashboardLayout`, which enforces authentication and profile existence:

| Path | Component | Description |
|------|-----------|-------------|
| `/dashboard` | `StorePage` | Products & store management |
| `/dashboard/analytics` | `AnalyticsPage` | Traffic, conversions, charts |
| `/dashboard/appearance` | `AppearancePage` | Theme & styling options |
| `/dashboard/settings` | `SettingsPage` | Account, 2FA, payments |
| `/dashboard/public-profile` | `PublicProfileSettings` | Edit bio, avatar, social links |
| `/dashboard/session-types` | `SessionTypeManager` | 1:1 session CRUD |
| `/dashboard/google-connect` | `GoogleCalendarConnect` | Link Google Calendar |
| `/dashboard/onboarding` | `OnboardingProfileSetup` | First-time username claim |

### Route Guards

`DashboardLayout` applies two redirect rules in sequence:
1. Unauthenticated user → `/sign-in`
2. Authenticated user with no `profiles` row → `/dashboard/onboarding`

---

## Authentication & Authorization

### Clerk
- Manages the user lifecycle: sign-up, sign-in, session, JWT issuance
- Hooks used: `useUser()`, `useAuth()`
- Components: `<SignIn>`, `<SignUp>`, `<ClerkProvider>`

### Supabase Row Level Security (RLS)
- The anon Supabase client (in `supabaseClient.js`) is for public reads (e.g., fetching a creator profile by username)
- The authenticated client (from `SupabaseContext.jsx`) passes the Clerk-issued JWT as the `Authorization` header, satisfying Supabase RLS policies that check `auth.uid()`

```js
// SupabaseContext.jsx pattern
const token = await getToken({ template: "supabase" });
const client = createClient(url, anonKey, {
  global: { headers: { Authorization: `Bearer ${token}` } }
});
```

> You must create a "supabase" JWT template in your Clerk dashboard that includes the `sub` claim mapping to the Supabase user ID.

---

## Database Schema

All tables are in Supabase (PostgreSQL). Inferred from application queries:

### `profiles`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, matches Clerk user ID |
| `username` | TEXT | Unique, URL-safe handle |
| `display_name` | TEXT | Public name |
| `bio` | TEXT | Short description |
| `avatar_url` | TEXT | URL to Supabase Storage |
| `instagram` | TEXT | Instagram handle |
| `background_gradient` | TEXT | Tailwind class (e.g., `from-purple-500`) |
| `created_at` | TIMESTAMPTZ | Auto |
| `updated_at` | TIMESTAMPTZ | Auto |

### `products`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `profiles.id` |
| `title` | TEXT | |
| `description` | TEXT | |
| `price` | NUMERIC | |
| `type` | TEXT | `"digital-course"`, `"coaching-call"`, etc. |
| `is_active` | BOOLEAN | Show/hide on public page |
| `created_at` | TIMESTAMPTZ | |

### `session_types`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `profiles.id` |
| `title` | TEXT | e.g., "60-min Clarity Call" |
| `description` | TEXT | |
| `duration_minutes` | INTEGER | e.g., 30, 60 |
| `price` | NUMERIC | |
| `original_price` | NUMERIC | Optional strikethrough price |
| `currency` | TEXT | Default `"INR"` |
| `is_most_popular` | BOOLEAN | Highlights card with badge |
| `is_active` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |

### `testimonials`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `profiles.id` |
| `text` | TEXT | Customer review body |
| `author` | TEXT | Customer name |
| `date` | TEXT | Display date string |
| `avatar_url` | TEXT | Customer photo |
| `rating` | INTEGER | 1–5 stars |
| `created_at` | TIMESTAMPTZ | |

### `google_tokens`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `profiles.id` |
| Access token, refresh token | TEXT | Stored after Google OAuth |

---

## Features

### Creator Onboarding (`/dashboard/onboarding`)
- Username availability check (debounced, real-time)
- Saves `profiles` row on submit
- Redirected here automatically when no profile exists

### Public Profile Page (`/:username`)
- Fetches creator data by username using anon Supabase client
- Renders avatar, bio, background gradient, Instagram link
- Lists active products (`ProductCard`)
- Lists active session types (`SessionBookingCards`)
- Shows testimonials (`TestimonialBlock`)

### Dashboard — Store (`/dashboard`)
- Header stats row (views, earnings, products — currently using mock data)
- Product grid from `mockData.jsx`
- "Add Product" placeholder card

### Dashboard — Analytics (`/dashboard/analytics`)
- Bar chart (Chart.js) for page visits over 7 days
- Traffic source breakdown
- Top locations table
- All data currently from `mockData.jsx`

### Dashboard — Appearance (`/dashboard/appearance`)
- Theme preset cards (Purple Dream, Sunset Glow, Ocean Breeze, Dark Elegance)
- Accent color picker
- Typography selector
- Live preview panel

### Dashboard — Public Profile Settings (`/dashboard/public-profile`)
- Edit display name, bio, Instagram, background gradient
- Avatar upload with client-side compression (400×400, JPEG 70% quality)
- Live preview sidebar showing the public profile result
- Saves to `profiles` table and Supabase Storage

### Session Type Manager (`/dashboard/session-types`)
- Create, read, update, delete session offerings
- Fields: title, description, duration, price, original price, currency, active toggle, "Most Popular" flag
- Toggle session active/inactive without deleting

### Google Calendar Connect (`/dashboard/google-connect`)
- OAuth flow to link Google Calendar for session booking
- Tokens stored in `google_tokens` table

---

## Component Reference

### Layout

| Component | Path | Description |
|-----------|------|-------------|
| `DashboardLayout` | [src/components/layout/DashboardLayout.jsx](src/components/layout/DashboardLayout.jsx) | Auth guard + sidebar/header shell |
| `Header` | [src/components/layout/Header.jsx](src/components/layout/Header.jsx) | Top bar with user menu, mobile toggle |
| `Sidebar` | [src/components/layout/Sidebar.jsx](src/components/layout/Sidebar.jsx) | Desktop left navigation |
| `MobileSidebar` | [src/components/layout/MobileSidebar.jsx](src/components/layout/MobileSidebar.jsx) | Slide-out drawer for mobile |
| `PublicLayout` | [src/components/layout/PublicLayout.jsx](src/components/layout/PublicLayout.jsx) | Thin wrapper for public profile route |

### Store

| Component | Path | Description |
|-----------|------|-------------|
| `ProductCard` | [src/components/store/ProductCard.jsx](src/components/store/ProductCard.jsx) | Product display with price & CTA |
| `SessionBookingCards` | [src/components/store/SessionBookingCards.jsx](src/components/store/SessionBookingCards.jsx) | Grid of bookable sessions from DB |
| `TestimonialBlock` | [src/components/store/TestimonialBlock.jsx](src/components/store/TestimonialBlock.jsx) | Star-rated review card |
| `AddProductPlaceholder` | [src/components/store/AddProductPlaceholder.jsx](src/components/store/AddProductPlaceholder.jsx) | Empty state / add product CTA |

### Dashboard Pages

| Component | Path |
|-----------|------|
| `StorePage` | [src/features/profile/dashboard/StorePage.jsx](src/features/profile/dashboard/StorePage.jsx) |
| `AnalyticsPage` | [src/features/profile/dashboard/AnalyticsPage.jsx](src/features/profile/dashboard/AnalyticsPage.jsx) |
| `AppearancePage` | [src/features/profile/dashboard/AppearancePage.jsx](src/features/profile/dashboard/AppearancePage.jsx) |
| `SettingsPage` | [src/features/profile/dashboard/SettingsPage.jsx](src/features/profile/dashboard/SettingsPage.jsx) |
| `PublicProfileSettings` | [src/features/profile/dashboard/PublicProfileSettings.jsx](src/features/profile/dashboard/PublicProfileSettings.jsx) |
| `OnboardingProfileSetup` | [src/features/profile/dashboard/OnboardingProfileSetup.jsx](src/features/profile/dashboard/OnboardingProfileSetup.jsx) |
| `GoogleCalendarConnect` | [src/features/profile/dashboard/GoogleCalenderConnect.jsx](src/features/profile/dashboard/GoogleCalenderConnect.jsx) |
| `SessionTypeManager` | [src/features/profile/dashboard/SessionTypeManager.jsx](src/features/profile/dashboard/SessionTypeManager.jsx) |

---

## State Management & Data Flow

The app uses **local React state only** — no global store (no Redux, Zustand, Jotai, etc.).

```
Clerk session
    │
    ▼
useAuth() → JWT token
    │
    ▼
SupabaseContext → authenticated client
    │
    ▼
Component local state (useState)
    │
    ├── supabaseAuth.from("profiles").select(...)
    ├── supabaseAuth.from("session_types").insert(...)
    └── supabaseClient.from("profiles").select(...)  ← public reads (anon)
```

**Two Supabase clients are used:**
- `supabaseClient` (lib/supabaseClient.js) — anon key, for public data reads (no auth required)
- `supabaseAuth` (from SupabaseContext) — authenticated with Clerk JWT, for writes and user-scoped reads

---

## Styling Guide

### Framework
Tailwind CSS with utility classes only. No CSS modules or styled-components.

### Custom Theme (`tailwind.config.js`)

```js
colors: {
  primary: {
    DEFAULT: "#7c3aed",  // purple-600
    dark: "#6d28d9",     // purple-700
  },
  accent: "#ec4899",     // pink-500
}
```

### Design Conventions
- **Border radius**: `rounded-xl` (16px) or `rounded-2xl` (24px) for cards
- **Shadows**: `shadow-sm`, `shadow-md` for elevation
- **Grid**: `grid-cols-1`, `md:grid-cols-2`, `lg:grid-cols-3` for responsive grids
- **Gradients**: `bg-gradient-to-br from-purple-600 to-pink-500` — brand gradient
- **Typography**: No custom font configured; system font stack via Tailwind default

### Responsive Breakpoints
- Mobile-first — default styles target mobile
- `md:` — 768px+ (tablet, shows desktop sidebar)
- `lg:` — 1024px+ (wider columns)

---

## Image Handling

Avatar images are compressed client-side before upload to reduce storage and bandwidth usage.

**Utility: `compressAndResizeImage()`** in [PublicProfileSettings.jsx](src/features/profile/dashboard/PublicProfileSettings.jsx):

1. Reads `File` via `FileReader` as a data URL
2. Draws onto an `HTMLCanvasElement` at 400×400 (with `object-fit: cover` logic)
3. Exports as `image/jpeg` at 70% quality
4. Returns a `Blob` ready for upload

**Upload flow:**
1. User selects image → compression → preview shown in modal
2. On confirm → upload to Supabase Storage bucket (`VITE_SUPABASE_AVATARS_BUCKET`)
3. Path format: `{userId}/avatar.jpg` (overwrites previous)
4. Public URL retrieved via `supabase.storage.from(bucket).getPublicUrl(path)`
5. URL saved to `profiles.avatar_url`

---

## Google Calendar Integration

**File:** [src/features/profile/dashboard/GoogleCalenderConnect.jsx](src/features/profile/dashboard/GoogleCalenderConnect.jsx)

**Flow:**
1. User clicks "Connect Google Calendar"
2. App redirects to Google OAuth consent screen with scopes for Calendar read/write
3. Google redirects back to `VITE_GOOGLE_REDIRECT_URI` with an auth code
4. Auth code is exchanged for access + refresh tokens
5. Tokens are stored in the `google_tokens` Supabase table under the user's ID
6. Session booking cards on the public profile use the calendar integration for scheduling

**Required Google Cloud setup:**
- Enable Google Calendar API
- Create OAuth 2.0 credentials (Web application)
- Add `VITE_GOOGLE_REDIRECT_URI` to Authorized redirect URIs

---

## Known Gaps & Upcoming Work

### Stub Files (not yet implemented)
- `src/components/ui/Button.jsx` — generic button component
- `src/components/ui/Card.jsx` — generic card component
- `src/components/ui/Input.jsx` — generic input component
- `src/components/ui/Modal.jsx` — generic modal component
- `src/hooks/useLocalStorage.js` — localStorage hook
- `src/lib/api.js` — API helper layer
- `src/lib/util.js` — utility functions

### Mock Data (needs real DB integration)
- `StorePage.jsx` — product list and stats header use `mockData.jsx`
- `AnalyticsPage.jsx` — all chart data is hardcoded

### Features Planned / "Coming Soon"
| Feature | Location | Status |
|---------|----------|--------|
| Product creation form/modal | `StorePage` | Not built |
| Stripe payments | `SettingsPage` | Placeholder |
| Two-factor authentication | `SettingsPage` | Placeholder |
| Audience management | Dashboard | Not started |
| Email notifications | — | Not started |
| Blog / content creation | — | Not started |
| Refund & cancellation management | — | Not started |
| Direct messaging | — | Not started |

### Code Quality Notes
- `prop-type` in package.json is likely a typo; should be `prop-types` (version `0.0.1` is a stub package)
- `src/routes/AppRoutes.jsx` is unused — routing is in `App.jsx`
- `App.css` contains Vite template styles that are largely unused
