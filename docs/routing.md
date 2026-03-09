# Routing Standards

## Base Route

All application routes live under `/dashboard`. The root `/` page is the public landing page only — all authenticated functionality **must** be nested under `/dashboard`.

```
src/app/
├── page.tsx                              # / (public landing page)
├── layout.tsx                            # root layout
└── dashboard/
    ├── page.tsx                          # /dashboard
    └── workout/
        ├── new/
        │   └── page.tsx                  # /dashboard/workout/new
        └── [workoutId]/
            └── page.tsx                  # /dashboard/workout/:workoutId
```

## Route Protection

All `/dashboard` routes are **protected** — only authenticated users may access them.

### Middleware

Route protection is handled in `src/middleware.ts` using Clerk's `clerkMiddleware()` with `createRouteMatcher`. The middleware must restrict all `/dashboard(.*)` routes to signed-in users and redirect unauthenticated visitors.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Server-Side Auth Check

In addition to middleware protection, every `/dashboard` server component **must** verify the user with `auth()` from `@clerk/nextjs/server` and redirect to `/` if unauthenticated. See `docs/auth.md` for details.

## Adding New Routes

When adding a new route:

1. Place it under `src/app/dashboard/`.
2. Middleware automatically protects it — no additional middleware config is needed.
3. Call `auth()` in the server component and redirect unauthenticated users.

## Summary

| Requirement | Rule |
|---|---|
| App routes | All under `/dashboard` |
| Public page | `/` only |
| Protection method | Clerk `clerkMiddleware()` in `src/middleware.ts` |
| Protected pattern | `/dashboard(.*)` |
| Server-side check | `auth()` + redirect in every dashboard server component |
