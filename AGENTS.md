# Agent instructions for meeting-mind

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui (`radix-maia` style).
- Single app — no monorepo, no test runner configured yet, no CI workflows.

## Package manager

Use **bun**.

- `bun install` — install deps.
- `bun dev` — start Next.js dev server with **Turbopack**.
- `bun build` — production build.
- `bun start` — production server.
- `bun lint` — ESLint.
- `bun typecheck` — `tsc --noEmit`.
- `bun format` — Prettier write on `**/*.{ts,tsx}`.

## Tailwind CSS v4

- **No `tailwind.config.ts`** — all theme config is CSS-based in `app/globals.css` via `@import "tailwindcss"` and `@theme inline`.
- PostCSS config is in `postcss.config.mjs` using `@tailwindcss/postcss`.
- `lib/utils.ts` exports `cn(...)` (combines `clsx` + `tailwind-merge`). Prettier auto-sorts Tailwind classes via `prettier-plugin-tailwindcss`; `cn` and `cva` are configured as Tailwind functions.

## shadcn/ui

- Add components: `npx shadcn@latest add <component>`
- Aliases (from `components.json`):
  - `@/components` → `components/`
  - `@/components/ui` → `components/ui/`
  - `@/lib` → `lib/`
  - `@/hooks` → `hooks/`
- Icon library: `remixicon` (`@remixicon/react`).
- Extra registries configured: `@aceternity`, `@react-bits`.

## Lint / format

- **ESLint**: flat config in `eslint.config.mjs`, uses `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`. Ignores `.next/`, `out/`, `build/`, `next-env.d.ts`.
- **Prettier** (`.prettierrc`):
  - `semi: false`
  - `singleQuote: false`
  - `tabWidth: 2`
  - `trailingComma: "es5"`
  - `printWidth: 80`

## Theme / dark mode

- `next-themes` is used with `attribute="class"` and `defaultTheme="system"`.
- Root layout has `suppressHydrationWarning` on `<html>`.
- **Global `d` hotkey toggles dark/light mode** (see `components/theme-provider.tsx`). Avoid binding `d` at the document level without checking.

## Fonts

- Loaded via `next/font/google`:
  - `Geist` → `--font-sans`
  - `Geist_Mono` → `--font-mono`
  - `Noto_Serif` → `--font-serif`
- Root layout applies `font-serif` to `<html>`.

## Entrypoints

- `app/layout.tsx` — root layout (Navbar + theme provider).
- `app/page.tsx` — landing page.
- `app/transcribe/page.tsx` — transcribe page.
