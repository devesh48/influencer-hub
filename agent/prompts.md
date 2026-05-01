# CreatorHub — Reusable Agent Prompts

Copy-paste these prompts when starting common tasks with an AI coding agent.

---

## Feature Development

### Add a new dashboard page

```
Add a new dashboard page to CreatorHub called "<PageName>".

Context:
- React 19 SPA with Vite, JavaScript (no TypeScript), Tailwind CSS
- Route goes under DashboardLayout in src/App.jsx
- Page component goes in src/features/profile/dashboard/<PageName>.jsx
- Add nav link in both src/components/layout/Sidebar.jsx and MobileSidebar.jsx
- Use the authenticated Supabase client from useSupabase() for any DB queries
- All styling must use Tailwind utility classes only

The page should: <describe what it does>
DB tables involved: <list tables>
```

---

### Connect mock data to real Supabase query

```
Replace mock data with a real Supabase query in <ComponentName>.

Context:
- The component currently imports from src/data/mockData.jsx
- Use the authenticated Supabase client: const { supabaseAuth } = useSupabase()
- The user ID comes from: const { user } = useUser() (Clerk)
- Table schema: <paste relevant table columns>
- After replacing, check if mockData.jsx is still used elsewhere before removing entries

Steps to complete:
1. Add useEffect to fetch data on mount
2. Show a loading spinner while fetching
3. Show an empty state if no data
4. Remove the mock data import if unused
```

---

### Add CRUD for a new entity

```
Build a full CRUD interface for <entity name> in CreatorHub.

Context:
- React 19, Vite, JavaScript, Tailwind CSS, Supabase
- Dashboard page at /dashboard/<entity-plural>
- Component at src/features/profile/dashboard/<Entity>Manager.jsx
- Supabase table: <table name>
- Table columns: <list columns>
- Use authenticated client from useSupabase()
- Use Clerk useUser() for the current user's ID

Required operations:
- List all user's <entities> (filter by user_id = current user)
- Create new <entity> (inline form or modal)
- Edit existing <entity> (inline or modal)
- Delete with confirmation
- Toggle is_active if the table has that column
```

---

## Bug Fixes

### Supabase query not returning data

```
Debug why a Supabase query is returning empty results in <ComponentName>.

Context:
- React 19 SPA, Supabase with Clerk JWT auth
- Two clients exist: anon (supabaseClient.js) and authenticated (SupabaseContext.jsx)
- RLS is enabled on all tables
- Auth relies on Clerk JWT template named "supabase"

Check:
1. Is the correct client being used for this query (anon vs authenticated)?
2. Is the JWT being passed in the Authorization header?
3. Do the RLS policies allow the current user to read these rows?
4. Is the query filter (eq user_id) using the correct value?
5. Is supabaseAuth available (not null) when the query runs?
```

---

### Avatar upload fails

```
Fix avatar upload in src/features/profile/dashboard/PublicProfileSettings.jsx.

Context:
- Uploads go to Supabase Storage bucket: VITE_SUPABASE_AVATARS_BUCKET env var
- Client-side compression runs before upload (400x400, JPEG 70%)
- Path format: {userId}/avatar.jpg
- Uses authenticated Supabase client with upsert: true
- Storage bucket must be public with insert/update policies for authenticated users

Check:
1. Bucket name matches env var exactly
2. Bucket exists and is set to public
3. Storage policies allow the current user to upload to their own folder
4. The blob being uploaded is a valid File/Blob object
5. Error is logged with the Supabase error message
```

---

## Code Quality

### Replace empty UI stub

```
Implement the <Button|Card|Input|Modal> component in src/components/ui/<Component>.jsx.

Context:
- Plain JavaScript React 19 component (no TypeScript)
- Style exclusively with Tailwind CSS
- Should accept standard HTML props and spread them onto the root element
- Follow existing component patterns in the codebase
- Primary color: purple-600, accent: pink-500
- Keep it simple — implement only what's needed right now, no over-engineering
```

---

### Add loading and error states

```
Add proper loading and error states to <ComponentName>.

Context:
- Currently renders immediately without a loading indicator
- Add a loading spinner while async data is being fetched
- Show a friendly error message if the Supabase query fails
- Show an empty state if the query succeeds but returns no results
- Use Tailwind for all styling (purple-600 for spinner border color)
- Do not install any new libraries
```

---

## Refactoring

### Extract repeated Supabase fetch into a custom hook

```
Extract the data fetching logic in <ComponentName> into a custom hook.

Context:
- Hook goes in src/hooks/use<EntityName>.js
- Should accept no arguments (user ID comes from useUser() internally)
- Should return: { data, loading, error, refetch }
- Use useCallback for the fetch function so it can be exposed as refetch
- Follow the pattern in src/hooks/useSupabaseAuth.js
```

---

## Database

### Add a new Supabase table

```
Add a new table <table_name> to the CreatorHub Supabase project.

Requirements:
- Write the CREATE TABLE SQL with all specified columns
- Use uuid PK with gen_random_uuid()
- Add foreign key to profiles(id) with on delete cascade if user-scoped
- Enable RLS immediately after table creation
- Write RLS policies: public read (if applicable) and owner-only write
- Update INSTRUCTIONS.md with the new SQL under the correct section
- Update PROJECT.md with the table schema
- Update agent/context.md quick reference table

Columns needed: <list columns with types>
Public readable: <yes/no>
```
