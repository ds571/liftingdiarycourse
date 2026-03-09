# Data Fetching Standards

## Server Components Only

**ALL data fetching MUST be done in React Server Components.** This is a strict, non-negotiable rule.

Data must **NOT** be fetched via:

- Route handlers (`app/api/` routes)
- Client components (`"use client"`)
- `useEffect`, `fetch` in the browser, or any client-side data fetching library

The **only** acceptable pattern is calling data helper functions directly inside server components.

## Data Helper Functions

All database queries **MUST** be performed through helper functions located in the `src/data/` directory.

### Rules

1. **Use Drizzle ORM exclusively** — raw SQL is never allowed. All queries must use Drizzle's query builder or relational query API.
2. **Scope every query to the logged-in user** — every helper function must accept or resolve the current user's ID and include it as a filter condition. A user must **never** be able to access, modify, or delete another user's data.
3. **No direct database calls outside `src/data/`** — pages and components must import from `src/data/` helpers, never import the database client directly.

### Example

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkouts(userId: string) {
  return db.query.workouts.findMany({
    where: eq(workouts.userId, userId),
  });
}
```

```tsx
// src/app/workouts/page.tsx (server component — no "use client")
import { getWorkouts } from "@/data/workouts";
import { getCurrentUser } from "@/lib/auth";

export default async function WorkoutsPage() {
  const user = await getCurrentUser();
  const workouts = await getWorkouts(user.id);

  return <WorkoutList workouts={workouts} />;
}
```

## Summary

| Requirement | Rule |
|---|---|
| Where to fetch data | Server components only |
| Where to put queries | `src/data/` helper functions |
| ORM | Drizzle ORM — no raw SQL |
| Data access | Always scoped to the logged-in user |
