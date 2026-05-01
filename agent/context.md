# CreatorHub — Agent Context Reference

Quick-reference context for AI agents working on this codebase. Read this alongside `CLAUDE.md`.

---

## What This App Does

CreatorHub is a **link-in-bio platform** for creators, coaches, and spiritual entrepreneurs. Each creator gets a public page at `/:username` where visitors can:
- View the creator's bio, avatar, and branding
- Browse and buy digital products
- Book 1:1 coaching or session calls
- Read customer testimonials

Creators manage everything from a protected dashboard at `/dashboard`.

---

## User Journey

```
Visitor lands on / (landing page)
    │
    └── Clicks Sign Up
          │
          └── Clerk sign-up flow
                │
                └── Redirected to /dashboard/onboarding
                      │
                      └── Claims username → profile row created in Supabase
                            │
                            └── Redirected to /dashboard (StorePage)
                                  │
                                  ├── Manages products, sessions, appearance
                                  └── Shares /:username link with followers
```

---

## Key Files Quick Reference

| What you want | Where it is |
|---------------|-------------|
| All routes | `src/App.jsx` |
| Auth providers setup | `src/main.jsx` |
| Supabase authenticated client | `src/contexts/SupabaseContext.jsx` |
| Supabase public (anon) client | `src/lib/supabaseClient.js` |
| Dashboard shell/layout | `src/components/layout/DashboardLayout.jsx` |
| Creator's public page | `src/features/profile/public/PublicProfilePage.jsx` |
| First-time onboarding | `src/features/profile/dashboard/OnboardingProfileSetup.jsx` |
| Avatar upload logic | `src/features/profile/dashboard/PublicProfileSettings.jsx` |
| Session CRUD | `src/features/profile/dashboard/SessionTypeManager.jsx` |
| Mock data (placeholder) | `src/data/mockData.jsx` |
| Tailwind config & custom colors | `tailwind.config.js` |

---

## Data Relationships

```
profiles (1)
  ├──< products (many)       — user's digital products
  ├──< session_types (many)  — 1:1 coaching session offerings
  ├──< testimonials (many)   — customer testimonials
  └──< google_tokens (1)     — linked Google Calendar credentials
```

All child tables have `user_id uuid references profiles(id) on delete cascade`.

---

## Auth Flow Detail

```
1. User signs in via Clerk
2. Component calls: const { getToken } = useAuth()
3. Token fetched: await getToken({ template: "supabase" })
4. SupabaseContext creates an authenticated Supabase client with:
   Authorization: Bearer <token>
5. Supabase validates JWT using Clerk's JWKS endpoint
6. RLS policies allow access to rows where auth.uid() = user_id
```

The **anon client** skips steps 2–5 and uses the Supabase anon key directly.
Use it only for public reads (no personal data).

---

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (Clerk) | Complete | |
| Onboarding / username claim | Complete | |
| Public profile page | Complete | |
| Avatar upload | Complete | Client-side compression included |
| Session type CRUD | Complete | |
| Appearance / theme picker | Complete | No persistence yet |
| Google Calendar connect | Partial | OAuth flow only, no booking logic |
| Product CRUD | Partial | Display only; create/edit forms not built |
| Analytics | Partial | UI built, uses mock data |
| Stripe payments | Not started | Placeholder in SettingsPage |
| 2FA | Not started | Placeholder in SettingsPage |
| Testimonial CRUD | Not started | Read-only on public page |
| Generic UI components | Not started | ui/ stubs are empty files |

---

## Patterns to Follow

### Loading states
```jsx
const [loading, setLoading] = useState(true);
if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" /></div>;
```

### Error handling for Supabase
```jsx
const { data, error } = await supabaseAuth.from("table").select("*");
if (error) {
  console.error("fetch failed:", error.message);
  return;
}
```

### Empty states
```jsx
if (items.length === 0) {
  return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-lg font-medium">Nothing here yet</p>
      <p className="text-sm mt-1">Add your first item to get started.</p>
    </div>
  );
}
```

### Confirm before delete
Always use a confirmation step (modal or `window.confirm`) before irreversible deletes.

---

## Supabase Table Column Quick Reference

```
profiles:        id, username, display_name, bio, avatar_url, instagram, background_gradient
products:        id, user_id, title, description, price, type, is_active
session_types:   id, user_id, title, description, duration_minutes, price, original_price, currency, is_most_popular, is_active
testimonials:    id, user_id, text, author, date, avatar_url, rating
google_tokens:   id, user_id, access_token, refresh_token, expiry_date
```

---

## Things That Might Surprise You

- **Two Supabase clients**: `supabaseClient` (anon) and `supabaseAuth` (from context). Using the wrong one either fails RLS or exposes personal data to unauthenticated callers.
- **Clerk user ID = Supabase profile ID**: The `profiles.id` column is the Clerk user ID (a string UUID), not a Supabase-generated UUID. This is intentional — it ties the auth identity to the profile row without a join.
- **No TypeScript**: The project is plain JavaScript. Don't add `.ts`/`.tsx` files.
- **Mock data is global**: `src/data/mockData.jsx` is imported by multiple components. When you replace it with real DB calls in one component, check if other components still need it.
- **`src/routes/AppRoutes.jsx` is unused**: Routing is entirely in `App.jsx`. The routes file is a leftover stub.
- **`prop-type` package is a typo**: The installed package is `prop-type` (version 0.0.1, a stub), not the real `prop-types`. If you need prop validation, install `prop-types` and remove the typo package.
- **`App.css` is mostly unused**: Contains leftover Vite template styles. Don't add to it.
