# Authentication Standards

This app uses [Clerk](https://clerk.com/) for all authentication. Do not use any other auth provider or custom auth solution.

## Package

Use `@clerk/nextjs` for all Clerk imports. There are two import paths:

- `@clerk/nextjs` — client-side components and providers
- `@clerk/nextjs/server` — server-side auth helpers and middleware

## Middleware

Authentication middleware **must** be defined in `src/middleware.ts` using `clerkMiddleware()` from `@clerk/nextjs/server`. This runs on every request (except static assets) and makes auth state available throughout the app.

## Provider

`ClerkProvider` **must** wrap the entire application in the root layout (`src/app/layout.tsx`). All Clerk components and hooks depend on this provider.

## Server-Side Auth

In server components, use `auth()` from `@clerk/nextjs/server` to get the current user's ID. **Always** redirect unauthenticated users — never render a protected page without checking auth first.

```tsx
// src/app/dashboard/page.tsx (server component — no "use client")
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // fetch user-scoped data and render
}
```

## UI Components

Use Clerk's built-in components for all auth UI. Do not build custom sign-in or sign-up forms.

- `SignInButton` — renders a sign-in trigger (supports `mode="modal"`)
- `SignUpButton` — renders a sign-up trigger (supports `mode="modal"`)
- `UserButton` — renders the signed-in user's avatar with a profile dropdown
- `Show` — conditionally renders children based on auth state (`when="signed-in"` or `when="signed-out"`)

```tsx
import { SignInButton, SignUpButton, UserButton, Show } from "@clerk/nextjs";

<Show when="signed-out">
  <SignInButton mode="modal" />
  <SignUpButton mode="modal" />
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

## Environment Variables

Two Clerk environment variables are **required** in `.env`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public key (safe for the browser) |
| `CLERK_SECRET_KEY` | Secret key (server-only, never expose to the client) |

## Summary

| Requirement | Rule |
|---|---|
| Auth provider | Clerk (`@clerk/nextjs`) — no other auth solution |
| Middleware | `clerkMiddleware()` in `src/middleware.ts` |
| Root provider | `ClerkProvider` in root layout |
| Server auth | `auth()` from `@clerk/nextjs/server` |
| Auth UI | Clerk built-in components only |
| Data access | Always scope queries to `userId` from `auth()` |
