# CreatorHub — Claude Code Agent Instructions

This file configures how Claude Code (and other AI coding agents) should work with this repository. Read this before making any changes.

---

## Project Identity

- **Name**: CreatorHub
- **Type**: React 19 SPA (Vite, no Next.js, no SSR)
- **Language**: JavaScript with JSX — no TypeScript
- **Styling**: Tailwind CSS 3 only — no CSS modules, no styled-components
- **Auth**: Clerk (frontend) + Supabase RLS (database)
- **DB/Storage**: Supabase (PostgreSQL + Storage)

---

## Critical Rules

### Never do these

- Do not add TypeScript — this is a plain JavaScript project
- Do not install CSS-in-JS libraries (styled-components, emotion, etc.)
- Do not add a global state manager (Redux, Zustand, Jotai) unless explicitly asked
- Do not commit `.env.local` or any file containing real API keys
- Do not create bare `useEffect` data fetches without cleanup or abort signals
- Do not write Supabase queries without checking which client to use (see below)
- Do not add `console.log` statements in committed code
- Do not use `any` workarounds that bypass Supabase RLS

### Always do these

- Use Tailwind utility classes for all styling
- Use the correct Supabase client (see Client Rules below)
- Follow the existing file organization (see Directory Structure in PROJECT.md)
- Run `npm run lint` and fix all errors before considering a task done
- Run `npm run build` to verify no build errors before considering a task done

---

## Supabase Client Rules

Two clients exist — use the right one:

| Client | File | When to use |
|--------|------|-------------|
| Anon (public) | `src/lib/supabaseClient.js` | Public reads: `profiles` by username, active `products`, active `session_types` on `/:username` page |
| Authenticated | `src/contexts/SupabaseContext.jsx` via `useSupabase()` | All writes, all reads inside the dashboard, any query that requires auth |

```js
// Public read — no auth needed
import { supabase } from "@/lib/supabaseClient";

// Authenticated — inside a component
import { useSupabase } from "@/contexts/SupabaseContext";
const { supabaseAuth } = useSupabase();
```

---

## Routing Conventions

All routes are defined in `src/App.jsx`. When adding a new route:

1. Dashboard routes → nest inside the `DashboardLayout` block
2. Public routes → add at the top level in `BrowserRouter`
3. The catch-all `*` route for `NotFound` must always remain last

Protected route pattern:
```jsx
<Route element={<DashboardLayout />}>
  <Route path="/dashboard/your-page" element={<YourPage />} />
</Route>
```

---

## Component Organization

```
src/
├── pages/          ← Top-level public pages (Home, SignIn, SignUp, NotFound)
├── features/
│   └── profile/
│       ├── dashboard/   ← All /dashboard/* page components
│       └── public/      ← /:username public profile page
├── components/
│   ├── layout/     ← Shell: DashboardLayout, Header, Sidebar, MobileSidebar
│   ├── store/      ← Reusable product/session/testimonial display cards
│   └── ui/         ← Generic UI primitives (Button, Card, Modal, Input)
├── contexts/       ← React contexts (SupabaseContext)
├── hooks/          ← Custom hooks
├── lib/            ← Third-party client initializations
└── data/           ← Mock data (replace with real DB queries)
```

When creating a new reusable component:
- Goes in `components/ui/` if it's a generic primitive (button, input, modal)
- Goes in `components/store/` if it's a product/session/testimonial display
- Goes in `features/profile/dashboard/` if it's a full dashboard page
- Goes in `features/profile/public/` if it's part of the public profile

---

## Styling Rules

- Use Tailwind utility classes exclusively — never write raw CSS unless in `index.css` for global base styles
- Primary color: `#7c3aed` (purple-600) — use `text-purple-600`, `bg-purple-600` etc.
- Accent color: `#ec4899` (pink-500)
- Brand gradient: `bg-gradient-to-br from-purple-600 to-pink-500`
- Card styling: `rounded-xl shadow-sm border border-gray-100 bg-white`
- For responsive layouts, always mobile-first: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## Database Rules

- Every new table **must** have RLS enabled immediately
- Every RLS policy must be documented in the relevant SQL section of `INSTRUCTIONS.md`
- Use `uuid` primary keys with `gen_random_uuid()` for all tables except `profiles` (which uses the Clerk user ID as PK)
- Foreign keys to `profiles` should use `on delete cascade`

---

## Environment Variables

- All client-side env vars must be prefixed `VITE_`
- Never hardcode API keys, URLs, or bucket names in source code
- When adding a new env var, update `.env.example` and the table in `INSTRUCTIONS.md`

---

## Mock Data

`src/data/mockData.jsx` contains placeholder data for features not yet connected to the database. When implementing a feature that uses mock data:

1. Write the Supabase query to fetch real data
2. Replace the mock import with the real query
3. Remove the mock data entry if it is no longer used elsewhere

---

## Common Task Patterns

### Fetch user's own data in a dashboard component

```jsx
import { useUser } from "@clerk/clerk-react";
import { useSupabase } from "@/contexts/SupabaseContext";
import { useState, useEffect } from "react";

export default function MyPage() {
  const { user } = useUser();
  const { supabaseAuth } = useSupabase();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabaseAuth) return;

    const fetchData = async () => {
      const { data, error } = await supabaseAuth
        .from("your_table")
        .select("*")
        .eq("user_id", user.id);

      if (!error) setData(data);
      setLoading(false);
    };

    fetchData();
  }, [user, supabaseAuth]);

  if (loading) return <div>Loading...</div>;
  return <div>{/* render data */}</div>;
}
```

### Fetch public profile data (no auth)

```jsx
import { supabase } from "@/lib/supabaseClient";

const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("username", username)
  .single();
```

### Upload a file to Supabase Storage

```jsx
const bucket = import.meta.env.VITE_SUPABASE_AVATARS_BUCKET;
const path = `${user.id}/avatar.jpg`;

const { error } = await supabaseAuth.storage
  .from(bucket)
  .upload(path, blob, { upsert: true, contentType: "image/jpeg" });

const { data } = supabaseAuth.storage.from(bucket).getPublicUrl(path);
const publicUrl = data.publicUrl;
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `SessionTypeManager.jsx` |
| Hooks | camelCase, `use` prefix | `useSupabaseAuth.js` |
| Utilities / lib | camelCase | `supabaseClient.js` |
| Context files | PascalCase + "Context" | `SupabaseContext.jsx` |
| Data files | camelCase | `mockData.jsx` |

---

## Before Finishing Any Task

Run this checklist:

- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] No hardcoded keys, URLs, or secrets in source files
- [ ] No unused imports left behind
- [ ] No `console.log` statements in committed code
- [ ] RLS policies exist for any new Supabase table
- [ ] New env vars are added to `.env.example`
- [ ] `PROJECT.md` is updated if schema or routes changed
