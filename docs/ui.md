# UI Coding Standards

## Component Library

All UI components **must** come from [shadcn/ui](https://ui.shadcn.com/). Do not create custom components. If a component is needed, install it from shadcn/ui.

## Date Formatting

Use [date-fns](https://date-fns.org/) for all date formatting.

Dates must use the `do MMM yyyy` format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

```ts
import { format } from "date-fns";

format(new Date(), "do MMM yyyy"); // "7th Mar 2026"
```
