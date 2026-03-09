# Data Mutation Standards

## Server Actions Only

**ALL data mutations MUST be done via Next.js server actions.** This is a strict, non-negotiable rule.

Data mutations must **NOT** be performed via:

- Route handlers (`app/api/` routes)
- Client-side `fetch` calls
- Direct database calls in components or pages

The **only** acceptable pattern is calling server actions that internally delegate to data helper functions.

## Server Action Files

All server actions **MUST** be colocated in files named `actions.ts` alongside the page that uses them.

### Rules

1. **Every `actions.ts` file must start with `"use server";`** at the top of the file.
2. **Colocate with the consuming page** — place `actions.ts` in the same route directory as the page that calls the action.
3. **No `FormData` parameters** — all server action parameters must be explicitly typed. Never use the `FormData` type.
4. **Validate all arguments with Zod** — every server action must define a Zod schema and validate its arguments before performing any mutation.
5. **Delegate to `src/data/` helper functions** — server actions must not contain direct database calls. All database operations go through helper functions in `src/data/`.
6. **No redirects in server actions** — never call `redirect()` inside a server action. Server actions must return data (or throw errors), and the client is responsible for navigating after the action resolves. Use `router.push()` on the client side instead.

## Data Helper Functions

All database mutations **MUST** be performed through helper functions located in the `src/data/` directory.

### Rules

1. **Use Drizzle ORM exclusively** — raw SQL is never allowed. All mutations must use Drizzle's query builder.
2. **Scope every mutation to the logged-in user** — every helper function must accept or resolve the current user's ID and include it as a filter condition. A user must **never** be able to modify or delete another user's data.
3. **No direct database calls outside `src/data/`** — server actions must import from `src/data/` helpers, never import the database client directly.

## Example

### Data helper function

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(userId: string, name: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name })
    .returning();
  return workout;
}

export async function deleteWorkout(userId: string, workoutId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

### Server action

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(255),
});

export async function createWorkoutAction(params: { name: string }) {
  const validated = createWorkoutSchema.parse(params);
  const user = await getCurrentUser();
  return createWorkout(user.id, validated.name);
}
```

### Page calling the action

```tsx
// src/app/workouts/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { createWorkoutAction } from "./actions";

function NewWorkoutButton() {
  const router = useRouter();

  async function handleClick() {
    await createWorkoutAction({ name: "Morning Workout" });
    router.push("/dashboard");
  }

  return <button onClick={handleClick}>New Workout</button>;
}
```

## Summary

| Requirement | Rule |
|---|---|
| How to mutate data | Server actions only |
| Server action file | Colocated `actions.ts` in the same route directory |
| Server action params | Explicitly typed — no `FormData` |
| Argument validation | Zod schemas — validate before any mutation |
| Where to put DB calls | `src/data/` helper functions |
| ORM | Drizzle ORM — no raw SQL |
| Data access | Always scoped to the logged-in user |
| Redirects | Client-side only — never `redirect()` in server actions |
