# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation

**IMPORTANT:** Before generating any code, ALWAYS read and follow the relevant docs files in the `docs/` directory first. These documents define the project's coding standards and must be adhered to at all times.

- `docs/ui.md` - UI component and date formatting standards

## Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (flat config, eslint.config.mjs)

## Architecture

Next.js 16 app using the App Router with TypeScript, React 19, and Tailwind CSS 4.

- `src/app/` - App Router pages and layouts
- `@/*` path alias maps to `./src/*` (configured in tsconfig.json)
- Fonts: Geist and Geist Mono loaded via `next/font/google`
- Styling: Tailwind CSS via PostCSS (`@tailwindcss/postcss`)
- ESLint: Flat config with `core-web-vitals` and `typescript` presets
- TypeScript strict mode enabled
