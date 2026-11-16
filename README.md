# Furbase

A management platform for animal shelters, built for a real shelter: [Tierherberge Pfaffenhofen](https://furbase.onrender.com/en). Visitors browse animals and request adoptions; staff manage animals, adoption checklists, dog-walking volunteers and incoming requests from one admin area. Available in German and English.

**Live:** [furbase.onrender.com](https://furbase.onrender.com/en) (free hosting — the first load can take up to a minute)

## Features

- **Animal catalogue** with detail pages, image upload and status tracking
- **Adoption flow** — public request form, admin review, drag-and-drop adoption checklists
- **Matcher** — a step-by-step wizard that suggests animals based on a visitor's living situation and preferences
- **Volunteer management** for dog walkers: onboarding steps, categories, contract uploads and walk scheduling
- **Admin area** for species, users, volunteers, FAQ and feedback
- Authentication, user profiles, dark mode and a locale switcher

## Tech stack

| Area | Choice |
| --- | --- |
| Web app | Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS 4, shadcn/ui |
| API | Express 5, TypeScript |
| Data | PostgreSQL 16, Drizzle ORM |
| Auth | Auth.js (NextAuth v5) |
| i18n | German / English message catalogues |
| Testing | Vitest, Playwright E2E suite (auth, adoption, admin, walks, uploads, …) |
| Tooling | pnpm workspaces, Turborepo, Husky pre-commit hooks, GitHub Actions CI |

## Project structure

```text
apps/
  web/   Next.js app (public site + admin area)
  api/   Express API
packages/
  db/    Shared Drizzle schema and database access
```

## Getting started

Requirements: Node.js, pnpm, Docker

```bash
pnpm install
docker compose up -d   # PostgreSQL on localhost:5435
pnpm dev
```

## Scripts

| Command | Does |
| --- | --- |
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
